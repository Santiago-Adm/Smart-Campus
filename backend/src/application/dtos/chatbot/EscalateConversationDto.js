/**
 * DTO: Escalate Conversation
 * Parámetros para escalar una conversación a soporte humano
 */

class EscalateConversationDto {
  constructor({ conversationId, userId, reason, priority }) {
    this.conversationId = this.validateRequired(conversationId, 'Conversation ID');
    this.userId = this.validateRequired(userId, 'User ID');
    this.reason = reason ? this.validateReason(reason) : null;
    this.priority = priority ? this.validatePriority(priority) : 'MEDIUM';

    this.validate();
  }

  validateRequired(value, fieldName) {
    if (!value) {
      throw new Error(`${fieldName} is required`);
    }
    return value;
  }

  validateReason(reason) {
    if (typeof reason !== 'string') {
      throw new Error('Reason must be a string');
    }

    const trimmedReason = reason.trim();

    if (trimmedReason.length > 500) {
      throw new Error('Reason is too long (max 500 characters)');
    }

    return trimmedReason;
  }

  validatePriority(priority) {
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
    const upperPriority = priority.toUpperCase();

    if (!validPriorities.includes(upperPriority)) {
      throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    }

    return upperPriority;
  }

  validate() {
    // Validaciones adicionales si es necesario
    if (this.conversationId === this.userId) {
      throw new Error('Conversation ID and User ID cannot be the same');
    }
  }

  toObject() {
    return {
      conversationId: this.conversationId,
      userId: this.userId,
      reason: this.reason,
      priority: this.priority,
    };
  }
}

module.exports = EscalateConversationDto;
