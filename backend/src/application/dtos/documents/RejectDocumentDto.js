/**
 * RejectDocument DTO
 * Define la estructura y validación para rechazar un documento
 */

// eslint-disable-next-line max-classes-per-file
const Joi = require('joi');

class RejectDocumentDto {
  constructor(data) {
    this.documentId = data.documentId;
    this.rejectedBy = data.rejectedBy;
    this.reason = data.reason;
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

      rejectedBy: Joi.string().uuid().required().messages({
        'string.empty': 'rejectedBy es requerido',
        'string.uuid': 'rejectedBy debe ser un UUID válido',
        'any.required': 'rejectedBy es requerido',
      }),

      reason: Joi.string().min(10).max(1000).required().messages({
        'string.empty': 'El motivo del rechazo es requerido',
        'string.min': 'El motivo debe tener al menos 10 caracteres',
        'string.max': 'El motivo no puede exceder 1000 caracteres',
        'any.required': 'El motivo del rechazo es requerido',
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

    return new RejectDocumentDto(value);
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

module.exports = RejectDocumentDto;
