/**
 * Mapper: Resource
 * Convierte entre Resource Entity y DTOs
 */

const Resource = require('../../domain/entities/Resource.entity');
const ResourceResponseDto = require('../dtos/library/ResourceResponseDto');

class ResourceMapper {
  /**
   * Convertir Entity a Response DTO
   */
  static toDto(resource) {
    if (!resource) return null;
    return ResourceResponseDto.fromEntity(resource);
  }

  /**
   * Convertir lista de Entities a Response DTOs
   */
  static toDtoList(resources) {
    if (!Array.isArray(resources)) return [];
    return ResourceResponseDto.fromEntityList(resources);
  }

  /**
   * Convertir Entity a Response DTO (versión resumida)
   */
  static toSummaryDto(resource) {
    if (!resource) return null;
    const dto = ResourceResponseDto.fromEntity(resource);
    return dto.toSummary();
  }

  /**
   * Convertir lista de Entities a Response DTOs (versión resumida)
   */
  static toSummaryDtoList(resources) {
    if (!Array.isArray(resources)) return [];
    return resources.map((resource) => this.toSummaryDto(resource));
  }

  /**
   * Convertir Entity a Response DTO (versión completa)
   */
  static toFullDto(resource) {
    if (!resource) return null;
    const dto = ResourceResponseDto.fromEntity(resource);
    return dto.toFull();
  }

  /**
   * Convertir DTO a Entity (para creación)
   */
  static toEntity(uploadDto, fileUrl, userId) {
    return new Resource({
      title: uploadDto.title,
      description: uploadDto.description,
      category: uploadDto.category,
      type: uploadDto.type,
      author: uploadDto.author,
      publisher: uploadDto.publisher,
      publicationDate: uploadDto.publicationDate,
      fileUrl,
      tags: uploadDto.tags,
      language: uploadDto.language,
      pageCount: uploadDto.pageCount,
      duration: uploadDto.duration,
      isPublic: uploadDto.isPublic,
      uploadedBy: userId,
    });
  }
}

module.exports = ResourceMapper;
