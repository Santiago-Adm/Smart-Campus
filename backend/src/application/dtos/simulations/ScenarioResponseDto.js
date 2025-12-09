/**
 * DTO: Scenario Response
 * DTO para la respuesta de escenarios
 */

class ScenarioResponseDto {
  constructor(scenario) {
    this.id = scenario.id;
    this.title = scenario.title;
    this.description = scenario.description;
    this.category = scenario.category;
    this.difficulty = scenario.difficulty;
    this.modelUrl = scenario.modelUrl;
    this.steps = scenario.steps;
    this.stepCount = scenario.getStepCount();
    this.criteria = scenario.criteria;
    this.estimatedDuration = scenario.estimatedDuration;
    this.createdBy = scenario.createdBy;
    this.isPublic = scenario.isPublic;
    this.version = scenario.version;
    this.thumbnailUrl = scenario.thumbnailUrl;
    this.completionCount = scenario.completionCount;
    this.averageScore = scenario.averageScore;
    this.createdAt = scenario.createdAt;
    this.updatedAt = scenario.updatedAt;
  }

  /**
   * Crear DTO desde entidad
   */
  static fromEntity(scenario) {
    return new ScenarioResponseDto(scenario);
  }

  /**
   * Crear lista de DTOs desde array de entidades
   */
  static fromEntityList(scenarios) {
    return scenarios.map((scenario) => new ScenarioResponseDto(scenario));
  }

  /**
   * Versión resumida (para listados)
   */
  toSummary() {
    return {
      id: this.id,
      title: this.title,
      description: `${this.description.substring(0, 150)}...`,
      category: this.category,
      difficulty: this.difficulty,
      thumbnailUrl: this.thumbnailUrl,
      stepCount: this.stepCount,
      estimatedDuration: this.estimatedDuration,
      isPublic: this.isPublic,
      createdBy: this.createdBy,
      completionCount: this.completionCount,
      averageScore: this.averageScore,
      createdAt: this.createdAt,
    };
  }

  /**
   * Versión completa
   */
  toFull() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      difficulty: this.difficulty,
      modelUrl: this.modelUrl,
      steps: this.steps,
      stepCount: this.stepCount,
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

module.exports = ScenarioResponseDto;
