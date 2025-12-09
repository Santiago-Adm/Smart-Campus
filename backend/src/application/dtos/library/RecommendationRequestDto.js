/**
 * DTO: Recommendation Request
 * Valida parámetros para solicitar recomendaciones
 */

class RecommendationRequestDto {
  constructor({ userId, limit = 10, strategy = 'popular' }) {
    this.userId = userId;
    this.limit = parseInt(limit, 10);
    this.strategy = strategy;
  }

  /**
   * Validar datos
   */
  validate() {
    const errors = [];

    // Validar userId
    if (!this.userId) {
      errors.push('User ID is required');
    }

    // Validar limit
    if (this.limit < 1 || this.limit > 50) {
      errors.push('Limit must be between 1 and 50');
    }

    // Validar strategy
    const validStrategies = ['popular', 'rating', 'personalized'];
    if (!validStrategies.includes(this.strategy)) {
      errors.push(`Strategy must be one of: ${validStrategies.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

module.exports = RecommendationRequestDto;
