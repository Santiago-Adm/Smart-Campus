/**
 * Validator: Approve Document
 * Valida el request para aprobar un documento
 */

const Joi = require('joi');

const approveDocumentSchema = Joi.object({
  notes: Joi.string().min(5).max(1000).optional().messages({
    'string.min': 'Las notas deben tener al menos 5 caracteres',
    'string.max': 'Las notas no pueden exceder 1000 caracteres',
  }),
});

module.exports = approveDocumentSchema;
