/**
 * Interface: IUserRepository
 * Contrato para el repositorio de usuarios
 *
 * Esta interfaz define las operaciones que debe implementar
 * cualquier repositorio de usuarios (PostgreSQL, MongoDB, etc.)
 */

class IUserRepository {
  /**
   * Crear un nuevo usuario
   * @param {User} _user - Entidad User
   * @returns {Promise<User>}
   */
  async create(_user) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Buscar usuario por ID
   * @param {string|number} _id
   * @returns {Promise<User|null>}
   */
  async findById(_id) {
    throw new Error('Method findById() must be implemented');
  }

  /**
   * Buscar usuario por email
   * @param {string} _email
   * @returns {Promise<User|null>}
   */
  async findByEmail(_email) {
    throw new Error('Method findByEmail() must be implemented');
  }

  /**
   * Buscar usuario por DNI
   * @param {string} _dni
   * @returns {Promise<User|null>}
   */
  async findByDNI(_dni) {
    throw new Error('Method findByDNI() must be implemented');
  }

  /**
   * Buscar múltiples usuarios con filtros
   * @param {Object} _filters - { role, isActive, search, limit, offset }
   * @returns {Promise<{users: User[], total: number}>}
   */
  async findMany(_filters) {
    throw new Error('Method findMany() must be implemented');
  }

  /**
   * Actualizar usuario
   * @param {string|number} _id
   * @param {Object} _updates
   * @returns {Promise<User>}
   */
  async update(_id, _updates) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Eliminar usuario (soft delete)
   * @param {string|number} _id
   * @returns {Promise<boolean>}
   */
  async delete(_id) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Verificar si existe un email
   * @param {string} _email
   * @returns {Promise<boolean>}
   */
  async existsByEmail(_email) {
    throw new Error('Method existsByEmail() must be implemented');
  }

  /**
   * Verificar si existe un DNI
   * @param {string} _dni
   * @returns {Promise<boolean>}
   */
  async existsByDNI(_dni) {
    throw new Error('Method existsByDNI() must be implemented');
  }

  /**
   * Contar usuarios con filtros opcionales
   * @param {Object} _filters
   * @returns {Promise<number>}
   */
  async count(_filters) {
    throw new Error('Method count() must be implemented');
  }
}

module.exports = IUserRepository;
