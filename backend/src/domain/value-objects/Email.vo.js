/**
 * Value Object: Email
 * Representa un email válido e inmutable
 */

class Email {
  constructor(value) {
    this.value = this.validate(value);
  }

  validate(email) {
    if (!email || typeof email !== 'string') {
      throw new Error('Email must be a non-empty string');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      throw new Error('Invalid email format');
    }

    return normalizedEmail;
  }

  getValue() {
    return this.value;
  }

  equals(other) {
    if (!(other instanceof Email)) {
      return false;
    }
    return this.value === other.value;
  }

  toString() {
    return this.value;
  }

  // Validar dominio institucional (opcional)
  isInstitutional() {
    return this.value.endsWith('@smartcampus.edu.pe');
  }
}

module.exports = Email;