/**
 * Interface: IAuthService
 * Contrato para servicios de autenticación
 */

class IAuthService {
  /**
   * Generar hash de contraseña
   * @param {string} password
   * @returns {Promise<string>}
   */
  async hashPassword(_password) {
    throw new Error('Method hashPassword() must be implemented');
  }

  /**
   * Comparar contraseña con hash
   * @param {string} password
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  async comparePassword(_password, _hash) {
    throw new Error('Method comparePassword() must be implemented');
  }

  /**
   * Generar JWT access token
   * @param {Object} payload - { userId, email, roles }
   * @returns {string}
   */
  generateAccessToken(_payload) {
    throw new Error('Method generateAccessToken() must be implemented');
  }

  /**
   * Generar JWT refresh token
   * @param {Object} payload - { userId }
   * @returns {string}
   */
  generateRefreshToken(_payload) {
    throw new Error('Method generateRefreshToken() must be implemented');
  }

  /**
   * Verificar JWT token
   * @param {string} token
   * @param {string} type - 'access' | 'refresh'
   * @returns {Object} - Decoded payload
   */
  verifyToken(_token, _type) {
    throw new Error('Method verifyToken() must be implemented');
  }

  /**
   * Generar token de recuperación de contraseña
   * @param {string} userId
   * @returns {Promise<string>}
   */
  async generatePasswordResetToken(_userId) {
    throw new Error('Method generatePasswordResetToken() must be implemented');
  }

  /**
   * Verificar token de recuperación de contraseña
   * @param {string} token
   * @returns {Promise<string>} - userId
   */
  async verifyPasswordResetToken(_token) {
    throw new Error('Method verifyPasswordResetToken() must be implemented');
  }

  /**
   * Invalidar token (agregar a blacklist)
   * @param {string} token
   * @returns {Promise<void>}
   */
  async invalidateToken(_token) {
    throw new Error('Method invalidateToken() must be implemented');
  }

  /**
   * Verificar si token está en blacklist
   * @param {string} token
   * @returns {Promise<boolean>}
   */
  async isTokenBlacklisted(_token) {
    throw new Error('Method isTokenBlacklisted() must be implemented');
  }
}

module.exports = IAuthService;
