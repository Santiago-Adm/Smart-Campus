/**
 * Token Response DTO
 * Responsabilidad: Estructurar respuesta con tokens y datos de usuario
 * Este DTO se usa para estandarizar las respuestas de Login y RefreshToken
 */

class TokenResponseDto {
  constructor(data) {
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.tokenType = data.tokenType || 'Bearer';
    this.expiresIn = data.expiresIn || 900; // 15 minutos en segundos
    this.user = data.user || null;
    this.message = data.message || null;
  }

  /**
   * Crea un DTO desde datos de login/refresh
   * @param {Object} data - Datos de tokens y usuario
   * @returns {TokenResponseDto}
   */
  static fromLoginData(data) {
    return new TokenResponseDto({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
      message: data.message,
    });
  }

  /**
   * Valida que los tokens existan
   * @throws {Error} Si hay errores de validación
   */
  validate() {
    const errors = [];

    if (!this.accessToken) {
      errors.push('Access token es requerido');
    }

    if (!this.refreshToken) {
      errors.push('Refresh token es requerido');
    }

    if (this.user) {
      if (!this.user.id) {
        errors.push('ID de usuario es requerido');
      }
      if (!this.user.email) {
        errors.push('Email de usuario es requerido');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }
  }

  /**
   * Convierte el DTO a objeto plano para respuesta HTTP
   */
  toResponse() {
    const response = {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenType: this.tokenType,
      expiresIn: this.expiresIn,
    };

    if (this.user) {
      response.user = {
        id: this.user.id,
        email: this.user.email,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        fullName: this.user.fullName,
        roles: this.user.roles,
        isActive: this.user.isActive,
      };
    }

    if (this.message) {
      response.message = this.message;
    }

    return response;
  }

  /**
   * Crea una respuesta de éxito estandarizada
   */
  static success(data) {
    const dto = new TokenResponseDto(data);
    return {
      success: true,
      data: dto.toResponse(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Crea una respuesta de error estandarizada
   */
  static error(message, details = null) {
    return {
      success: false,
      error: {
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = TokenResponseDto;
