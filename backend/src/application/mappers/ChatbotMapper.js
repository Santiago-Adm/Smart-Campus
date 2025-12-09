/**
 * Chatbot Mapper
 * Transforma datos del chatbot entre capas
 */

class ChatbotMapper {
  /**
   * Mapea respuesta de mensaje procesado
   */
  static toProcessMessageResponse(data) {
    return {
      success: true,
      conversationId: data.conversationId,
      message: data.message,
      confidence: data.confidence,
      functionCalls: data.functionCalls,
      timestamp: data.timestamp,
    };
  }

  /**
   * Mapea conversación a respuesta
   */
  /**
   * Mapea conversación a respuesta
   */
  static toConversationResponse(conversation) {
    // Si conversation es un objeto plano de MongoDB, usar directamente
    const messageCount =
      typeof conversation.getMessageCount === 'function'
        ? conversation.getMessageCount()
        : conversation.messages?.length || 0;

    const duration =
      typeof conversation.getDuration === 'function'
        ? conversation.getDuration()
        : conversation.duration || 0;

    return {
      id: conversation.id || conversation._id?.toString(),
      userId: conversation.userId,
      messages: (conversation.messages || []).map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        functionCalls: msg.functionCalls || null,
      })),
      messageCount,
      isActive: conversation.isActive,
      isEscalated: conversation.isEscalated,
      escalatedTo: conversation.escalatedTo,
      escalatedAt: conversation.escalatedAt,
      satisfactionRating: conversation.satisfactionRating,
      duration,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  /**
   * Mapea lista de conversaciones a respuesta
   */
  static toConversationsListResponse(conversationsData) {
    return {
      success: true,
      conversations: conversationsData.conversations.map((conv) =>
        this.toConversationResponse(conv)
      ),
      total: conversationsData.total,
      page: conversationsData.page,
      totalPages: conversationsData.totalPages,
      timestamp: new Date(),
    };
  }

  /**
   * Mapea resultado de escalación
   */
  static toEscalationResponse(escalationData) {
    return {
      success: escalationData.success,
      message: escalationData.message,
      conversation: this.toConversationResponse(escalationData.conversation),
      estimatedResponseTime: escalationData.estimatedResponseTime,
      timestamp: new Date(),
    };
  }

  /**
   * Mapea información contextual
   */
  static toContextResponse(contextData) {
    return {
      success: contextData.success,
      context: {
        user: contextData.context.user,
        documents: contextData.context.documents || null,
        appointments: contextData.context.appointments || null,
        recentActivity: contextData.context.recentActivity || null,
      },
      timestamp: contextData.timestamp,
    };
  }

  /**
   * Mapea conversación cerrada
   */
  static toCloseConversationResponse(conversation) {
    const messageCount =
      typeof conversation.getMessageCount === 'function'
        ? conversation.getMessageCount()
        : conversation.messages?.length || 0;

    const duration =
      typeof conversation.getDuration === 'function'
        ? conversation.getDuration()
        : conversation.duration || 0;

    return {
      success: true,
      message: 'Conversation closed successfully',
      conversationId: conversation.id || conversation._id?.toString(),
      duration,
      messageCount,
      timestamp: new Date(),
    };
  }

  /**
   * Mapea rating de satisfacción
   */
  static toSatisfactionRatingResponse(conversation) {
    return {
      success: true,
      message: 'Satisfaction rating added successfully',
      conversationId: conversation.id,
      rating: conversation.satisfactionRating,
      timestamp: new Date(),
    };
  }

  /**
   * Mapea error a respuesta
   */
  static toErrorResponse(error) {
    return {
      success: false,
      error: {
        message: error.message || 'An error occurred',
        code: error.code || 'CHATBOT_ERROR',
      },
      timestamp: new Date(),
    };
  }

  /**
   * Mapea respuesta de éxito genérica
   */
  static toSuccessResponse(data, message = 'Operation successful') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date(),
    };
  }
}

module.exports = ChatbotMapper;
