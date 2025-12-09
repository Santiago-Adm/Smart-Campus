/**
 * Validator: Predict Dropout Risk
 * Validación de parámetros para predicción de deserción
 */

const Joi = require('joi');

const PredictDropoutValidator = Joi.object({
  userId: Joi.string().optional().allow(null, ''),

  userIds: Joi.array().items(Joi.string()).optional().allow(null),
})
  .optional() // Esto permite que el body esté vacío
  .allow(null, {}); // Permite null o objeto vacío

module.exports = PredictDropoutValidator;
