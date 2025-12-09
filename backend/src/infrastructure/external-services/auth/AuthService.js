/**
 * AuthService Implementation
 * Implementa IAuthService usando JWT, Bcrypt y Redis
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const IAuthService = require('../../../domain/interfaces/services/IAuthService');
const config = require('../../config/env.config');
const { redisClient } = require('../../config/redis.config');

class AuthService extends IAuthService {
  constructor() {
    super();
    this.accessTokenSecret = config.jwt.accessTokenSecret;
    this.refreshTokenSecret = config.jwt.refreshTokenSecret;
    this.accessTokenExpiry = config.jwt.accessTokenExpiry;
    this.refreshTokenExpiry = config.jwt.refreshTokenExpiry;
    this.redisClient = redisClient;
  }

  /**
   * Generar hash de contraseña
   * @param {string} password
   * @returns {Promise<string>}
   */
  async hashPassword(password) {
    try {
      if (!password || typeof password !== 'string') {
        throw new Error('Password must be a non-empty string');
      }

      const salt = await bcrypt.genSalt(config.bcrypt.rounds);
      const hash = await bcrypt.hash(password, salt);

      return hash;
    } catch (error) {
      throw new Error(`Error hashing password: ${error.message}`);
    }
  }

  /**
   * Comparar contraseña con hash
   * @param {string} password
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  async comparePassword(password, hash) {
    try {
      if (!password || !hash) {
        throw new Error('Password and hash are required');
      }

      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      throw new Error(`Error comparing password: ${error.message}`);
    }
  }

  /**
   * Generar JWT access token
   * @param {Object} payload
   * @returns {string}
   */
  generateAccessToken(payload) {
    try {
      if (!payload || !payload.userId) {
        throw new Error('userId is required in payload');
      }

      const token = jwt.sign(
        {
          userId: payload.userId,
          email: payload.email,
          roles: payload.roles || [],
          type: 'access',
        },
        this.accessTokenSecret,
        {
          expiresIn: this.accessTokenExpiry,
          issuer: 'smart-campus',
          audience: 'smart-campus-users',
        }
      );

      return token;
    } catch (error) {
      throw new Error(`Error generating access token: ${error.message}`);
    }
  }

  /**
   * Generar JWT refresh token
   * @param {Object} payload
   * @returns {string}
   */
  generateRefreshToken(payload) {
    try {
      if (!payload || !payload.userId) {
        throw new Error('userId is required in payload');
      }

      const token = jwt.sign(
        {
          userId: payload.userId,
          type: 'refresh',
        },
        this.refreshTokenSecret,
        {
          expiresIn: this.refreshTokenExpiry,
          issuer: 'smart-campus',
          audience: 'smart-campus-users',
        }
      );

      return token;
    } catch (error) {
      throw new Error(`Error generating refresh token: ${error.message}`);
    }
  }

  /**
   * Verificar JWT token
   * @param {string} token
   * @param {string} type - 'access' o 'refresh'
   * @returns {Object}
   */
  verifyToken(token, type = 'access') {
    try {
      if (!token) {
        throw new Error('Token is required');
      }

      const secret = type === 'access' ? this.accessTokenSecret : this.refreshTokenSecret;

      const decoded = jwt.verify(token, secret, {
        issuer: 'smart-campus',
        audience: 'smart-campus-users',
      });

      // Verificar que el tipo coincida
      if (decoded.type !== type) {
        throw new Error(`Invalid token type. Expected ${type}`);
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw new Error(`Error verifying token: ${error.message}`);
    }
  }

  /**
   * Generar token de recuperación de contraseña
   * @param {string} userId - ID del usuario
   * @returns {Promise<string>} Token de recuperación
   */
  async generatePasswordResetToken(userId) {
    try {
      // 1. Validar userId
      if (!userId) {
        throw new Error('userId is required');
      }

      // 2. Generar token JWT
      const resetToken = jwt.sign(
        {
          userId,
          type: 'password_reset',
        },
        this.refreshTokenSecret,
        {
          expiresIn: '1h',
        }
      );

      // 3. Guardar en Redis con expiración de 1 hora
      const redisKey = `password_reset:${resetToken}`;

      // ✅ SINTAXIS IOREDIS: setex(key, seconds, value) - minúsculas
      await this.redisClient.setex(redisKey, 3600, userId);

      console.log(`✅ Password reset token generated for user: ${userId}`);

      // 4. Retornar token
      return resetToken;
    } catch (error) {
      console.error('❌ Error generating password reset token:', error);
      throw new Error(`Error generating password reset token: ${error.message}`);
    }
  }

  /**
   * Verificar token de recuperación de contraseña
   * @param {string} token
   * @returns {Promise<string>}
   */
  async verifyPasswordResetToken(token) {
    try {
      if (!token) {
        throw new Error('Token is required');
      }

      // Verificar JWT
      const decoded = jwt.verify(token, this.refreshTokenSecret);

      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }

      // Verificar que existe en Redis
      const userId = await this.redisClient.get(`password_reset:${token}`);

      if (!userId) {
        throw new Error('Token inválido o ya fue usado');
      }

      return userId;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Password reset token has expired');
      }
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Invalidar un token de reseteo de contraseña después de usarlo
   * @param {string} token
   * @returns {Promise<boolean>}
   */
  async invalidatePasswordResetToken(token) {
    try {
      await this.redisClient.del(`password_reset:${token}`);
      return true;
    } catch (error) {
      console.error('Error invalidating password reset token:', error);
      return false;
    }
  }

  /**
   * Invalidar token (agregar a blacklist)
   * @param {string} token
   * @returns {Promise<void>}
   */
  async invalidateToken(token) {
    try {
      if (!token) {
        throw new Error('Token is required');
      }

      // Decodificar para obtener el tiempo de expiración
      const decoded = jwt.verify(token, this.accessTokenSecret, { ignoreExpiration: true });

      // Calcular TTL hasta que expire naturalmente
      const now = Math.floor(Date.now() / 1000);
      const ttl = decoded.exp - now;

      if (ttl > 0) {
        // ✅ ioredis: setex(key, seconds, value)
        await this.redisClient.setex(`blacklist:${token}`, ttl, 'revoked');
      }

      return true;
    } catch (error) {
      throw new Error(`Error invalidating token: ${error.message}`);
    }
  }

  /**
   * Verificar si token está en blacklist
   * @param {string} token
   * @returns {Promise<boolean>}
   */
  async isTokenBlacklisted(token) {
    try {
      if (!token) {
        return false;
      }

      const result = await this.redisClient.get(`blacklist:${token}`);
      return result !== null;
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      return false;
    }
  }

  /**
   * Guardar refresh token en Redis
   * @param {string} userId
   * @param {string} refreshToken
   * @returns {Promise<void>}
   */
  async saveRefreshToken(userId, refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

      // ✅ ioredis: setex(key, seconds, value)
      await this.redisClient.setex(`refresh:${userId}`, expiresIn, refreshToken);
    } catch (error) {
      throw new Error(`Error saving refresh token: ${error.message}`);
    }
  }

  /**
   * Verificar refresh token desde Redis
   * @param {string} userId
   * @param {string} refreshToken
   * @returns {Promise<boolean>}
   */
  async verifyRefreshToken(userId, refreshToken) {
    try {
      const storedToken = await this.redisClient.get(`refresh:${userId}`);
      return storedToken === refreshToken;
    } catch (error) {
      console.error('Error verifying refresh token:', error);
      return false;
    }
  }

  /**
   * Eliminar refresh token de Redis (logout)
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async removeRefreshToken(userId) {
    try {
      await this.redisClient.del(`refresh:${userId}`);
    } catch (error) {
      console.error('Error removing refresh token:', error);
    }
  }
}

module.exports = AuthService;
