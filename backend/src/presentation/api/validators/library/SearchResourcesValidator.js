/**
 * Validator: Search Resources
 * Valida parámetros de búsqueda de recursos
 */

const Joi = require('joi');

const searchResourcesSchema = Joi.object({
  search: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Search term must be at least 2 characters',
    'string.max': 'Search term cannot exceed 100 characters',
  }),

  category: Joi.string()
    .valid(
      'ANATOMY',
      'PHYSIOLOGY',
      'PHARMACOLOGY',
      'PROCEDURES',
      'ETHICS',
      'EMERGENCY',
      'PEDIATRICS',
      'GERIATRICS',
      'MENTAL_HEALTH',
      'COMMUNITY',
      'OTHER'
    )
    .optional()
    .messages({
      'any.only': 'Invalid category',
    }),

  type: Joi.string().valid('book', 'article', 'video', 'guide', 'case_study').optional().messages({
    'any.only': 'Type must be: book, article, video, guide, or case_study',
  }),

  tags: Joi.string().optional().messages({
    'string.base': 'Tags must be a comma-separated string',
  }),

  language: Joi.string().valid('es', 'en', 'pt', 'qu').optional().messages({
    'any.only': 'Language must be: es, en, pt, or qu',
  }),

  isPublic: Joi.boolean().optional().messages({
    'boolean.base': 'isPublic must be a boolean',
  }),

  minRating: Joi.number().min(0).max(5).optional().messages({
    'number.min': 'minRating must be at least 0',
    'number.max': 'minRating cannot exceed 5',
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
    .valid(
      'createdAt',
      'updatedAt',
      'viewCount',
      'downloadCount',
      'averageRating',
      'title',
      'popular',
      'rating'
    )
    .default('createdAt')
    .optional()
    .messages({
      'any.only': 'Invalid sortBy field',
    }),

  sortOrder: Joi.string().valid('asc', 'desc').default('desc').optional().messages({
    'any.only': 'sortOrder must be asc or desc',
  }),
});

module.exports = searchResourcesSchema;
