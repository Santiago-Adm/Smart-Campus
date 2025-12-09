/**
 * Validator: Get Comparative Data
 * Validación de parámetros para datos comparativos
 */

const Joi = require('joi');

const GetComparativeValidator = Joi.object({
  startDate: Joi.date().required().messages({
    'any.required': 'Start date is required',
  }),

  endDate: Joi.date().required().greater(Joi.ref('startDate')).messages({
    'any.required': 'End date is required',
    'date.greater': 'End date must be after start date',
  }),

  compareToStartDate: Joi.date().required().messages({
    'any.required': 'Comparison start date is required',
  }),

  compareToEndDate: Joi.date().required().greater(Joi.ref('compareToStartDate')).messages({
    'any.required': 'Comparison end date is required',
    'date.greater': 'Comparison end date must be after comparison start date',
  }),

  metric: Joi.string()
    .valid('all', 'users', 'appointments', 'simulations')
    .optional()
    .default('all'),
});

module.exports = GetComparativeValidator;
