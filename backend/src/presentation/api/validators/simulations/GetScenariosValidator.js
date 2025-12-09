/**
 * Validator: Get Scenarios
 * Valida parámetros de búsqueda de escenarios AR
 */

const Joi = require('joi');

const getScenariosSchema = Joi.object({
  category: Joi.string()
    .valid('venopuncion', 'rcp', 'cateterismo', 'curacion', 'inyeccion', 'signos_vitales', 'otros')
    .optional()
    .messages({
      'any.only': 'Invalid category',
    }),

  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').optional().messages({
    'any.only': 'Difficulty must be: beginner, intermediate, or advanced',
  }),

  isPublic: Joi.boolean().optional().messages({
    'boolean.base': 'isPublic must be a boolean',
  }),

  createdBy: Joi.string().optional().messages({
    'string.base': 'createdBy must be a string',
  }),

  search: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Search term must be at least 2 characters',
    'string.max': 'Search term cannot exceed 100 characters',
  }),

  page: Joi.number().integer().min(1).default(1).optional().messages({
    'number.base': 'Page must be a number',
    'number.min': 'Page must be at least 1',
  }),

  limit: Joi.number().integer().min(1).max(100).default(20).optional().messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
  }),

  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'popular', 'rating', 'title')
    .default('createdAt')
    .optional()
    .messages({
      'any.only': 'Invalid sortBy field',
    }),
});

module.exports = getScenariosSchema;
