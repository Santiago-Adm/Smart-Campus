/**
 * Validator: Upload Resource
 * Valida datos para subir un recurso
 */

const Joi = require('joi');

const uploadResourceSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'any.required': 'Title is required',
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 200 characters',
  }),

  description: Joi.string().max(2000).optional().messages({
    'string.max': 'Description cannot exceed 2000 characters',
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
    .required()
    .messages({
      'any.required': 'Category is required',
      'any.only': 'Invalid category',
    }),

  type: Joi.string().valid('book', 'article', 'video', 'guide', 'case_study').required().messages({
    'any.required': 'Type is required',
    'any.only': 'Type must be: book, article, video, guide, or case_study',
  }),

  author: Joi.string().max(100).optional().messages({
    'string.max': 'Author name cannot exceed 100 characters',
  }),

  publisher: Joi.string().max(100).optional().messages({
    'string.max': 'Publisher name cannot exceed 100 characters',
  }),

  publicationDate: Joi.date().iso().max('now').optional().messages({
    'date.base': 'Publication date must be a valid date',
    'date.max': 'Publication date cannot be in the future',
  }),

  tags: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional().messages({
    'alternatives.types': 'Tags must be an array or comma-separated string',
  }),

  language: Joi.string().valid('es', 'en', 'pt', 'qu').default('es').optional().messages({
    'any.only': 'Language must be: es, en, pt, or qu',
  }),

  pageCount: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Page count must be a number',
    'number.min': 'Page count must be at least 1',
  }),

  duration: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Duration must be a number (seconds)',
    'number.min': 'Duration must be at least 1 second',
  }),

  isPublic: Joi.boolean().default(true).optional().messages({
    'boolean.base': 'isPublic must be a boolean',
  }),
});

module.exports = uploadResourceSchema;
