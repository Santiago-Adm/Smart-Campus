/**
 * DTO: Get Contextual Info
 * Parámetros para obtener información contextual del usuario
 */

class GetContextDto {
  constructor({ userId, contextType }) {
    this.userId = this.validateRequired(userId, 'User ID');
    this.contextType = this.validateContextType(contextType);
  }

  validateRequired(value, fieldName) {
    if (!value) {
      throw new Error(`${fieldName} is required`);
    }
    return value;
  }

  validateContextType(contextType) {
    const validTypes = ['light', 'full'];
    const type = contextType || 'full';

    if (!validTypes.includes(type)) {
      throw new Error(`Invalid context type. Must be one of: ${validTypes.join(', ')}`);
    }

    return type;
  }

  toObject() {
    return {
      userId: this.userId,
      contextType: this.contextType,
    };
  }
}

module.exports = GetContextDto;
