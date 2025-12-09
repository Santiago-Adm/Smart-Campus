/**
 * Mapper: Scenario
 * Convierte entre Scenario Entity y DTOs
 */

const Scenario = require('../../domain/entities/Scenario.entity');
const ScenarioResponseDto = require('../dtos/simulations/ScenarioResponseDto');

class ScenarioMapper {
  /**
   * Convertir Entity a Response DTO
   */
  static toDto(scenario) {
    if (!scenario) return null;
    return ScenarioResponseDto.fromEntity(scenario);
  }

  /**
   * Convertir lista de Entities a Response DTOs
   */
  static toDtoList(scenarios) {
    if (!Array.isArray(scenarios)) return [];
    return ScenarioResponseDto.fromEntityList(scenarios);
  }

  /**
   * Convertir Entity a Response DTO (versión resumida)
   */
  static toSummaryDto(scenario) {
    if (!scenario) return null;
    const dto = ScenarioResponseDto.fromEntity(scenario);
    return dto.toSummary();
  }

  /**
   * Convertir lista de Entities a Response DTOs (versión resumida)
   */
  static toSummaryDtoList(scenarios) {
    if (!Array.isArray(scenarios)) return [];
    return scenarios.map((scenario) => this.toSummaryDto(scenario));
  }

  /**
   * Convertir Entity a Response DTO (versión completa)
   */
  static toFullDto(scenario) {
    if (!scenario) return null;
    const dto = ScenarioResponseDto.fromEntity(scenario);
    return dto.toFull();
  }

  /**
   * Convertir DTO a Entity (para creación)
   */
  static toEntity(createDto, modelUrl, userId, thumbnailUrl = null) {
    return new Scenario({
      title: createDto.title,
      description: createDto.description,
      category: createDto.category,
      difficulty: createDto.difficulty,
      modelUrl,
      steps: createDto.steps,
      criteria: createDto.criteria,
      estimatedDuration: createDto.estimatedDuration,
      createdBy: userId,
      isPublic: createDto.isPublic,
      thumbnailUrl,
    });
  }
}

module.exports = ScenarioMapper;
