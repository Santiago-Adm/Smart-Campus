/**
 * Login Validator
 * Valida las credenciales de login usando Joi
 */

const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim().messages({
    'string.email': 'Email debe tener un formato válido',
    'any.required': 'Email es requerido',
    'string.empty': 'Email no puede estar vacío',
  }),

  password: Joi.string().required().messages({
    'any.required': 'Contraseña es requerida',
    'string.empty': 'Contraseña no puede estar vacía',
  }),

  rememberMe: Joi.boolean().optional().default(false).messages({
    'boolean.base': 'RememberMe debe ser un valor booleano',
  }),
});

module.exports = loginSchema;
