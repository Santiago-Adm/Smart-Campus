/**
 * Validator: Track Usage
 * Valida datos para registrar uso de recursos
 */

const Joi = require('joi');

const trackUsageSchema = Joi.object({
  action: Joi.string().valid('view', 'download', 'rate').required().messages({
    'any.required': 'Action is required',
    'any.only': 'Action must be: view, download, or rate',
  }),

  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .when('action', {
      is: 'rate',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      'any.required': 'Rating is required when action is "rate"',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.unknown': 'Rating is only allowed when action is "rate"',
    }),
});

module.exports = trackUsageSchema;
