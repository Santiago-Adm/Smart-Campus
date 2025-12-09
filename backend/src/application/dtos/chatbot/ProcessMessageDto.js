/**
 * DTO: Process Message
 * Parámetros para procesar un mensaje del chatbot
 */

class ProcessMessageDto {
  constructor({ userId, message, conversationId }) {
    this.userId = this.validateRequired(userId, 'User ID');
    this.message = this.validateMessage(message);
    this.conversationId = conversationId || null;

    this.validate();
  }

  validateRequired(value, fieldName) {
    if (!value) {
      throw new Error(`${fieldName} is required`);
    }
    return value;
  }

  validateMessage(message) {
    if (!message || typeof message !== 'string') {
      throw new Error('Message must be a non-empty string');
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
      throw new Error('Message cannot be empty');
    }

    if (trimmedMessage.length > 2000) {
      throw new Error('Message is too long (max 2000 characters)');
    }

    return trimmedMessage;
  }

  validate() {
    // Validación adicional: conversationId debe ser string si existe
    if (this.conversationId && typeof this.conversationId !== 'string') {
      throw new Error('Conversation ID must be a string');
    }
  }

  toObject() {
    return {
      userId: this.userId,
      message: this.message,
      conversationId: this.conversationId,
    };
  }
}

module.exports = ProcessMessageDto;
