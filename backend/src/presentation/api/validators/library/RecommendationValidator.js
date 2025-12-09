/**
 * Validator: Recommendation
 * Valida parámetros para solicitar recomendaciones
 */

const Joi = require('joi');

const recommendationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(10).optional().messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 50',
  }),

  strategy: Joi.string()
    .valid('popular', 'rating', 'personalized')
    .default('popular')
    .optional()
    .messages({
      'any.only': 'Strategy must be: popular, rating, or personalized',
    }),
});

module.exports = recommendationSchema;
