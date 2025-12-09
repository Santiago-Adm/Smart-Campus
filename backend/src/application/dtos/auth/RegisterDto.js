/**
 * Register DTO
 * Responsabilidad: Estructurar y validar datos de registro de usuario
 */

class RegisterDto {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.dni = data.dni;
    this.phone = data.phone || null;
    this.dateOfBirth = data.dateOfBirth || null;
  }

  /**
   * Crea un DTO desde el body de una request HTTP
   * @param {Object} req - Express request object
   * @returns {RegisterDto}
   */
  static fromRequest(req) {
    return new RegisterDto(req.body);
  }

  /**
   * Valida todos los campos del DTO
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
    } else {
      const passwordErrors = this._validatePassword(this.password);
      errors.push(...passwordErrors);
    }

    // Validar firstName
    if (!this.firstName) {
      errors.push('Nombre es requerido');
    } else if (this.firstName.length < 2) {
      errors.push('Nombre debe tener al menos 2 caracteres');
    } else if (this.firstName.length > 50) {
      errors.push('Nombre no puede exceder 50 caracteres');
    }

    // Validar lastName
    if (!this.lastName) {
      errors.push('Apellido es requerido');
    } else if (this.lastName.length < 2) {
      errors.push('Apellido debe tener al menos 2 caracteres');
    } else if (this.lastName.length > 50) {
      errors.push('Apellido no puede exceder 50 caracteres');
    }

    // Validar DNI
    if (!this.dni) {
      errors.push('DNI es requerido');
    } else if (!this._isValidDNI(this.dni)) {
      errors.push('DNI debe tener 8 dígitos numéricos');
    }

    // Validar phone (opcional)
    if (this.phone && !this._isValidPhone(this.phone)) {
      errors.push('Teléfono debe tener 9 dígitos y comenzar con 9');
    }

    // Validar dateOfBirth (opcional)
    if (this.dateOfBirth && !this._isValidDate(this.dateOfBirth)) {
      errors.push('Fecha de nacimiento inválida');
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }
  }

  /**
   * Sanitiza los datos (normalización)
   */
  sanitize() {
    this.email = this.email ? this.email.toLowerCase().trim() : null;
    this.firstName = this.firstName ? this.firstName.trim() : null;
    this.lastName = this.lastName ? this.lastName.trim() : null;
    this.dni = this.dni ? this.dni.trim() : null;
    this.phone = this.phone ? this.phone.trim() : null;
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
   * Valida DNI peruano (8 dígitos)
   * @private
   */
  _isValidDNI(dni) {
    return /^\d{8}$/.test(dni);
  }

  /**
   * Valida teléfono peruano (9 dígitos, empieza con 9)
   * @private
   */
  _isValidPhone(phone) {
    return /^9\d{8}$/.test(phone);
  }

  /**
   * Valida formato de fecha
   * @private
   */
  _isValidDate(dateString) {
    const date = new Date(dateString);
    // eslint-disable-next-line no-restricted-globals
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Convierte el DTO a objeto plano
   */
  toObject() {
    return {
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      dni: this.dni,
      phone: this.phone,
      dateOfBirth: this.dateOfBirth,
    };
  }
}

module.exports = RegisterDto;
