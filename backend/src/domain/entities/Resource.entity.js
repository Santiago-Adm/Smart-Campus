/**
 * Entity: Resource
 * Representa un recurso educativo en la biblioteca virtual
 */

const { ResourceCategory } = require('../enums/ResourceCategory.enum');

class Resource {
  constructor({
    id = null,
    title,
    description,
    category,
    type, // 'book', 'article', 'video', 'guide', 'case_study'
    author = null,
    publisher = null,
    publicationDate = null,
    fileUrl,
    thumbnailUrl = null,
    tags = [],
    language = 'es',
    pageCount = null,
    duration = null, // Para videos (en segundos)
    fileSize = null,
    isPublic = true,
    uploadedBy,
    viewCount = 0,
    downloadCount = 0,
    averageRating = 0,
    ratingCount = 0,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.title = this.validateTitle(title);
    this.description = description || '';
    this.category = this.validateCategory(category);
    this.type = this.validateType(type);
    this.author = author;
    this.publisher = publisher;
    this.publicationDate = publicationDate ? new Date(publicationDate) : null;
    this.fileUrl = this.validateFileUrl(fileUrl);
    this.thumbnailUrl = thumbnailUrl;
    this.tags = Array.isArray(tags) ? tags : [];
    this.language = language;
    this.pageCount = pageCount;
    this.duration = duration;
    this.fileSize = fileSize;
    this.isPublic = Boolean(isPublic);
    this.uploadedBy = uploadedBy;
    this.viewCount = viewCount;
    this.downloadCount = downloadCount;
    this.averageRating = averageRating;
    this.ratingCount = ratingCount;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  }

  // ============================================
  // VALIDACIONES
  // ============================================

  validateTitle(title) {
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      throw new Error('Title must be at least 3 characters long');
    }
    return title.trim();
  }

  validateCategory(category) {
    if (!Object.values(ResourceCategory).includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }
    return category;
  }

  validateType(type) {
    const validTypes = ['book', 'article', 'video', 'guide', 'case_study'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }
    return type;
  }

  validateFileUrl(fileUrl) {
    if (!fileUrl || typeof fileUrl !== 'string') {
      throw new Error('File URL is required');
    }
    return fileUrl;
  }

  // ============================================
  // MÉTODOS DE NEGOCIO
  // ============================================

  /**
   * Incrementar contador de vistas
   */
  incrementViewCount() {
    // eslint-disable-next-line no-plusplus
    this.viewCount++;
    this.updatedAt = new Date();
  }

  /**
   * Incrementar contador de descargas
   */
  incrementDownloadCount() {
    // eslint-disable-next-line no-plusplus
    this.downloadCount++;
    this.updatedAt = new Date();
  }

  /**
   * Agregar calificación
   */
  addRating(rating) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const totalRating = this.averageRating * this.ratingCount + rating;
    // eslint-disable-next-line no-plusplus
    this.ratingCount++;
    this.averageRating = totalRating / this.ratingCount;
    this.updatedAt = new Date();
  }

  /**
   * Agregar tag
   */
  addTag(tag) {
    if (!tag || typeof tag !== 'string') {
      throw new Error('Tag must be a non-empty string');
    }

    const normalizedTag = tag.trim().toLowerCase();
    if (!this.tags.includes(normalizedTag)) {
      this.tags.push(normalizedTag);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remover tag
   */
  removeTag(tag) {
    const index = this.tags.indexOf(tag.toLowerCase());
    if (index > -1) {
      this.tags.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  /**
   * Hacer público
   */
  makePublic() {
    this.isPublic = true;
    this.updatedAt = new Date();
  }

  /**
   * Hacer privado
   */
  makePrivate() {
    this.isPublic = false;
    this.updatedAt = new Date();
  }

  /**
   * Verificar si es un video
   */
  isVideo() {
    return this.type === 'video';
  }

  /**
   * Verificar si es un libro
   */
  isBook() {
    return this.type === 'book';
  }

  /**
   * Obtener popularidad (basado en vistas y descargas)
   */
  getPopularityScore() {
    return this.viewCount * 1 + this.downloadCount * 2 + this.averageRating * 10;
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
      popularityScore: this.getPopularityScore(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Resource;
