/**
 * Reset Password DTO
 * Responsabilidad: Estructurar y validar reseteo de contraseña con token
 */

class ResetPasswordDto {
  constructor(data) {
    this.token = data.token;
    this.newPassword = data.newPassword;
    this.confirmPassword = data.confirmPassword;
  }

  /**
   * Crea un DTO desde el body de una request HTTP
   * @param {Object} req - Express request object
   * @returns {ResetPasswordDto}
   */
  static fromRequest(req) {
    return new ResetPasswordDto({
      token: req.body.token || req.query.token || req.params.token,
      newPassword: req.body.newPassword,
      confirmPassword: req.body.confirmPassword,
    });
  }

  /**
   * Valida los campos del DTO
   * @throws {Error} Si hay errores de validación
   */
  validate() {
    const errors = [];

    // Validar token
    if (!this.token) {
      errors.push('Token es requerido');
    } else if (this.token.length < 10) {
      errors.push('Token inválido');
    }

    // Validar newPassword
    if (!this.newPassword) {
      errors.push('Nueva contraseña es requerida');
    } else {
      const passwordErrors = this._validatePassword(this.newPassword);
      errors.push(...passwordErrors);
    }

    // Validar confirmPassword
    if (!this.confirmPassword) {
      errors.push('Confirmación de contraseña es requerida');
    } else if (this.newPassword !== this.confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }
  }

  /**
   * Sanitiza los datos
   */
  sanitize() {
    this.token = this.token ? this.token.trim() : null;
  }

  /**
   * Valida complejidad de contraseña
   * @private
   */
  _validatePassword(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('Contraseña debe tener al menos 8 caracteres');
    }

    if (password.length > 100) {
      errors.push('Contraseña no puede exceder 100 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Contraseña debe contener al menos una mayúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Contraseña debe contener al menos una minúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('Contraseña debe contener al menos un número');
    }

    return errors;
  }

  /**
   * Convierte el DTO a objeto plano (sin confirmPassword)
   */
  toObject() {
    return {
      token: this.token,
      newPassword: this.newPassword,
    };
  }
}

module.exports = ResetPasswordDto;
