/**
 * DTO: Get Scenarios
 * Valida parámetros de búsqueda de escenarios
 */

class GetScenariosDto {
  constructor({
    category = null,
    difficulty = null,
    isPublic = null,
    createdBy = null,
    search = null,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
  }) {
    this.category = category;
    this.difficulty = difficulty;
    this.isPublic = isPublic;
    this.createdBy = createdBy;
    this.search = search;
    this.page = parseInt(page, 10);
    this.limit = parseInt(limit, 10);
    this.sortBy = sortBy;
  }

  /**
   * Validar datos
   */
  validate() {
    const errors = [];

    // Validar category
    if (this.category) {
      const validCategories = [
        'venopuncion',
        'rcp',
        'cateterismo',
        'curacion',
        'inyeccion',
        'signos_vitales',
        'otros',
      ];
      if (!validCategories.includes(this.category)) {
        errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
      }
    }

    // Validar difficulty
    if (this.difficulty) {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      if (!validDifficulties.includes(this.difficulty)) {
        errors.push(`Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`);
      }
    }

    // Validar page
    if (this.page < 1) {
      errors.push('Page must be greater than 0');
    }

    // Validar limit
    if (this.limit < 1 || this.limit > 100) {
      errors.push('Limit must be between 1 and 100');
    }

    // Validar sortBy
    const validSortFields = ['createdAt', 'updatedAt', 'popular', 'rating', 'title'];
    if (!validSortFields.includes(this.sortBy)) {
      errors.push(`Invalid sortBy. Must be one of: ${validSortFields.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

module.exports = GetScenariosDto;
