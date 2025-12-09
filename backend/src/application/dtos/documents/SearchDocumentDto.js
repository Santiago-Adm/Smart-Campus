/**
 * SearchDocument DTO
 * Define la estructura y validación para buscar documentos
 */

// eslint-disable-next-line max-classes-per-file
const Joi = require('joi');
const { DocumentType } = require('../../../domain/enums/DocumentType.enum');
const { DocumentStatus } = require('../../../domain/enums/DocumentStatus.enum');

class SearchDocumentDto {
  constructor(data) {
    this.userId = data.userId;
    this.documentType = data.documentType;
    this.status = data.status;
    this.dateFrom = data.dateFrom;
    this.dateTo = data.dateTo;
    this.page = data.page || 1;
    this.limit = data.limit || 20;
    this.sortBy = data.sortBy || 'createdAt';
    this.sortOrder = data.sortOrder || 'desc';
  }

  /**
   * Schema de validación Joi
   */
  static get schema() {
    return Joi.object({
      userId: Joi.string().uuid().optional().messages({
        'string.uuid': 'userId debe ser un UUID válido',
      }),

      documentType: Joi.string()
        .valid(...Object.values(DocumentType))
        .optional()
        .messages({
          'any.only': `Tipo de documento debe ser uno de: ${Object.values(DocumentType).join(', ')}`,
        }),

      status: Joi.string()
        .valid(...Object.values(DocumentStatus))
        .optional()
        .messages({
          'any.only': `Estado debe ser uno de: ${Object.values(DocumentStatus).join(', ')}`,
        }),

      dateFrom: Joi.date().optional().messages({
        'date.base': 'dateFrom debe ser una fecha válida',
      }),

      dateTo: Joi.date().optional().min(Joi.ref('dateFrom')).messages({
        'date.base': 'dateTo debe ser una fecha válida',
        'date.min': 'dateTo debe ser posterior a dateFrom',
      }),

      page: Joi.number().integer().min(1).default(1).optional().messages({
        'number.base': 'page debe ser un número',
        'number.integer': 'page debe ser un número entero',
        'number.min': 'page debe ser al menos 1',
      }),

      limit: Joi.number().integer().min(1).max(100).default(20).optional().messages({
        'number.base': 'limit debe ser un número',
        'number.integer': 'limit debe ser un número entero',
        'number.min': 'limit debe ser al menos 1',
        'number.max': 'limit no puede ser mayor a 100',
      }),

      sortBy: Joi.string()
        .valid('createdAt', 'updatedAt', 'status', 'documentType')
        .default('createdAt')
        .optional()
        .messages({
          'any.only': 'sortBy debe ser: createdAt, updatedAt, status o documentType',
        }),

      sortOrder: Joi.string().valid('asc', 'desc').default('desc').optional().messages({
        'any.only': 'sortOrder debe ser: asc o desc',
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

    return new SearchDocumentDto(value);
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

module.exports = SearchDocumentDto;
