/**
 * Refresh Token DTO
 * Responsabilidad: Estructurar y validar solicitud de renovación de token
 */

class RefreshTokenDto {
  constructor(data) {
    this.refreshToken = data.refreshToken;
  }

  /**
   * Crea un DTO desde el body de una request HTTP
   * @param {Object} req - Express request object
   * @returns {RefreshTokenDto}
   */
  static fromRequest(req) {
    return new RefreshTokenDto({
      refreshToken: req.body.refreshToken || req.headers['x-refresh-token'],
    });
  }

  /**
   * Valida los campos del DTO
   * @throws {Error} Si hay errores de validación
   */
  validate() {
    const errors = [];

    // Validar refreshToken
    if (!this.refreshToken) {
      errors.push('Refresh token es requerido');
    } else if (typeof this.refreshToken !== 'string') {
      errors.push('Refresh token debe ser una cadena de texto');
    } else if (this.refreshToken.length < 10) {
      errors.push('Refresh token inválido');
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }
  }

  /**
   * Sanitiza los datos
   */
  sanitize() {
    this.refreshToken = this.refreshToken ? this.refreshToken.trim() : null;
  }

  /**
   * Convierte el DTO a objeto plano
   */
  toObject() {
    return {
      refreshToken: this.refreshToken,
    };
  }
}

module.exports = RefreshTokenDto;
