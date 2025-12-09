/**
 * Validator: Validate Document
 * Valida el request para validación automática con OCR
 */

const Joi = require('joi');

const validateDocumentSchema = Joi.object({
  // Este endpoint solo necesita el ID del documento (que viene por params)
  // Pero podemos validar opciones adicionales si se necesitan en el futuro

  forceValidation: Joi.boolean().optional().default(false).messages({
    'boolean.base': 'forceValidation debe ser un valor booleano',
  }),
});

module.exports = validateDocumentSchema;
