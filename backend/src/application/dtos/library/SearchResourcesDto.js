/**
 * DTO: Search Resources
 * Valida parámetros de búsqueda de recursos
 */

class SearchResourcesDto {
  constructor({
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
    this.search = search;
    this.category = category;
    this.type = type;
    this.tags = Array.isArray(tags) ? tags : [];
    this.language = language;
    this.isPublic = isPublic;
    this.minRating = minRating;
    this.page = parseInt(page, 10);
    this.limit = parseInt(limit, 10);
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }

  /**
   * Validar datos
   */
  validate() {
    const errors = [];

    // Validar page
    if (this.page < 1) {
      errors.push('Page must be greater than 0');
    }

    // Validar limit
    if (this.limit < 1 || this.limit > 100) {
      errors.push('Limit must be between 1 and 100');
    }

    // Validar sortBy
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
    if (!validSortFields.includes(this.sortBy)) {
      errors.push(`Invalid sortBy. Must be one of: ${validSortFields.join(', ')}`);
    }

    // Validar sortOrder
    const validOrders = ['asc', 'desc'];
    if (!validOrders.includes(this.sortOrder)) {
      errors.push('SortOrder must be "asc" or "desc"');
    }

    // Validar minRating
    if (this.minRating !== null && (this.minRating < 0 || this.minRating > 5)) {
      errors.push('MinRating must be between 0 and 5');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

module.exports = SearchResourcesDto;
