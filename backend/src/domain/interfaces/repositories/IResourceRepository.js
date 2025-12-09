/**
 * Interface: IResourceRepository
 * Contrato para el repositorio de recursos educativos (MongoDB)
 */

class IResourceRepository {
  /**
   * Crear un nuevo recurso
   * @param {Resource} _resource
   * @returns {Promise<Resource>}
   */
  async create(_resource) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Buscar recurso por ID
   * @param {string} _id
   * @returns {Promise<Resource|null>}
   */
  async findById(_id) {
    throw new Error('Method findById() must be implemented');
  }

  /**
   * Buscar recursos con filtros
   * @param {Object} _filters - { category, type, tags, isPublic, search, limit, offset, sortBy }
   * @returns {Promise<{resources: Resource[], total: number}>}
   */
  async findMany(_filters) {
    throw new Error('Method findMany() must be implemented');
  }

  /**
   * Actualizar recurso
   * @param {string} _id
   * @param {Object} _updates
   * @returns {Promise<Resource>}
   */
  async update(_id, _updates) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Eliminar recurso
   * @param {string} _id
   * @returns {Promise<boolean>}
   */
  async delete(_id) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Buscar recursos más populares
   * @param {number} _limit
   * @returns {Promise<Resource[]>}
   */
  async findMostPopular(_limit) {
    throw new Error('Method findMostPopular() must be implemented');
  }

  /**
   * Buscar recursos recomendados para un usuario
   * @param {string} _userId
   * @param {number} _limit
   * @returns {Promise<Resource[]>}
   */
  async findRecommendedForUser(_userId, _limit) {
    throw new Error('Method findRecommendedForUser() must be implemented');
  }

  /**
   * Buscar recursos por tags
   * @param {string[]} _tags
   * @param {number} _limit
   * @returns {Promise<Resource[]>}
   */
  async findByTags(_tags, _limit) {
    throw new Error('Method findByTags() must be implemented');
  }

  /**
   * Incrementar contador de vistas
   * @param {string} _id
   * @returns {Promise<void>}
   */
  async incrementViewCount(_id) {
    throw new Error('Method incrementViewCount() must be implemented');
  }

  /**
   * Incrementar contador de descargas
   * @param {string} _id
   * @returns {Promise<void>}
   */
  async incrementDownloadCount(_id) {
    throw new Error('Method incrementDownloadCount() must be implemented');
  }
}

module.exports = IResourceRepository;
