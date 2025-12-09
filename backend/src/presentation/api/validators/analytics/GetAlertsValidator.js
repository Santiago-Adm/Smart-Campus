/**
 * Validator: Get Alerts
 * Validación de parámetros para obtener alertas
 */

const Joi = require('joi');

const GetAlertsValidator = Joi.object({
  severity: Joi.string()
    .valid('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'critical', 'high', 'medium', 'low')
    .optional()
    .allow(null, ''),

  category: Joi.string()
    .valid(
      'USERS',
      'DOCUMENTS',
      'APPOINTMENTS',
      'ACADEMIC',
      'users',
      'documents',
      'appointments',
      'academic'
    )
    .optional()
    .allow(null, ''),

  limit: Joi.number().integer().min(1).max(200).optional().default(50).messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 200',
  }),
});

module.exports = GetAlertsValidator;
