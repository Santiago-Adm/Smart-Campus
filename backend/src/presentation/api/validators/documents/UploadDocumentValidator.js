/**
 * Validator: Upload Document
 * Valida la subida de un nuevo documento
 */

const Joi = require('joi');

const uploadDocumentSchema = Joi.object({
  documentType: Joi.string()
    .valid('DNI', 'CERTIFICATE', 'MEDICAL', 'PROOF_OF_ADDRESS', 'OTHER')
    .required()
    .messages({
      'any.required': 'El tipo de documento es requerido',
      'any.only':
        'Tipo de documento no válido. Valores permitidos: DNI, CERTIFICATE, MEDICAL, PROOF_OF_ADDRESS, OTHER',
    }),

  description: Joi.string().min(5).max(500).optional().messages({
    'string.min': 'La descripción debe tener al menos 5 caracteres',
    'string.max': 'La descripción no puede exceder 500 caracteres',
  }),

  issueDate: Joi.date().iso().max('now').optional().messages({
    'date.base': 'La fecha de emisión debe ser una fecha válida',
    'date.max': 'La fecha de emisión no puede ser futura',
  }),
});

module.exports = uploadDocumentSchema;
