/**
 * UploadDocument DTO
 * Define la estructura y validación para subir un documento
 */

// eslint-disable-next-line max-classes-per-file
const Joi = require('joi');
const { DocumentType } = require('../../../domain/enums/DocumentType.enum');

class UploadDocumentDto {
  constructor(data) {
    this.userId = data.userId;
    this.documentType = data.documentType;
    this.description = data.description;
    this.issueDate = data.issueDate;
    // File data (agregado después del upload)
    this.fileBuffer = data.fileBuffer;
    this.fileName = data.fileName;
    this.mimeType = data.mimeType;
    this.fileSize = data.fileSize;
  }

  /**
   * Schema de validación Joi
   */
  static get schema() {
    return Joi.object({
      userId: Joi.string().uuid().required().messages({
        'string.empty': 'userId es requerido',
        'string.uuid': 'userId debe ser un UUID válido',
        'any.required': 'userId es requerido',
      }),

      documentType: Joi.string()
        .valid(...Object.values(DocumentType))
        .required()
        .messages({
          'string.empty': 'Tipo de documento es requerido',
          'any.only': `Tipo de documento debe ser uno de: ${Object.values(DocumentType).join(', ')}`,
          'any.required': 'Tipo de documento es requerido',
        }),

      description: Joi.string().max(500).optional().allow('').messages({
        'string.max': 'La descripción no puede exceder 500 caracteres',
      }),

      issueDate: Joi.date().max('now').required().messages({
        'date.base': 'Fecha de emisión debe ser una fecha válida',
        'date.max': 'Fecha de emisión no puede ser futura',
        'any.required': 'Fecha de emisión es requerida',
      }),

      // File validation (se valida después del multer)
      fileName: Joi.string().required().messages({
        'string.empty': 'Nombre del archivo es requerido',
        'any.required': 'Nombre del archivo es requerido',
      }),

      mimeType: Joi.string()
        .valid('application/pdf', 'image/jpeg', 'image/jpg', 'image/png')
        .required()
        .messages({
          'string.empty': 'Tipo de archivo es requerido',
          'any.only': 'Solo se permiten archivos PDF, JPG y PNG',
          'any.required': 'Tipo de archivo es requerido',
        }),

      fileSize: Joi.number()
        .max(50 * 1024 * 1024) // 50MB
        .required()
        .messages({
          'number.base': 'Tamaño del archivo debe ser un número',
          'number.max': 'El archivo no puede superar 50MB',
          'any.required': 'Tamaño del archivo es requerido',
        }),
    });
  }

  /**
   * Validar datos
   */
  static validate(data) {
    const { error, value } = this.schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      // eslint-disable-next-line no-use-before-define
      throw new ValidationError('Errores de validación', errors);
    }

    return new UploadDocumentDto(value);
  }
}

// Custom ValidationError
class ValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

module.exports = UploadDocumentDto;
