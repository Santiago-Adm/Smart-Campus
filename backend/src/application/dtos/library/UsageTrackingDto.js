/**
 * DTO: Usage Tracking
 * Valida datos para registrar uso de recursos
 */

class UsageTrackingDto {
  constructor({ resourceId, userId, action, data = {} }) {
    this.resourceId = resourceId;
    this.userId = userId;
    this.action = action;
    this.data = data;
  }

  /**
   * Validar datos
   */
  validate() {
    const errors = [];

    // Validar resourceId
    if (!this.resourceId) {
      errors.push('Resource ID is required');
    }

    // Validar userId
    if (!this.userId) {
      errors.push('User ID is required');
    }

    // Validar action
    const validActions = ['download', 'rate', 'view'];
    if (!validActions.includes(this.action)) {
      errors.push(`Action must be one of: ${validActions.join(', ')}`);
    }

    // Validar rating (si la acción es 'rate')
    if (this.action === 'rate') {
      const { rating } = this.data;
      if (!rating || rating < 1 || rating > 5) {
        errors.push('Rating must be between 1 and 5');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

module.exports = UsageTrackingDto;
