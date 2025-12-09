/**
 * Login DTO
 * Responsabilidad: Estructurar y validar credenciales de login
 */

class LoginDto {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.rememberMe = data.rememberMe || false;
  }

  /**
   * Crea un DTO desde el body de una request HTTP
   * @param {Object} req - Express request object
   * @returns {LoginDto}
   */
  static fromRequest(req) {
    return new LoginDto(req.body);
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

    // Validar password
    if (!this.password) {
      errors.push('Contraseña es requerida');
    } else if (this.password.length < 1) {
      errors.push('Contraseña no puede estar vacía');
    }

    // Validar rememberMe (debe ser booleano)
    if (typeof this.rememberMe !== 'boolean') {
      this.rememberMe = Boolean(this.rememberMe);
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
      password: this.password,
      rememberMe: this.rememberMe,
    };
  }
}

module.exports = LoginDto;
