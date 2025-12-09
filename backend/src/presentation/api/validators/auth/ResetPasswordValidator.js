/**
 * Reset Password Validator
 * Valida el reseteo de contraseña con token
 */

const Joi = require('joi');

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().min(10).messages({
    'any.required': 'Token es requerido',
    'string.empty': 'Token no puede estar vacío',
    'string.min': 'Token inválido',
  }),

  newPassword: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Contraseña debe tener al menos 8 caracteres',
      'string.max': 'Contraseña no puede exceder 100 caracteres',
      'string.pattern.base':
        'Contraseña debe contener al menos una mayúscula, una minúscula y un número',
      'any.required': 'Nueva contraseña es requerida',
      'string.empty': 'Nueva contraseña no puede estar vacía',
    }),

  confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({
    'any.required': 'Confirmación de contraseña es requerida',
    'any.only': 'Las contraseñas no coinciden',
    'string.empty': 'Confirmación de contraseña no puede estar vacía',
  }),
});

module.exports = resetPasswordSchema;
