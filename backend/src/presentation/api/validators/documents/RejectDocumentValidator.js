/**
 * Validator: Reject Document
 * Valida el request para rechazar un documento
 */

const Joi = require('joi');

const rejectDocumentSchema = Joi.object({
  reason: Joi.string().min(10).max(1000).required().messages({
    'any.required': 'La razón del rechazo es requerida',
    'string.min': 'La razón debe tener al menos 10 caracteres',
    'string.max': 'La razón no puede exceder 1000 caracteres',
    'string.empty': 'La razón no puede estar vacía',
  }),
});

module.exports = rejectDocumentSchema;
