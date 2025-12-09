/**
 * EscalateToHuman Use Case
 * Escala una conversación a soporte humano
 */

class EscalateToHumanUseCase {
  constructor({ conversationRepository, notificationService, eventBus }) {
    this.conversationRepository = conversationRepository;
    this.notificationService = notificationService;
    this.eventBus = eventBus;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} data - Datos de escalación
   * @returns {Promise<Object>} Resultado de la escalación
   */
  async execute({ conversationId, userId, reason = null, priority = 'MEDIUM' }) {
    try {
      console.log(`🆙 Escalating conversation to human: ${conversationId}`);

      // 1. Obtener conversación
      const conversation = await this.conversationRepository.findById(conversationId);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Validar que pertenece al usuario
      if (conversation.userId !== userId) {
        throw new Error('Unauthorized: Conversation does not belong to user');
      }

      // Validar que no esté ya escalada
      if (conversation.isEscalated) {
        return {
          success: false,
          message: 'Conversation is already escalated to human support',
          conversation: conversation.toObject(),
        };
      }

      // 2. Escalar conversación (agentId será null por ahora)
      conversation.escalate(null, reason);

      // 3. Agregar mensaje del sistema
      conversation.addSystemMessage(
        `Conversación escalada a soporte humano. Prioridad: ${priority}. ${reason ? `Razón: ${reason}` : ''}`
      );

      // 4. Actualizar en base de datos
      await this.conversationRepository.update(conversationId, {
        isEscalated: true,
        escalatedTo: null,
        escalatedAt: new Date(),
        messages: conversation.messages,
        context: {
          ...conversation.context,
          escalationReason: reason,
          escalationPriority: priority,
        },
      });

      // 5. Notificar a administradores (email)
      try {
        await this.notificationService.sendEmail({
          to: process.env.SUPPORT_EMAIL || 'soporte@smartcampus.edu.pe',
          subject: `[${priority}] Nueva Escalación de Chatbot`,
          html: this._buildEscalationEmail(conversation, userId, reason, priority),
        });
      } catch (emailError) {
        console.warn('Error sending escalation email:', emailError);
        // No falla el caso de uso si el email falla
      }

      // 6. Publicar evento
      this.eventBus.publish('CONVERSATION_ESCALATED', {
        conversationId,
        userId,
        reason,
        priority,
        timestamp: new Date(),
      });

      console.log('✅ Conversation escalated successfully');

      return {
        success: true,
        message: 'Tu consulta ha sido escalada a un agente humano. Te responderemos pronto.',
        conversation: conversation.toObject(),
        estimatedResponseTime: this._estimateResponseTime(priority),
      };
    } catch (error) {
      console.error('❌ Error escalating conversation:', error);
      throw new Error(`Error escalating conversation: ${error.message}`);
    }
  }

  /**
   * Construir email de escalación
   * @private
   */
  _buildEscalationEmail(conversation, userId, reason, priority) {
    const lastMessages = conversation.messages.slice(-5);

    let priorityColor = '#f59e0b'; // MEDIUM
    if (priority === 'HIGH') priorityColor = '#ef4444';
    if (priority === 'LOW') priorityColor = '#10b981';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🆙 Nueva Escalación de Chatbot</h2>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Usuario ID:</strong> ${userId}</p>
          <p><strong>Conversación ID:</strong> ${conversation.id}</p>
          <p><strong>Prioridad:</strong> <span style="color: ${priorityColor}; font-weight: bold;">${priority}</span></p>
          ${reason ? `<p><strong>Razón:</strong> ${reason}</p>` : ''}
          <p><strong>Mensajes totales:</strong> ${conversation.getMessageCount()}</p>
        </div>

        <h3>Últimos 5 mensajes:</h3>
        <div style="background-color: #ffffff; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
          ${lastMessages
            .map(
              (msg) =>
                `<p style="margin: 10px 0;">
                <strong>${msg.role === 'user' ? '👤 Usuario' : '🤖 Asistente'}:</strong>
                ${msg.content}
              </p>`
            )
            .join('')}
        </div>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">

        <p style="color: #6b7280; font-size: 12px;">
          Smart Campus Instituto - Sistema de Chatbot<br>
          Para responder, accede al panel de administración.
        </p>
      </div>
    `;
  }

  /**
   * Estimar tiempo de respuesta según prioridad
   * @private
   */
  _estimateResponseTime(priority) {
    switch (priority) {
      case 'HIGH':
        return '1-2 horas';
      case 'MEDIUM':
        return '4-6 horas';
      case 'LOW':
        return '12-24 horas';
      default:
        return '4-6 horas';
    }
  }
}

module.exports = EscalateToHumanUseCase;
