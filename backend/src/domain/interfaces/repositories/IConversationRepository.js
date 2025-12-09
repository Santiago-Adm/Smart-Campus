/**
 * Interface: IConversationRepository
 * Contrato para el repositorio de conversaciones del chatbot (MongoDB)
 */

class IConversationRepository {
  /**
   * Crear una nueva conversación
   * @param {Conversation} _conversation
   * @returns {Promise<Conversation>}
   */
  async create(_conversation) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Buscar conversación por ID
   * @param {string} _id
   * @returns {Promise<Conversation|null>}
   */
  async findById(_id) {
    throw new Error('Method findById() must be implemented');
  }

  /**
   * Buscar conversaciones por usuario
   * @param {string} _userId
   * @param {Object} _filters - { isActive, limit, offset }
   * @returns {Promise<{conversations: Conversation[], total: number}>}
   */
  async findByUserId(_userId, _filters) {
    throw new Error('Method findByUserId() must be implemented');
  }

  /**
   * Buscar conversación activa de un usuario
   * @param {string} _userId
   * @returns {Promise<Conversation|null>}
   */
  async findActiveByUserId(_userId) {
    throw new Error('Method findActiveByUserId() must be implemented');
  }

  /**
   * Actualizar conversación
   * @param {string} _id
   * @param {Object} _updates
   * @returns {Promise<Conversation>}
   */
  async update(_id, _updates) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Agregar mensaje a conversación
   * @param {string} _conversationId
   * @param {Object} _message - { role, content, timestamp }
   * @returns {Promise<Conversation>}
   */
  async addMessage(_conversationId, _message) {
    throw new Error('Method addMessage() must be implemented');
  }

  /**
   * Buscar conversaciones escaladas
   * @param {Object} _filters
   * @returns {Promise<Conversation[]>}
   */
  async findEscalated(_filters) {
    throw new Error('Method findEscalated() must be implemented');
  }

  /**
   * Cerrar conversación
   * @param {string} _id
   * @returns {Promise<Conversation>}
   */
  async close(_id) {
    throw new Error('Method close() must be implemented');
  }

  /**
   * Contar conversaciones por usuario
   * @param {string} _userId
   * @param {Date} _afterDate - Contar después de esta fecha (opcional)
   * @returns {Promise<number>}
   */
  async countByUser(_userId, _afterDate) {
    throw new Error('Method countByUser() must be implemented');
  }
}

module.exports = IConversationRepository;
