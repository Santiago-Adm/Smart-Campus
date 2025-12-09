/**
 * Validator: Get Contextual Info
 * Validación de parámetros para obtener información contextual
 */

const Joi = require('joi');

const GetContextValidator = Joi.object({
  contextType: Joi.string().valid('light', 'full').optional().default('full').messages({
    'any.only': 'Context type must be "light" or "full"',
  }),
});

module.exports = GetContextValidator;
