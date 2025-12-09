/**
 * ConversationRepository Implementation
 * Implementa IConversationRepository usando Mongoose (MongoDB)
 */

const IConversationRepository = require('../../../../domain/interfaces/repositories/IConversationRepository');
const Conversation = require('../../../../domain/entities/Conversation.entity');
const ConversationModel = require('../schemas/Conversation.schema');

class ConversationRepository extends IConversationRepository {
  /**
   * Convertir conversación MongoDB a Entity Conversation
   */
  _toEntity(conversationModel) {
    if (!conversationModel) return null;

    return new Conversation({
      id: conversationModel._id.toString(),
      userId: conversationModel.userId,
      messages: conversationModel.messages,
      context: conversationModel.context,
      isActive: conversationModel.isActive,
      isEscalated: conversationModel.isEscalated,
      escalatedTo: conversationModel.escalatedTo,
      escalatedAt: conversationModel.escalatedAt,
      satisfactionRating: conversationModel.satisfactionRating,
      createdAt: conversationModel.createdAt,
      updatedAt: conversationModel.updatedAt,
    });
  }

  /**
   * Convertir Entity Conversation a objeto plano
   */
  _toModel(conversation) {
    return {
      userId: conversation.userId,
      messages: conversation.messages,
      context: conversation.context,
      isActive: conversation.isActive,
      isEscalated: conversation.isEscalated,
      escalatedTo: conversation.escalatedTo,
      escalatedAt: conversation.escalatedAt,
      satisfactionRating: conversation.satisfactionRating,
    };
  }

  /**
   * Crear una nueva conversación
   */
  async create(conversation) {
    try {
      const conversationData = this._toModel(conversation);
      const conversationModel = await ConversationModel.create(conversationData);

      return this._toEntity(conversationModel);
    } catch (error) {
      throw new Error(`Error creating conversation: ${error.message}`);
    }
  }

  /**
   * Buscar conversación por ID
   */
  async findById(id) {
    try {
      const conversationModel = await ConversationModel.findById(id);
      return this._toEntity(conversationModel);
    } catch (error) {
      throw new Error(`Error finding conversation by ID: ${error.message}`);
    }
  }

  /**
   * Buscar conversaciones por usuario
   */
  async findByUserId(userId, filters = {}) {
    try {
      const { isActive, limit = 20, offset = 0 } = filters;

      const query = { userId };

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      const conversations = await ConversationModel.find(query)
        .sort({ updatedAt: -1 })
        .limit(limit)
        .skip(offset);

      const total = await ConversationModel.countDocuments(query);

      return {
        conversations: conversations.map((conv) => this._toEntity(conv)),
        total,
      };
    } catch (error) {
      throw new Error(`Error finding conversations by user: ${error.message}`);
    }
  }

  /**
   * Buscar conversación activa de un usuario
   */
  async findActiveByUserId(userId) {
    try {
      const conversationModel = await ConversationModel.findOne({
        userId,
        isActive: true,
      }).sort({ updatedAt: -1 });

      return this._toEntity(conversationModel);
    } catch (error) {
      throw new Error(`Error finding active conversation: ${error.message}`);
    }
  }

  /**
   * Actualizar conversación
   */
  async update(id, updates) {
    try {
      const conversationModel = await ConversationModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!conversationModel) {
        throw new Error('Conversation not found');
      }

      return this._toEntity(conversationModel);
    } catch (error) {
      throw new Error(`Error updating conversation: ${error.message}`);
    }
  }

  /**
   * Agregar mensaje a conversación
   */
  async addMessage(conversationId, message) {
    try {
      const conversationModel = await ConversationModel.findByIdAndUpdate(
        conversationId,
        {
          $push: { messages: message },
          $set: { updatedAt: new Date() },
        },
        { new: true }
      );

      if (!conversationModel) {
        throw new Error('Conversation not found');
      }

      return this._toEntity(conversationModel);
    } catch (error) {
      throw new Error(`Error adding message: ${error.message}`);
    }
  }

  /**
   * Buscar conversaciones escaladas
   */
  async findEscalated(filters = {}) {
    try {
      const { escalatedTo, limit = 20, offset = 0 } = filters;

      const query = { isEscalated: true };

      if (escalatedTo) {
        query.escalatedTo = escalatedTo;
      }

      const conversations = await ConversationModel.find(query)
        .sort({ escalatedAt: -1 })
        .limit(limit)
        .skip(offset);

      return conversations.map((conv) => this._toEntity(conv));
    } catch (error) {
      throw new Error(`Error finding escalated conversations: ${error.message}`);
    }
  }

  /**
   * Cerrar conversación
   */
  async close(id) {
    try {
      const conversationModel = await ConversationModel.findByIdAndUpdate(
        id,
        {
          isActive: false,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!conversationModel) {
        throw new Error('Conversation not found');
      }

      return this._toEntity(conversationModel);
    } catch (error) {
      throw new Error(`Error closing conversation: ${error.message}`);
    }
  }

  /**
   * Contar conversaciones por usuario
   * @param {string} userId - ID del usuario
   * @param {Date} afterDate - Contar después de esta fecha (opcional)
   * @returns {Promise<number>} Total de conversaciones
   */
  async countByUser(userId, afterDate = null) {
    try {
      const query = { userId };

      if (afterDate) {
        query.createdAt = { $gte: afterDate };
      }

      return await ConversationModel.countDocuments(query);
    } catch (error) {
      throw new Error(`Error counting conversations: ${error.message}`);
    }
  }
}

module.exports = ConversationRepository;
