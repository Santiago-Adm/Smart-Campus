/**
 * Auth Middleware
 * Verifica que el request tenga un token JWT válido
 * Extrae la información del usuario y la agrega a req.user
 */

const jwt = require('jsonwebtoken');
const config = require('../../../infrastructure/config/env.config');

/**
 * Middleware para proteger rutas con JWT
 */
// eslint-disable-next-line consistent-return
const authenticate = async (req, res, next) => {
  try {
    // 1. Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token de autenticación no proporcionado',
          code: 'NO_TOKEN',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Verificar formato "Bearer TOKEN"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Formato de token inválido. Use: Bearer <token>',
          code: 'INVALID_TOKEN_FORMAT',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const token = parts[1];

    // 3. Verificar token con JWT
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.accessTokenSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Token expirado',
            code: 'TOKEN_EXPIRED',
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Token inválido',
            code: 'INVALID_TOKEN',
          },
          timestamp: new Date().toISOString(),
        });
      }

      throw error;
    }

    // 4. TODO: Verificar si el token está en blacklist (Redis)
    // const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    // if (isBlacklisted) {
    //   return res.status(401).json({
    //     success: false,
    //     error: {
    //       message: 'Token revocado',
    //       code: 'TOKEN_REVOKED',
    //     },
    //   });
    // }

    // 5. Agregar información del usuario al request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
    };

    // 6. Continuar al siguiente middleware
    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      },
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {Array<string>} allowedRoles - Array de roles permitidos
 */
// eslint-disable-next-line consistent-return
const authorize = (allowedRoles) => (req, res, next) => {
  // Este middleware debe ejecutarse después de authenticate
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Verificar si el usuario tiene alguno de los roles permitidos
  const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

  if (!hasRole) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'No tiene permisos para realizar esta acción',
        code: 'FORBIDDEN',
        requiredRoles: allowedRoles,
        userRoles: req.user.roles,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Usuario tiene los permisos necesarios
  next();
};

module.exports = {
  authenticate,
  authorize,
};
