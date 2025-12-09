/**
 * Refresh Token Validator
 * Valida la solicitud de renovación de token
 */

const Joi = require('joi');

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().min(10).messages({
    'any.required': 'Refresh token es requerido',
    'string.empty': 'Refresh token no puede estar vacío',
    'string.min': 'Refresh token inválido',
  }),
});

module.exports = refreshTokenSchema;
