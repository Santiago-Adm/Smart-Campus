/**
 * Use Case: Search Resources
 * Busca recursos educativos con filtros avanzados
 */

class SearchResourcesUseCase {
  constructor({ resourceRepository }) {
    this.resourceRepository = resourceRepository;
  }

  /**
   * Ejecutar búsqueda de recursos
   * @param {Object} params - Parámetros de búsqueda
   * @returns {Promise<Object>} Recursos encontrados con paginación
   */
  async execute({
    search = null,
    category = null,
    type = null,
    tags = [],
    language = null,
    isPublic = true,
    minRating = null,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  }) {
    try {
      // Validar parámetros
      this._validateParams({ page, limit, sortBy });

      // Calcular offset
      const offset = (page - 1) * limit;

      // Construir filtros
      const filters = {
        limit,
        offset,
        sortBy,
        sortOrder,
      };

      if (search) filters.search = search;
      if (category) filters.category = category;
      if (type) filters.type = type;
      if (tags.length > 0) filters.tags = tags;
      if (language) filters.language = language;
      if (isPublic !== undefined) filters.isPublic = isPublic;
      if (minRating) filters.minRating = minRating;

      // Ejecutar búsqueda
      const result = await this.resourceRepository.findMany(filters);

      // Calcular información de paginación
      const totalPages = Math.ceil(result.total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        resources: result.resources,
        pagination: {
          total: result.total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          search,
          category,
          type,
          tags,
          language,
          sortBy,
          sortOrder,
        },
      };
    } catch (error) {
      throw new Error(`Error searching resources: ${error.message}`);
    }
  }

  /**
   * Validar parámetros
   */
  _validateParams({ page, limit, sortBy }) {
    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    const validSortFields = [
      'createdAt',
      'updatedAt',
      'viewCount',
      'downloadCount',
      'averageRating',
      'title',
      'popular',
      'rating',
    ];
    if (!validSortFields.includes(sortBy)) {
      throw new Error(`Invalid sortBy field. Must be one of: ${validSortFields.join(', ')}`);
    }
  }
}

module.exports = SearchResourcesUseCase;
