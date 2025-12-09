/**
 * Use Case: Get Scenarios
 * Obtiene escenarios de simulación con filtros
 */

class GetScenariosUseCase {
  constructor({ scenarioRepository }) {
    this.scenarioRepository = scenarioRepository;
  }

  /**
   * Ejecutar obtención de escenarios
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async execute({
    category = null,
    difficulty = null,
    isPublic = null,
    createdBy = null,
    search = null,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
  }) {
    try {
      // Validar parámetros
      this._validateParams({ page, limit });

      // Calcular offset
      const offset = (page - 1) * limit;

      // Construir filtros
      const filters = {
        limit,
        offset,
        sortBy,
      };

      if (category) filters.category = category;
      if (difficulty) filters.difficulty = difficulty;
      if (isPublic !== null) filters.isPublic = isPublic;
      if (createdBy) filters.createdBy = createdBy;
      if (search) filters.search = search;

      // Ejecutar búsqueda
      const result = await this.scenarioRepository.findMany(filters);

      // Calcular información de paginación
      const totalPages = Math.ceil(result.total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        scenarios: result.scenarios,
        pagination: {
          total: result.total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          category,
          difficulty,
          isPublic,
          search,
          sortBy,
        },
      };
    } catch (error) {
      throw new Error(`Error getting scenarios: ${error.message}`);
    }
  }

  /**
   * Validar parámetros
   */
  _validateParams({ page, limit }) {
    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
  }
}

module.exports = GetScenariosUseCase;
