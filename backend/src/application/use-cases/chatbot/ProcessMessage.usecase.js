/**
 * ProcessMessage Use Case
 * Procesa un mensaje del usuario y genera una respuesta del chatbot
 */

const Conversation = require('../../../domain/entities/Conversation.entity');

class ProcessMessageUseCase {
  constructor({
    conversationRepository,
    geminiService,
    contextBuilderService,
    documentRepository,
    appointmentRepository,
    resourceRepository,
    scenarioRepository,
    eventBus,
  }) {
    this.conversationRepository = conversationRepository;
    this.geminiService = geminiService;
    this.contextBuilderService = contextBuilderService;
    this.documentRepository = documentRepository;
    this.appointmentRepository = appointmentRepository;
    this.resourceRepository = resourceRepository;
    this.scenarioRepository = scenarioRepository;
    this.eventBus = eventBus;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} data - Datos del mensaje
   * @returns {Promise<Object>} Respuesta del chatbot
   */
  async execute({ userId, message, conversationId = null }) {
    try {
      console.log(`💬 Processing message from user: ${userId}`);

      // 1. Validar mensaje
      if (!message || message.trim().length === 0) {
        throw new Error('Message cannot be empty');
      }

      // 2. Obtener o crear conversación
      const conversation = await this._getOrCreateConversation(userId, conversationId);

      // 3. Agregar mensaje del usuario
      conversation.addUserMessage(message);
      await this.conversationRepository.update(conversation.id, {
        messages: conversation.messages,
        updatedAt: new Date(),
      });

      // 4. Construir contexto del usuario
      const userContext = await this.contextBuilderService.buildUserContext(userId);

      // 5. Generar respuesta con Gemini
      const geminiResponse = await this.geminiService.generateChatResponse(
        message,
        conversation.messages,
        userContext.user
      );

      // 6. Ejecutar function calls si existen
      let enrichedResponse = geminiResponse.message;
      if (geminiResponse.functionCalls && geminiResponse.functionCalls.length > 0) {
        enrichedResponse = await this._executeFunctionCalls(
          geminiResponse.functionCalls,
          userId,
          geminiResponse.message
        );
      }

      // 7. Agregar respuesta del asistente
      conversation.addAssistantMessage(enrichedResponse, geminiResponse.functionCalls);
      await this.conversationRepository.update(conversation.id, {
        messages: conversation.messages,
        updatedAt: new Date(),
      });

      // 8. Publicar evento
      this.eventBus.publish('MESSAGE_PROCESSED', {
        conversationId: conversation.id,
        userId,
        messageCount: conversation.getMessageCount(),
        timestamp: new Date(),
      });

      console.log('✅ Message processed successfully');

      return {
        conversationId: conversation.id,
        message: enrichedResponse,
        confidence: geminiResponse.confidence,
        functionCalls: geminiResponse.functionCalls,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('❌ Error processing message:', error);
      throw new Error(`Error processing message: ${error.message}`);
    }
  }

  /**
   * Obtener o crear conversación
   * @private
   */
  async _getOrCreateConversation(userId, conversationId) {
    try {
      // Si se proporciona conversationId, intentar obtenerla
      if (conversationId) {
        const existing = await this.conversationRepository.findById(conversationId);
        if (existing && existing.userId === userId) {
          return existing;
        }
      }

      // Buscar conversación activa del usuario
      const activeConversation = await this.conversationRepository.findActiveByUserId(userId);

      if (activeConversation) {
        return activeConversation;
      }

      // Crear nueva conversación
      const newConversation = new Conversation({
        userId,
        messages: [],
        context: {},
      });

      return await this.conversationRepository.create(newConversation);
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
      throw error;
    }
  }

  /**
   * Ejecutar function calls
   * @private
   */
  async _executeFunctionCalls(functionCalls, userId, originalMessage) {
    let enrichedMessage = originalMessage;

    // eslint-disable-next-line no-restricted-syntax
    for (const funcCall of functionCalls) {
      try {
        console.log(`🔧 Executing function: ${funcCall.name}`);

        let functionResult = null;

        switch (funcCall.name) {
          case 'get_documents':
            // eslint-disable-next-line no-await-in-loop
            functionResult = await this._getDocuments(userId);
            break;

          case 'get_appointments':
            // eslint-disable-next-line no-await-in-loop
            functionResult = await this._getAppointments(userId);
            break;

          case 'search_resources':
            // eslint-disable-next-line no-await-in-loop
            functionResult = await this._searchResources();
            break;

          case 'get_simulations':
            // eslint-disable-next-line no-await-in-loop
            functionResult = await this._getSimulations();
            break;

          case 'escalate_to_human':
            // Este se maneja en otro use case
            functionResult = { message: 'Preparando escalación a soporte humano...' };
            break;

          default:
            console.warn(`Unknown function: ${funcCall.name}`);
            // eslint-disable-next-line no-continue
            continue;
        }

        // Agregar resultado al mensaje
        if (functionResult && functionResult.message) {
          enrichedMessage += `\n\n${functionResult.message}`;
        }

        funcCall.executed = true;
      } catch (error) {
        console.error(`Error executing function ${funcCall.name}:`, error);
        funcCall.executed = false;
      }
    }

    return enrichedMessage;
  }

  /**
   * Obtener documentos del usuario
   * @private
   */
  async _getDocuments(userId) {
    try {
      const { documents, total } = await this.documentRepository.findByUserId(userId, {
        limit: 5,
      });

      if (total === 0) {
        return {
          message: '\n📄 No tienes documentos subidos aún.',
        };
      }

      const pending = documents.filter((doc) => doc.status === 'PENDING').length;
      const approved = documents.filter((doc) => doc.status === 'APPROVED').length;
      const rejected = documents.filter((doc) => doc.status === 'REJECTED').length;

      let message = `\n📄 **Tus Documentos:**\n`;
      message += `- Total: ${total} documentos\n`;
      message += `- Aprobados: ${approved} ✅\n`;
      message += `- Pendientes: ${pending} ⏳\n`;
      if (rejected > 0) {
        message += `- Rechazados: ${rejected} ❌\n`;
      }

      return { message };
    } catch (error) {
      console.error('Error getting documents:', error);
      return { message: '\nNo pude obtener tus documentos en este momento.' };
    }
  }

  /**
   * Obtener citas del usuario
   * @private
   */
  async _getAppointments(userId) {
    try {
      const appointments = await this.appointmentRepository.findByUser(userId, { limit: 10 });

      if (appointments.length === 0) {
        return {
          message: '\n📅 No tienes citas agendadas.',
        };
      }

      const upcoming = appointments.filter(
        (apt) => apt.status === 'SCHEDULED' && new Date(apt.scheduledAt) > new Date()
      );

      let message = `\n📅 **Tus Citas:**\n`;
      message += `- Total: ${appointments.length} citas\n`;
      message += `- Próximas: ${upcoming.length}\n`;

      if (upcoming.length > 0) {
        const nextApt = upcoming[0];
        const dateStr = new Date(nextApt.scheduledAt).toLocaleDateString('es-PE');
        const timeStr = new Date(nextApt.scheduledAt).toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
        });
        message += `\n**Próxima cita:** ${dateStr} a las ${timeStr}`;
      }

      return { message };
    } catch (error) {
      console.error('Error getting appointments:', error);
      return { message: '\nNo pude obtener tus citas en este momento.' };
    }
  }

  /**
   * Buscar recursos en biblioteca
   * @private
   */
  async _searchResources() {
    try {
      const { resources, total } = await this.resourceRepository.findAll({ limit: 5 });

      if (total === 0) {
        return {
          message: '\n📚 No hay recursos disponibles en este momento.',
        };
      }

      let message = `\n📚 **Biblioteca Virtual:**\n`;
      message += `- Total de recursos: ${total}\n`;
      message += `\nRecursos destacados:\n`;

      resources.slice(0, 3).forEach((resource, index) => {
        message += `${index + 1}. ${resource.title} (${resource.category})\n`;
      });

      return { message };
    } catch (error) {
      console.error('Error searching resources:', error);
      return { message: '\nNo pude buscar recursos en este momento.' };
    }
  }

  /**
   * Obtener simulaciones disponibles
   * @private
   */
  async _getSimulations() {
    try {
      const scenarios = await this.scenarioRepository.findPublicScenarios({ limit: 5 });

      if (scenarios.length === 0) {
        return {
          message: '\n🥽 No hay simulaciones disponibles en este momento.',
        };
      }

      let message = `\n🥽 **Simulaciones AR Disponibles:**\n`;
      message += `- Total: ${scenarios.length} simulaciones\n\n`;

      scenarios.slice(0, 3).forEach((scenario, index) => {
        message += `${index + 1}. ${scenario.title} (${scenario.difficulty})\n`;
      });

      return { message };
    } catch (error) {
      console.error('Error getting simulations:', error);
      return { message: '\nNo pude obtener las simulaciones en este momento.' };
    }
  }
}

module.exports = ProcessMessageUseCase;
