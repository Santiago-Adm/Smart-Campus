/**
 * Validator: Update Appointment Status
 * Valida datos para actualizar estado de cita
 */

const Joi = require('joi');

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')
    .required()
    .messages({
      'any.only': 'Invalid status',
      'any.required': 'Status is required',
    }),

  notes: Joi.string().max(1000).optional().messages({
    'string.max': 'Notes cannot exceed 1000 characters',
  }),
});

module.exports = updateStatusSchema; // IMPORTANTE: exportar el schema directamente
