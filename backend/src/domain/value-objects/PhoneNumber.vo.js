/**
 * Value Object: PhoneNumber
 * Representa un número de teléfono válido (formato peruano)
 */

class PhoneNumber {
  constructor(value) {
    this.value = this.validate(value);
  }

  validate(phone) {
    if (!phone || typeof phone !== 'string') {
      throw new Error('Phone number must be a non-empty string');
    }

    // Remover espacios, guiones y paréntesis
    const cleaned = phone.replace(/[\s\-()]/g, '');

    // Validar formato peruano: 9 dígitos empezando con 9
    const peruRegex = /^9\d{8}$/;

    if (!peruRegex.test(cleaned)) {
      throw new Error('Invalid Peruvian phone number format (must be 9XXXXXXXX)');
    }

    return cleaned;
  }

  getValue() {
    return this.value;
  }

  equals(other) {
    if (!(other instanceof PhoneNumber)) {
      return false;
    }
    return this.value === other.value;
  }

  toString() {
    return this.value;
  }

  // Formatear para display: 987 654 321
  toFormattedString() {
    return this.value.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
}

module.exports = PhoneNumber;