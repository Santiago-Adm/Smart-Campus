/**
 * Use Case: Upload Resource
 * Sube un nuevo recurso educativo a la biblioteca
 */

const Resource = require('../../../domain/entities/Resource.entity');

class UploadResourceUseCase {
  constructor({ resourceRepository, fileService }) {
    this.resourceRepository = resourceRepository;
    this.fileService = fileService;
  }

  /**
   * Ejecutar subida de recurso
   * @param {Object} params
   * @returns {Promise<Resource>}
   */
  async execute({
    userId,
    fileBuffer,
    fileName,
    mimeType,
    fileSize,
    title,
    description,
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
    try {
      // Validar datos obligatorios
      this._validateRequiredFields({
        userId,
        fileBuffer,
        fileName,
        title,
        category,
        type,
      });

      // Validar tipo de archivo según el tipo de recurso
      this._validateFileType(mimeType, type);

      // Subir archivo al storage
      const fileUrl = await this.fileService.uploadFile(fileBuffer, fileName, mimeType, {
        folder: 'library-resources',
      });

      // Crear entidad Resource
      const resource = new Resource({
        title,
        description,
        category,
        type,
        author,
        publisher,
        publicationDate,
        fileUrl,
        tags,
        language,
        pageCount,
        duration,
        fileSize,
        isPublic,
        uploadedBy: userId,
      });

      // Guardar en repositorio
      const savedResource = await this.resourceRepository.create(resource);

      return savedResource;
    } catch (error) {
      throw new Error(`Error uploading resource: ${error.message}`);
    }
  }

  /**
   * Validar campos requeridos
   */
  _validateRequiredFields({ userId, fileBuffer, fileName, title, category, type }) {
    if (!userId) throw new Error('User ID is required');
    if (!fileBuffer) throw new Error('File is required');
    if (!fileName) throw new Error('File name is required');
    if (!title) throw new Error('Title is required');
    if (!category) throw new Error('Category is required');
    if (!type) throw new Error('Type is required');
  }

  /**
   * Validar tipo de archivo según el tipo de recurso
   */
  _validateFileType(mimeType, type) {
    const allowedTypes = {
      book: ['application/pdf'],
      article: ['application/pdf'],
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      guide: ['application/pdf'],
      case_study: ['application/pdf'],
    };

    const allowed = allowedTypes[type] || [];

    if (!allowed.includes(mimeType)) {
      throw new Error(`Invalid file type for ${type}. Allowed: ${allowed.join(', ')}`);
    }
  }
}

module.exports = UploadResourceUseCase;
