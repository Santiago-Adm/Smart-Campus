/**
 * Interface: IDocumentRepository
 * Contrato para el repositorio de documentos (MongoDB)
 */

class IDocumentRepository {
  /**
   * Crear un nuevo documento
   * @param {Document} _document
   * @returns {Promise<Document>}
   */
  async create(_document) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Buscar documento por ID
   * @param {string} _id
   * @returns {Promise<Document|null>}
   */
  async findById(_id) {
    throw new Error('Method findById() must be implemented');
  }

  /**
   * Buscar documentos por usuario
   * @param {string} _userId
   * @param {Object} _filters - { status, type, limit, offset }
   * @returns {Promise<{documents: Document[], total: number}>}
   */
  async findByUserId(_userId, _filters) {
    throw new Error('Method findByUserId() must be implemented');
  }

  /**
   * Buscar documentos con filtros avanzados
   * @param {Object} _filters - { userId, status, type, dateFrom, dateTo }
   * @returns {Promise<{documents: Document[], total: number}>}
   */
  async findMany(_filters) {
    throw new Error('Method findMany() must be implemented');
  }

  /**
   * Actualizar documento
   * @param {string} _id
   * @param {Object} _updates
   * @returns {Promise<Document>}
   */
  async update(_id, _updates) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Eliminar documento
   * @param {string} _id
   * @returns {Promise<boolean>}
   */
  async delete(_id) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Buscar documentos pendientes de revisión
   * @param {number} _limit
   * @returns {Promise<Document[]>}
   */
  async findPendingReview(_limit) {
    throw new Error('Method findPendingReview() must be implemented');
  }

  /**
   * Contar documentos por estado
   * @param {string} _userId - Opcional
   * @returns {Promise<Object>} - { PENDING: 5, APPROVED: 10, ... }
   */
  async countByStatus(_userId) {
    throw new Error('Method countByStatus() must be implemented');
  }

  /**
   * Buscar versiones anteriores de un documento
   * @param {string} _documentId
   * @returns {Promise<Document[]>}
   */
  async findVersionHistory(_documentId) {
    throw new Error('Method findVersionHistory() must be implemented');
  }
}

module.exports = IDocumentRepository;
