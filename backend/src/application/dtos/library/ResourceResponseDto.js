/**
 * DTO: Resource Response
 * DTO para la respuesta de recursos
 */

class ResourceResponseDto {
  constructor(resource) {
    this.id = resource.id;
    this.title = resource.title;
    this.description = resource.description;
    this.category = resource.category;
    this.type = resource.type;
    this.author = resource.author;
    this.publisher = resource.publisher;
    this.publicationDate = resource.publicationDate;
    this.fileUrl = resource.fileUrl;
    this.thumbnailUrl = resource.thumbnailUrl;
    this.tags = resource.tags;
    this.language = resource.language;
    this.pageCount = resource.pageCount;
    this.duration = resource.duration;
    this.fileSize = resource.fileSize;
    this.isPublic = resource.isPublic;
    this.uploadedBy = resource.uploadedBy;
    this.viewCount = resource.viewCount;
    this.downloadCount = resource.downloadCount;
    this.averageRating = resource.averageRating;
    this.ratingCount = resource.ratingCount;
    this.popularityScore = resource.getPopularityScore();
    this.createdAt = resource.createdAt;
    this.updatedAt = resource.updatedAt;
  }

  /**
   * Crear DTO desde entidad
   */
  static fromEntity(resource) {
    return new ResourceResponseDto(resource);
  }

  /**
   * Crear lista de DTOs desde array de entidades
   */
  static fromEntityList(resources) {
    return resources.map((resource) => new ResourceResponseDto(resource));
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
      type: this.type,
      author: this.author,
      thumbnailUrl: this.thumbnailUrl,
      tags: this.tags,
      language: this.language,
      viewCount: this.viewCount,
      downloadCount: this.downloadCount,
      averageRating: this.averageRating,
      ratingCount: this.ratingCount,
      popularityScore: this.popularityScore,
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
      type: this.type,
      author: this.author,
      publisher: this.publisher,
      publicationDate: this.publicationDate,
      fileUrl: this.fileUrl,
      thumbnailUrl: this.thumbnailUrl,
      tags: this.tags,
      language: this.language,
      pageCount: this.pageCount,
      duration: this.duration,
      fileSize: this.fileSize,
      isPublic: this.isPublic,
      uploadedBy: this.uploadedBy,
      viewCount: this.viewCount,
      downloadCount: this.downloadCount,
      averageRating: this.averageRating,
      ratingCount: this.ratingCount,
      popularityScore: this.popularityScore,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = ResourceResponseDto;
