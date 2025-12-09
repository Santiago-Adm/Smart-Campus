/**
 * Validator: Escalate Conversation
 * Validación de parámetros para escalar conversación a soporte humano
 */

const Joi = require('joi');

const EscalateValidator = Joi.object({
  conversationId: Joi.string().required().messages({
    'string.empty': 'Conversation ID cannot be empty',
    'any.required': 'Conversation ID is required',
  }),

  reason: Joi.string().trim().max(500).optional().allow(null, '').messages({
    'string.max': 'Reason cannot exceed 500 characters',
  }),

  priority: Joi.string()
    .valid('LOW', 'MEDIUM', 'HIGH', 'low', 'medium', 'high')
    .optional()
    .default('MEDIUM')
    .messages({
      'any.only': 'Priority must be LOW, MEDIUM, or HIGH',
    }),
});

module.exports = EscalateValidator;
