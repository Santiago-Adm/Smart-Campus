/**
 * Entity: Scenario
 * Representa un escenario de simulación AR
 */

class Scenario {
  constructor({
    id = null,
    title,
    description,
    category, // 'venopuncion', 'rcp', 'cateterismo', etc.
    difficulty, // 'beginner', 'intermediate', 'advanced'
    modelUrl, // URL del modelo 3D (GLTF/GLB)
    steps = [],
    criteria = [],
    estimatedDuration = 15, // minutos
    createdBy,
    isPublic = false,
    version = 1,
    thumbnailUrl = null,
    completionCount = 0,
    averageScore = 0,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.title = this.validateTitle(title);
    this.description = description || '';
    this.category = this.validateCategory(category);
    this.difficulty = this.validateDifficulty(difficulty);
    this.modelUrl = this.validateModelUrl(modelUrl);
    this.steps = this.validateSteps(steps);
    this.criteria = this.validateCriteria(criteria);
    this.estimatedDuration = this.validateDuration(estimatedDuration);
    this.createdBy = createdBy;
    this.isPublic = Boolean(isPublic);
    this.version = version;
    this.thumbnailUrl = thumbnailUrl;
    this.completionCount = completionCount;
    this.averageScore = averageScore;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  }

  // ============================================
  // VALIDACIONES
  // ============================================

  validateTitle(title) {
    if (!title || typeof title !== 'string' || title.trim().length < 5) {
      throw new Error('Title must be at least 5 characters long');
    }
    return title.trim();
  }

  validateCategory(category) {
    const validCategories = [
      'venopuncion',
      'rcp',
      'cateterismo',
      'curacion',
      'inyeccion',
      'signos_vitales',
      'otros',
    ];
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }
    return category;
  }

  validateDifficulty(difficulty) {
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(difficulty)) {
      throw new Error(`Invalid difficulty: ${difficulty}`);
    }
    return difficulty;
  }

  validateModelUrl(modelUrl) {
    if (!modelUrl || typeof modelUrl !== 'string') {
      throw new Error('Model URL is required');
    }
    return modelUrl;
  }

  validateSteps(steps) {
    if (!Array.isArray(steps) || steps.length === 0) {
      throw new Error('Scenario must have at least one step');
    }

    steps.forEach((step, index) => {
      if (!step.title || !step.description) {
        throw new Error(`Step ${index + 1} must have title and description`);
      }
    });

    return steps;
  }

  validateCriteria(criteria) {
    if (!Array.isArray(criteria)) {
      return [];
    }
    return criteria;
  }

  validateDuration(duration) {
    if (typeof duration !== 'number' || duration < 5 || duration > 120) {
      throw new Error('Duration must be between 5 and 120 minutes');
    }
    return duration;
  }

  // ============================================
  // MÉTODOS DE NEGOCIO
  // ============================================

  /**
   * Agregar paso
   */
  addStep(step) {
    if (!step.title || !step.description) {
      throw new Error('Step must have title and description');
    }

    this.steps.push({
      order: this.steps.length + 1,
      ...step,
    });
    this.updatedAt = new Date();
  }

  /**
   * Actualizar paso
   */
  updateStep(index, updates) {
    if (index < 0 || index >= this.steps.length) {
      throw new Error('Invalid step index');
    }

    this.steps[index] = {
      ...this.steps[index],
      ...updates,
    };
    this.updatedAt = new Date();
  }

  /**
   * Eliminar paso
   */
  removeStep(index) {
    if (index < 0 || index >= this.steps.length) {
      throw new Error('Invalid step index');
    }

    this.steps.splice(index, 1);

    // Reordenar pasos
    this.steps.forEach((step, i) => {
      // eslint-disable-next-line no-param-reassign
      step.order = i + 1;
    });

    this.updatedAt = new Date();
  }

  /**
   * Agregar criterio de evaluación
   */
  addCriterion(criterion) {
    if (!criterion.name || !criterion.description) {
      throw new Error('Criterion must have name and description');
    }

    this.criteria.push(criterion);
    this.updatedAt = new Date();
  }

  /**
   * Hacer público
   */
  publish() {
    this.isPublic = true;
    this.updatedAt = new Date();
  }

  /**
   * Hacer privado
   */
  unpublish() {
    this.isPublic = false;
    this.updatedAt = new Date();
  }

  /**
   * Registrar completación
   */
  recordCompletion(score) {
    if (score < 0 || score > 100) {
      throw new Error('Score must be between 0 and 100');
    }

    const totalScore = this.averageScore * this.completionCount + score;
    // eslint-disable-next-line no-plusplus
    this.completionCount++;
    this.averageScore = totalScore / this.completionCount;
    this.updatedAt = new Date();
  }

  /**
   * Crear nueva versión
   */
  createNewVersion() {
    return new Scenario({
      title: this.title,
      description: this.description,
      category: this.category,
      difficulty: this.difficulty,
      modelUrl: this.modelUrl,
      steps: [...this.steps],
      criteria: [...this.criteria],
      estimatedDuration: this.estimatedDuration,
      createdBy: this.createdBy,
      isPublic: false, // Nueva versión empieza privada
      version: this.version + 1,
      thumbnailUrl: this.thumbnailUrl,
    });
  }

  /**
   * Obtener número total de pasos
   */
  getStepCount() {
    return this.steps.length;
  }

  /**
   * Convertir a objeto plano
   */
  toObject() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      difficulty: this.difficulty,
      modelUrl: this.modelUrl,
      steps: this.steps,
      stepCount: this.getStepCount(),
      criteria: this.criteria,
      estimatedDuration: this.estimatedDuration,
      createdBy: this.createdBy,
      isPublic: this.isPublic,
      version: this.version,
      thumbnailUrl: this.thumbnailUrl,
      completionCount: this.completionCount,
      averageScore: this.averageScore,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Scenario;
