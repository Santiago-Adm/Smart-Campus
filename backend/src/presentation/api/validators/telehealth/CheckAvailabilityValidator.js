/**
 * Validator: Check Availability
 * Valida datos para verificar disponibilidad
 */

const Joi = require('joi');

const checkAvailabilitySchema = Joi.object({
  teacherId: Joi.string().required().messages({
    'string.empty': 'Teacher ID is required',
    'any.required': 'Teacher ID is required',
  }),

  scheduledAt: Joi.date().iso().greater('now').required().messages({
    'date.base': 'scheduledAt must be a valid date',
    'date.format': 'scheduledAt must be in ISO format',
    'date.greater': 'scheduledAt must be a future date',
    'any.required': 'scheduledAt is required',
  }),

  duration: Joi.number().integer().min(15).max(120).default(30).optional().messages({
    'number.base': 'Duration must be a number',
    'number.min': 'Duration must be at least 15 minutes',
    'number.max': 'Duration cannot exceed 120 minutes',
  }),
});

module.exports = checkAvailabilitySchema;
