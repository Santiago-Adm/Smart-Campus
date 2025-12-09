/**
 * Chatbot Controller
 * Maneja endpoints del asistente virtual inteligente
 */

const ProcessMessageDto = require('../../../application/dtos/chatbot/ProcessMessageDto');
const EscalateConversationDto = require('../../../application/dtos/chatbot/EscalateConversationDto');
const GetContextDto = require('../../../application/dtos/chatbot/GetContextDto');
const ChatbotMapper = require('../../../application/mappers/ChatbotMapper');

class ChatbotController {
  constructor({
    processMessageUseCase,
    getContextualInfoUseCase,
    escalateToHumanUseCase,
    conversationRepository,
  }) {
    this.processMessageUseCase = processMessageUseCase;
    this.getContextualInfoUseCase = getContextualInfoUseCase;
    this.escalateToHumanUseCase = escalateToHumanUseCase;
    this.conversationRepository = conversationRepository;
  }

  /**
   * POST /api/chatbot/message
   * Procesar mensaje del usuario
   */
  async processMessage(req, res) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
          timestamp: new Date(),
        });
      }

      const messageDto = new ProcessMessageDto({
        userId,
        message: req.body.message,
        conversationId: req.body.conversationId || null,
      });

      const result = await this.processMessageUseCase.execute(messageDto.toObject());

      const response = ChatbotMapper.toProcessMessageResponse(result);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in processMessage:', error);
      const response = ChatbotMapper.toErrorResponse(error);
      return res.status(400).json(response);
    }
  }

  /**
   * GET /api/chatbot/conversations
   * Obtener conversaciones del usuario
   */
  async getConversations(req, res) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
          timestamp: new Date(),
        });
      }

      const { isActive, page = 1, limit = 20 } = req.query;

      const filters = {
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        limit: parseInt(limit, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      };

      const conversationsData = await this.conversationRepository.findByUserId(userId, filters);

      const response = ChatbotMapper.toConversationsListResponse({
        ...conversationsData,
        page: parseInt(page, 10),
        totalPages: Math.ceil(conversationsData.total / parseInt(limit, 10)),
      });

      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in getConversations:', error);
      const response = ChatbotMapper.toErrorResponse(error);
      return res.status(400).json(response);
    }
  }

  /**
   * GET /api/chatbot/conversations/:id
   * Obtener conversación específica
   */
  async getConversation(req, res) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
          timestamp: new Date(),
        });
      }

      const conversation = await this.conversationRepository.findById(id);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: { message: 'Conversation not found' },
          timestamp: new Date(),
        });
      }

      // Verificar que la conversación pertenece al usuario
      if (conversation.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'Access denied to this conversation' },
          timestamp: new Date(),
        });
      }

      const response = {
        success: true,
        conversation: ChatbotMapper.toConversationResponse(conversation),
        timestamp: new Date(),
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in getConversation:', error);
      const response = ChatbotMapper.toErrorResponse(error);
      return res.status(400).json(response);
    }
  }

  /**
   * POST /api/chatbot/escalate
   * Escalar conversación a soporte humano
   */
  async escalateConversation(req, res) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
          timestamp: new Date(),
        });
      }

      const escalateDto = new EscalateConversationDto({
        conversationId: req.body.conversationId,
        userId,
        reason: req.body.reason || null,
        priority: req.body.priority || 'MEDIUM',
      });

      const result = await this.escalateToHumanUseCase.execute(escalateDto.toObject());

      const response = ChatbotMapper.toEscalationResponse(result);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in escalateConversation:', error);
      const response = ChatbotMapper.toErrorResponse(error);
      return res.status(400).json(response);
    }
  }

  /**
   * DELETE /api/chatbot/conversations/:id
   * Cerrar conversación
   */
  async closeConversation(req, res) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
          timestamp: new Date(),
        });
      }

      // Cerrar conversación (usar método close del repository)
      const conversation = await this.conversationRepository.close(id);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: { message: 'Conversation not found' },
          timestamp: new Date(),
        });
      }

      // Verificar que pertenece al usuario
      if (conversation.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'Access denied to this conversation' },
          timestamp: new Date(),
        });
      }

      const response = ChatbotMapper.toCloseConversationResponse(conversation);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in closeConversation:', error);
      const response = ChatbotMapper.toErrorResponse(error);
      return res.status(400).json(response);
    }
  }

  /**
   * GET /api/chatbot/context
   * Obtener información contextual del usuario
   */
  async getContext(req, res) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
          timestamp: new Date(),
        });
      }

      const contextDto = new GetContextDto({
        userId,
        contextType: req.query.contextType || 'full',
      });

      const result = await this.getContextualInfoUseCase.execute(contextDto.toObject());

      const response = ChatbotMapper.toContextResponse(result);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in getContext:', error);
      const response = ChatbotMapper.toErrorResponse(error);
      return res.status(400).json(response);
    }
  }
}

module.exports = ChatbotController;
