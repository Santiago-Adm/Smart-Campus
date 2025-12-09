/**
 * DTO: Upload Resource
 * Valida datos para subir un recurso
 */

const { ResourceCategory } = require('../../../domain/enums/ResourceCategory.enum');

class UploadResourceDto {
  constructor({
    title,
    description = '',
    category,
    type,
    author = null,
    publisher = null,
    publicationDate = null,
    tags = [],
    language = 'es',
    pageCount = null,
    duration = null,
    isPublic = true,
  }) {
    this.title = title;
    this.description = description;
    this.category = category;
    this.type = type;
    this.author = author;
    this.publisher = publisher;
    this.publicationDate = publicationDate;
    this.tags = Array.isArray(tags) ? tags : [];
    this.language = language;
    this.pageCount = pageCount ? parseInt(pageCount, 10) : null;
    this.duration = duration ? parseInt(duration, 10) : null;
    this.isPublic = Boolean(isPublic);
  }

  /**
   * Validar datos
   */
  validate() {
    const errors = [];

    // Validar title
    if (!this.title || this.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    }

    // Validar category
    if (!Object.values(ResourceCategory).includes(this.category)) {
      errors.push('Invalid category');
    }

    // Validar type
    const validTypes = ['book', 'article', 'video', 'guide', 'case_study'];
    if (!validTypes.includes(this.type)) {
      errors.push(`Type must be one of: ${validTypes.join(', ')}`);
    }

    // Validar language
    const validLanguages = ['es', 'en', 'pt', 'qu']; // español, inglés, portugués, quechua
    if (!validLanguages.includes(this.language)) {
      errors.push(`Language must be one of: ${validLanguages.join(', ')}`);
    }

    // Validar pageCount (si existe)
    if (this.pageCount !== null && this.pageCount < 1) {
      errors.push('Page count must be greater than 0');
    }

    // Validar duration (si existe)
    if (this.duration !== null && this.duration < 1) {
      errors.push('Duration must be greater than 0');
    }

    // Validar tags
    if (this.tags.length > 20) {
      errors.push('Maximum 20 tags allowed');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

module.exports = UploadResourceDto;
