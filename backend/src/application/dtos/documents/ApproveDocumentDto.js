/**
 * ApproveDocument DTO
 * Define la estructura y validación para aprobar un documento
 */

// eslint-disable-next-line max-classes-per-file
const Joi = require('joi');

class ApproveDocumentDto {
  constructor(data) {
    this.documentId = data.documentId;
    this.approvedBy = data.approvedBy;
    this.notes = data.notes;
  }

  /**
   * Schema de validación Joi
   */
  static get schema() {
    return Joi.object({
      documentId: Joi.string().uuid().required().messages({
        'string.empty': 'documentId es requerido',
        'string.uuid': 'documentId debe ser un UUID válido',
        'any.required': 'documentId es requerido',
      }),

      approvedBy: Joi.string().uuid().required().messages({
        'string.empty': 'approvedBy es requerido',
        'string.uuid': 'approvedBy debe ser un UUID válido',
        'any.required': 'approvedBy es requerido',
      }),

      notes: Joi.string().max(1000).optional().allow('').messages({
        'string.max': 'Las notas no pueden exceder 1000 caracteres',
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

    return new ApproveDocumentDto(value);
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

module.exports = ApproveDocumentDto;
