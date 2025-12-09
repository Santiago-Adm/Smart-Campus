/**
 * DTO: Get Alerts Request
 * Parámetros para obtener alertas del sistema
 */

class GetAlertsDto {
  constructor({ severity, category, limit }) {
    this.severity = severity ? severity.toUpperCase() : null;
    this.category = category ? category.toUpperCase() : null;
    this.limit = limit ? parseInt(limit, 10) : 50;

    this.validate();
  }

  validate() {
    // Validar severidad si se proporciona
    if (this.severity) {
      const validSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
      if (!validSeverities.includes(this.severity)) {
        throw new Error(`Invalid severity. Must be one of: ${validSeverities.join(', ')}`);
      }
    }

    // Validar categoría si se proporciona
    if (this.category) {
      const validCategories = ['USERS', 'DOCUMENTS', 'APPOINTMENTS', 'ACADEMIC'];
      if (!validCategories.includes(this.category)) {
        throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
      }
    }

    // Validar límite
    if (this.limit < 1 || this.limit > 200) {
      throw new Error('Limit must be between 1 and 200');
    }
  }

  toObject() {
    return {
      severity: this.severity,
      category: this.category,
      limit: this.limit,
    };
  }
}

module.exports = GetAlertsDto;
