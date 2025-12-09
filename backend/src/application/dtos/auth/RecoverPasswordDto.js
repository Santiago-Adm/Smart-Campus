/**
 * Recover Password DTO
 * Responsabilidad: Estructurar y validar solicitud de recuperación de contraseña
 */

class RecoverPasswordDto {
  constructor(data) {
    this.email = data.email;
  }

  /**
   * Crea un DTO desde el body de una request HTTP
   * @param {Object} req - Express request object
   * @returns {RecoverPasswordDto}
   */
  static fromRequest(req) {
    return new RecoverPasswordDto(req.body);
  }

  /**
   * Valida los campos del DTO
   * @throws {Error} Si hay errores de validación
   */
  validate() {
    const errors = [];

    // Validar email
    if (!this.email) {
      errors.push('Email es requerido');
    } else if (!this._isValidEmail(this.email)) {
      errors.push('Email debe tener un formato válido');
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }
  }

  /**
   * Sanitiza los datos
   */
  sanitize() {
    this.email = this.email ? this.email.toLowerCase().trim() : null;
  }

  /**
   * Valida formato de email
   * @private
   */
  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Convierte el DTO a objeto plano
   */
  toObject() {
    return {
      email: this.email,
    };
  }
}

module.exports = RecoverPasswordDto;
