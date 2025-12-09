/**
 * GetUsers Use Case
 * Obtiene lista de usuarios con filtros
 */

class GetUsersUseCase {
  /**
   * @param {Object} dependencies
   * @param {IUserRepository} dependencies.userRepository
   */
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  /**
   * Ejecutar búsqueda de usuarios
   * @param {Object} filters
   * @param {string} filters.role - Filtrar por rol (STUDENT, TEACHER, etc.)
   * @param {string} filters.search - Buscar por nombre o email
   * @param {boolean} filters.isActive - Filtrar por estado activo
   * @param {number} filters.page - Página actual (default: 1)
   * @param {number} filters.limit - Usuarios por página (default: 50)
   * @returns {Promise<Object>}
   */
  async execute(filters = {}) {
    try {
      // Establecer valores por defecto
      const searchFilters = {
        role: filters.role || null,
        search: filters.search || null,
        isActive: filters.isActive !== undefined ? filters.isActive : true,
        page: filters.page || 1,
        limit: filters.limit || 50,
      };

      // Validar página y límite
      if (searchFilters.page < 1) {
        searchFilters.page = 1;
      }

      if (searchFilters.limit < 1 || searchFilters.limit > 100) {
        searchFilters.limit = 50;
      }

      // Calcular offset
      const offset = (searchFilters.page - 1) * searchFilters.limit;

      console.log('🔍 Searching users with filters:', searchFilters);

      // Buscar en repositorio
      const { users, total } = await this.userRepository.findMany({
        role: searchFilters.role,
        search: searchFilters.search,
        isActive: searchFilters.isActive,
        limit: searchFilters.limit,
        offset,
      });

      console.log(`✅ Found ${users.length} users (Total: ${total})`);

      // Calcular metadata de paginación
      const totalPages = Math.ceil(total / searchFilters.limit);

      return {
        users,
        pagination: {
          page: searchFilters.page,
          limit: searchFilters.limit,
          total,
          totalPages,
          hasNextPage: searchFilters.page < totalPages,
          hasPrevPage: searchFilters.page > 1,
        },
      };
    } catch (error) {
      console.error('❌ Error in GetUsersUseCase:', error);
      throw error;
    }
  }
}

module.exports = GetUsersUseCase;
