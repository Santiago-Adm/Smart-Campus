/**
 * DTO: Create Scenario
 * Valida datos para crear un escenario
 */

class CreateScenarioDto {
  constructor({
    title,
    description = '',
    category,
    difficulty,
    steps = [],
    criteria = [],
    estimatedDuration = 15,
    isPublic = false,
  }) {
    this.title = title;
    this.description = description;
    this.category = category;
    this.difficulty = difficulty;
    this.steps = Array.isArray(steps) ? steps : [];
    this.criteria = Array.isArray(criteria) ? criteria : [];
    this.estimatedDuration = parseInt(estimatedDuration, 10);
    this.isPublic = Boolean(isPublic);
  }

  /**
   * Validar datos
   */
  validate() {
    const errors = [];

    // Validar title
    if (!this.title || this.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long');
    }

    // Validar category
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
      errors.push(`Category must be one of: ${validCategories.join(', ')}`);
    }

    // Validar difficulty
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(this.difficulty)) {
      errors.push(`Difficulty must be one of: ${validDifficulties.join(', ')}`);
    }

    // Validar steps
    if (this.steps.length === 0) {
      errors.push('At least one step is required');
    }

    this.steps.forEach((step, index) => {
      if (!step.title || !step.description) {
        errors.push(`Step ${index + 1} must have title and description`);
      }
    });

    // Validar estimatedDuration
    if (this.estimatedDuration < 5 || this.estimatedDuration > 120) {
      errors.push('Estimated duration must be between 5 and 120 minutes');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

module.exports = CreateScenarioDto;
