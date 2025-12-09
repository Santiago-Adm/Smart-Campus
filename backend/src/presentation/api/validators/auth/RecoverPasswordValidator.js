/**
 * Recover Password Validator
 * Valida la solicitud de recuperación de contraseña
 */

const Joi = require('joi');

const recoverPasswordSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim().messages({
    'string.email': 'Email debe tener un formato válido',
    'any.required': 'Email es requerido',
    'string.empty': 'Email no puede estar vacío',
  }),
});

module.exports = recoverPasswordSchema;
