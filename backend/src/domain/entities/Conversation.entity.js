/**
 * Entity: Conversation
 * Representa una conversación del chatbot con un usuario
 */

class Conversation {
  constructor({
    id = null,
    userId,
    messages = [],
    context = {},
    isActive = true,
    isEscalated = false,
    escalatedTo = null,
    escalatedAt = null,
    satisfactionRating = null,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.userId = this.validateUserId(userId);
    this.messages = this.validateMessages(messages);
    this.context = context || {};
    this.isActive = Boolean(isActive);
    this.isEscalated = Boolean(isEscalated);
    this.escalatedTo = escalatedTo;
    this.escalatedAt = escalatedAt ? new Date(escalatedAt) : null;
    this.satisfactionRating = satisfactionRating;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  }

  // ============================================
  // VALIDACIONES
  // ============================================

  validateUserId(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return userId;
  }

  validateMessages(messages) {
    if (!Array.isArray(messages)) {
      throw new Error('Messages must be an array');
    }

    messages.forEach((msg, index) => {
      if (!msg.role || !msg.content) {
        throw new Error(`Message ${index + 1} must have role and content`);
      }
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        throw new Error(`Invalid message role: ${msg.role}`);
      }
    });

    return messages;
  }

  // ============================================
  // MÉTODOS DE NEGOCIO
  // ============================================

  /**
   * Agregar mensaje del usuario
   */
  addUserMessage(content) {
    if (!content || typeof content !== 'string') {
      throw new Error('Message content is required');
    }

    this.messages.push({
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    });

    this.updatedAt = new Date();
  }

  /**
   * Agregar respuesta del asistente
   */
  addAssistantMessage(content, functionCalls = null) {
    if (!content || typeof content !== 'string') {
      throw new Error('Message content is required');
    }

    const message = {
      role: 'assistant',
      content: content.trim(),
      timestamp: new Date(),
    };

    if (functionCalls) {
      message.functionCalls = functionCalls;
    }

    this.messages.push(message);
    this.updatedAt = new Date();
  }

  /**
   * Agregar mensaje del sistema
   */
  addSystemMessage(content) {
    if (!content || typeof content !== 'string') {
      throw new Error('Message content is required');
    }

    this.messages.push({
      role: 'system',
      content: content.trim(),
      timestamp: new Date(),
    });

    this.updatedAt = new Date();
  }

  /**
   * Actualizar contexto
   */
  updateContext(updates) {
    this.context = {
      ...this.context,
      ...updates,
    };
    this.updatedAt = new Date();
  }

  /**
   * Escalar a humano
   */
  escalate(agentId, reason = null) {
    if (this.isEscalated) {
      throw new Error('Conversation is already escalated');
    }

    this.isEscalated = true;
    this.escalatedTo = agentId;
    this.escalatedAt = new Date();
    this.updatedAt = new Date();

    if (reason) {
      this.addSystemMessage(`Conversation escalated to human agent. Reason: ${reason}`);
    }
  }

  /**
   * Resolver escalación
   */
  resolveEscalation() {
    if (!this.isEscalated) {
      throw new Error('Conversation is not escalated');
    }

    this.isEscalated = false;
    this.updatedAt = new Date();
    this.addSystemMessage('Escalation resolved. Conversation returned to chatbot.');
  }

  /**
   * Cerrar conversación
   */
  close() {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Reabrir conversación
   */
  reopen() {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Agregar calificación de satisfacción
   */
  addSatisfactionRating(rating) {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    this.satisfactionRating = rating;
    this.updatedAt = new Date();
  }

  /**
   * Obtener último mensaje
   */
  getLastMessage() {
    return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
  }

  /**
   * Obtener mensajes del usuario
   */
  getUserMessages() {
    return this.messages.filter((msg) => msg.role === 'user');
  }

  /**
   * Obtener mensajes del asistente
   */
  getAssistantMessages() {
    return this.messages.filter((msg) => msg.role === 'assistant');
  }

  /**
   * Contar mensajes
   */
  getMessageCount() {
    return this.messages.length;
  }

  /**
   * Obtener duración de la conversación
   */
  getDuration() {
    if (this.messages.length === 0) return 0;

    const firstMessage = this.messages[0].timestamp;
    const lastMessage = this.messages[this.messages.length - 1].timestamp;

    return Math.floor((new Date(lastMessage) - new Date(firstMessage)) / 1000); // segundos
  }

  /**
   * Convertir a objeto plano
   */
  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      messages: this.messages,
      messageCount: this.getMessageCount(),
      context: this.context,
      isActive: this.isActive,
      isEscalated: this.isEscalated,
      escalatedTo: this.escalatedTo,
      escalatedAt: this.escalatedAt,
      satisfactionRating: this.satisfactionRating,
      duration: this.getDuration(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Conversation;
