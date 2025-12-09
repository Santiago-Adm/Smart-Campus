/**
 * Validator para agendar citas
 */

const Joi = require('joi');

const scheduleAppointmentSchema = Joi.object({
  // ✅ CRÍTICO: studentId es OPCIONAL (para STUDENT no se envía, para ADMIN sí)
  studentId: Joi.string().uuid().optional().allow(null, ''),

  // teacherId es obligatorio
  teacherId: Joi.string().uuid().required().messages({
    'string.empty': 'El teacherId es obligatorio',
    'string.guid': 'El teacherId debe ser un UUID válido',
    'any.required': 'El teacherId es obligatorio',
  }),

  // scheduledAt es obligatorio
  scheduledAt: Joi.date().iso().required().messages({
    'date.base': 'La fecha debe ser válida',
    'date.format': 'La fecha debe estar en formato ISO',
    'any.required': 'La fecha y hora son obligatorias',
  }),

  // duration es obligatorio (15-120 minutos)
  duration: Joi.number().integer().min(15).max(120).required().messages({
    'number.base': 'La duración debe ser un número',
    'number.min': 'La duración mínima es 15 minutos',
    'number.max': 'La duración máxima es 120 minutos',
    'any.required': 'La duración es obligatoria',
  }),

  // reason es obligatorio (mínimo 10 caracteres)
  reason: Joi.string().min(10).max(500).required().messages({
    'string.empty': 'El motivo es obligatorio',
    'string.min': 'El motivo debe tener al menos 10 caracteres',
    'string.max': 'El motivo no puede exceder 500 caracteres',
    'any.required': 'El motivo es obligatorio',
  }),
}).options({
  // ✅ CRÍTICO: No eliminar campos desconocidos
  stripUnknown: false,
  abortEarly: false,
});

module.exports = scheduleAppointmentSchema;
