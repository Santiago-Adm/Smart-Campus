// src/domain/value-objects/Address.vo.js

/**
 * Value Object: Address
 * Representa una dirección completa
 * Puede inicializarse con un string simple o un objeto detallado
 */

class Address {
  constructor(data) {
    // CASO 1: Se pasa un string simple (ej: "Calle Test 123, Ayacucho")
    if (typeof data === 'string') {
      this._initFromString(data);
    }
    // CASO 2: Se pasa un objeto con propiedades
    else if (typeof data === 'object' && data !== null) {
      this._initFromObject(data);
    }
    // CASO 3: Dato inválido
    else {
      throw new Error('Address must be initialized with a string or object');
    }
  }

  /**
   * Inicializar desde string simple
   * @private
   */
  _initFromString(addressString) {
    const trimmed = addressString.trim();

    if (trimmed.length < 5) {
      throw new Error('Address must be at least 5 characters long');
    }

    // Guardar el string completo en street
    this.street = trimmed;
    this.city = null;
    this.state = null;
    this.country = 'Perú'; // Default
    this.zipCode = null;
  }

  /**
   * Inicializar desde objeto
   * @private
   */
  _initFromObject(data) {
    this.street = this.validateStreet(data.street);
    this.city = this.validateCity(data.city);
    this.state = this.validateState(data.state);
    this.country = this.validateCountry(data.country);
    this.zipCode = data.zipCode || null;
  }

  // ============================================
  // VALIDACIONES
  // ============================================

  validateStreet(street) {
    if (!street || typeof street !== 'string' || street.trim().length < 5) {
      throw new Error('Street must be at least 5 characters long');
    }
    return street.trim();
  }

  validateCity(city) {
    if (!city || typeof city !== 'string' || city.trim().length < 2) {
      throw new Error('City must be at least 2 characters long');
    }
    return city.trim();
  }

  validateState(state) {
    if (!state || typeof state !== 'string' || state.trim().length < 2) {
      throw new Error('State must be at least 2 characters long');
    }
    return state.trim();
  }

  validateCountry(country) {
    if (!country || typeof country !== 'string' || country.trim().length < 2) {
      throw new Error('Country must be at least 2 characters long');
    }
    return country.trim();
  }

  // ============================================
  // MÉTODOS PÚBLICOS
  // ============================================

  /**
   * Obtiene la dirección completa como string
   */
  getFullAddress() {
    const parts = [this.street];

    if (this.city) parts.push(this.city);
    if (this.state) parts.push(this.state);
    if (this.country && this.country !== 'Perú') parts.push(this.country);
    if (this.zipCode) parts.push(this.zipCode);

    return parts.filter(Boolean).join(', ');
  }

  /**
   * Convierte a objeto plano
   */
  toObject() {
    return {
      street: this.street,
      city: this.city,
      state: this.state,
      country: this.country,
      zipCode: this.zipCode,
      fullAddress: this.getFullAddress(),
    };
  }

  /**
   * Convierte a string
   */
  toString() {
    return this.getFullAddress();
  }

  /**
   * Compara con otra dirección
   */
  equals(other) {
    if (!(other instanceof Address)) {
      return false;
    }
    return (
      this.street === other.street &&
      this.city === other.city &&
      this.state === other.state &&
      this.country === other.country &&
      this.zipCode === other.zipCode
    );
  }
}

module.exports = Address;
