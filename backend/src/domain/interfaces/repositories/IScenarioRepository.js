/**
 * Interface: IScenarioRepository
 * Contrato para el repositorio de escenarios de simulación AR (MongoDB)
 */

class IScenarioRepository {
  /**
   * Crear un nuevo escenario
   * @param {Scenario} scenario
   * @returns {Promise<Scenario>}
   */
  async create(_scenario) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Buscar escenario por ID
   * @param {string} id
   * @returns {Promise<Scenario|null>}
   */
  async findById(_id) {
    throw new Error('Method findById() must be implemented');
  }

  /**
   * Buscar escenarios con filtros
   * @param {Object} filters - { category, difficulty, isPublic, createdBy, limit, offset, sortBy }
   * @returns {Promise<{scenarios: Scenario[], total: number}>}
   */
  async findMany(_filters) {
    throw new Error('Method findMany() must be implemented');
  }

  /**
   * Actualizar escenario
   * @param {string} _id
   * @param {Object} _updates
   * @returns {Promise<Scenario>}
   */
  async update(_id, _updates) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Eliminar escenario
   * @param {string} _id
   * @returns {Promise<boolean>}
   */
  async delete(_id) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Buscar escenarios públicos
   * @param {number} _limit
   * @returns {Promise<Scenario[]>}
   */
  async findPublicScenarios(_limit) {
    throw new Error('Method findPublicScenarios() must be implemented');
  }

  /**
   * Buscar escenarios por categoría
   * @param {string} _category
   * @param {number} _limit
   * @returns {Promise<Scenario[]>}
   */
  async findByCategory(_category, _limit) {
    throw new Error('Method findByCategory() must be implemented');
  }

  /**
   * Buscar escenarios por creador
   * @param {string} _userId
   * @returns {Promise<Scenario[]>}
   */
  async findByCreator(_userId) {
    throw new Error('Method findByCreator() must be implemented');
  }

  /**
   * Registrar completación de escenario
   * @param {string} _id
   * @param {number} _score
   * @returns {Promise<void>}
   */
  async recordCompletion(_id, _score) {
    throw new Error('Method recordCompletion() must be implemented');
  }
}

module.exports = IScenarioRepository;
