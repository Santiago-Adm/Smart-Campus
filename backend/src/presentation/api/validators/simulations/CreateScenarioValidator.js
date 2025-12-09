/**
 * Validator: Create Scenario
 * Valida datos para creación de escenario AR
 */

const Joi = require('joi');

const createScenarioSchema = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 5 characters',
    'string.max': 'Title cannot exceed 200 characters',
  }),

  description: Joi.string().max(2000).optional().messages({
    'string.max': 'Description cannot exceed 2000 characters',
  }),

  category: Joi.string()
    .valid('venopuncion', 'rcp', 'cateterismo', 'curacion', 'inyeccion', 'signos_vitales', 'otros')
    .required()
    .messages({
      'any.only': 'Invalid category',
      'any.required': 'Category is required',
    }),

  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').required().messages({
    'any.only': 'Difficulty must be: beginner, intermediate, or advanced',
    'any.required': 'Difficulty is required',
  }),

  steps: Joi.alternatives()
    .try(
      Joi.array()
        .items(
          Joi.object({
            title: Joi.string().required().messages({
              'any.required': 'Step title is required',
            }),
            description: Joi.string().required().messages({
              'any.required': 'Step description is required',
            }),
            expectedTime: Joi.number().optional(),
          })
        )
        .min(1)
        .required(),
      Joi.string().required() // JSON string
    )
    .required()
    .messages({
      'any.required': 'Steps are required',
      'array.min': 'At least one step is required',
    }),

  criteria: Joi.alternatives()
    .try(
      Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          description: Joi.string().required(),
          weight: Joi.number().optional(),
        })
      ),
      Joi.string() // JSON string
    )
    .optional(),

  estimatedDuration: Joi.number().integer().min(5).max(120).default(15).optional().messages({
    'number.min': 'Estimated duration must be at least 5 minutes',
    'number.max': 'Estimated duration cannot exceed 120 minutes',
  }),

  isPublic: Joi.boolean().default(false).optional().messages({
    'boolean.base': 'isPublic must be a boolean',
  }),
});

module.exports = createScenarioSchema;
