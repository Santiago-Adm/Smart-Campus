/**
 * Validator: Record Metrics
 * Valida métricas de simulación completada
 */

const Joi = require('joi');

const recordMetricsSchema = Joi.object({
  scenarioId: Joi.string().required().messages({
    'string.empty': 'Scenario ID is required',
    'any.required': 'Scenario ID is required',
  }),

  sessionId: Joi.string().required().messages({
    'string.empty': 'Session ID is required',
    'any.required': 'Session ID is required',
  }),

  startedAt: Joi.date().iso().required().messages({
    'date.base': 'startedAt must be a valid date',
    'date.format': 'startedAt must be in ISO format',
    'any.required': 'startedAt is required',
  }),

  completedAt: Joi.date()
    .iso()
    .default(() => new Date())
    .optional()
    .messages({
      'date.base': 'completedAt must be a valid date',
      'date.format': 'completedAt must be in ISO format',
    }),

  stepsCompleted: Joi.number().integer().min(0).required().messages({
    'number.base': 'stepsCompleted must be a number',
    'number.min': 'stepsCompleted cannot be negative',
    'any.required': 'stepsCompleted is required',
  }),

  stepsTotal: Joi.number().integer().min(1).required().messages({
    'number.base': 'stepsTotal must be a number',
    'number.min': 'stepsTotal must be at least 1',
    'any.required': 'stepsTotal is required',
  }),

  accuracy: Joi.number().min(0).max(1).default(0).optional().messages({
    'number.min': 'Accuracy must be between 0 and 1',
    'number.max': 'Accuracy must be between 0 and 1',
  }),

  score: Joi.number().min(0).max(100).default(0).optional().messages({
    'number.min': 'Score must be between 0 and 100',
    'number.max': 'Score must be between 0 and 100',
  }),

  errors: Joi.array()
    .items(
      Joi.object({
        step: Joi.number().required().messages({
          'any.required': 'Error step number is required',
        }),
        type: Joi.string().required().messages({
          'any.required': 'Error type is required',
        }),
        attempts: Joi.number().default(1).optional(),
        timestamp: Joi.date().optional(),
      })
    )
    .default([])
    .optional(),

  vitalSignsData: Joi.object().optional(),
});

module.exports = recordMetricsSchema;
