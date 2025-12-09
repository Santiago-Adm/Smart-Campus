/**
 * Validator: Search Documents
 * Valida los filtros de búsqueda
 */

const Joi = require('joi');

const searchDocumentSchema = Joi.object({
  userId: Joi.string().uuid().optional().messages({
    'string.uuid': 'El userId debe ser un UUID válido',
  }),

  documentType: Joi.string()
    .valid('DNI', 'CERTIFICATE', 'MEDICAL', 'PROOF_OF_ADDRESS', 'OTHER')
    .optional()
    .messages({
      'any.only': 'Tipo de documento no válido',
    }),

  status: Joi.string().valid('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED').optional().messages({
    'any.only': 'Estado no válido. Valores permitidos: PENDING, IN_REVIEW, APPROVED, REJECTED',
  }),

  dateFrom: Joi.date().iso().optional().messages({
    'date.base': 'dateFrom debe ser una fecha válida',
  }),

  dateTo: Joi.date().iso().min(Joi.ref('dateFrom')).optional().messages({
    'date.base': 'dateTo debe ser una fecha válida',
    'date.min': 'dateTo debe ser posterior a dateFrom',
  }),

  page: Joi.number().integer().min(1).default(1).optional().messages({
    'number.base': 'page debe ser un número',
    'number.min': 'page debe ser mayor o igual a 1',
  }),

  limit: Joi.number().integer().min(1).max(100).default(10).optional().messages({
    'number.base': 'limit debe ser un número',
    'number.min': 'limit debe ser mayor o igual a 1',
    'number.max': 'limit no puede exceder 100',
  }),

  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'metadata.type', 'status')
    .default('createdAt')
    .optional()
    .messages({
      'any.only': 'Campo de ordenamiento no válido',
    }),

  sortOrder: Joi.string().valid('asc', 'desc').default('desc').optional().messages({
    'any.only': 'Orden no válido. Valores permitidos: asc, desc',
  }),
});

module.exports = searchDocumentSchema;
