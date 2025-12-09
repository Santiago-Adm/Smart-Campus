/**
 * Validator: Process Message
 * Validación de parámetros para procesar mensajes del chatbot
 */

const Joi = require('joi');

const ProcessMessageValidator = Joi.object({
  message: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Message cannot be empty',
    'string.min': 'Message must be at least 1 character',
    'string.max': 'Message cannot exceed 2000 characters',
    'any.required': 'Message is required',
  }),

  conversationId: Joi.string().optional().allow(null, ''),
});

module.exports = ProcessMessageValidator;
