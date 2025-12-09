/**
 * Register Validator
 * Valida los datos de registro usando Joi
 */

const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim().messages({
    'string.email': 'Email debe tener un formato válido',
    'any.required': 'Email es requerido',
    'string.empty': 'Email no puede estar vacío',
  }),

  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Contraseña debe tener al menos 8 caracteres',
      'string.max': 'Contraseña no puede exceder 100 caracteres',
      'string.pattern.base':
        'Contraseña debe contener al menos una mayúscula, una minúscula y un número',
      'any.required': 'Contraseña es requerida',
      'string.empty': 'Contraseña no puede estar vacía',
    }),

  firstName: Joi.string().min(2).max(50).required().trim().messages({
    'string.min': 'Nombre debe tener al menos 2 caracteres',
    'string.max': 'Nombre no puede exceder 50 caracteres',
    'any.required': 'Nombre es requerido',
    'string.empty': 'Nombre no puede estar vacío',
  }),

  lastName: Joi.string().min(2).max(50).required().trim().messages({
    'string.min': 'Apellido debe tener al menos 2 caracteres',
    'string.max': 'Apellido no puede exceder 50 caracteres',
    'any.required': 'Apellido es requerido',
    'string.empty': 'Apellido no puede estar vacío',
  }),

  dni: Joi.string()
    .pattern(/^\d{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'DNI debe tener exactamente 8 dígitos',
      'any.required': 'DNI es requerido',
      'string.empty': 'DNI no puede estar vacío',
    }),

  phone: Joi.string()
    .pattern(/^9\d{8}$/)
    .optional()
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Teléfono debe tener 9 dígitos y comenzar con 9',
    }),

  dateOfBirth: Joi.date().optional().allow(null).messages({
    'date.base': 'Fecha de nacimiento debe ser una fecha válida',
  }),
});

module.exports = registerSchema;
