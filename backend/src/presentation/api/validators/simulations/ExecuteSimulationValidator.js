/**
 * Validator: Execute Simulation
 * Valida parámetros de ejecución de simulación
 */

const Joi = require('joi');

const executeSimulationSchema = Joi.object({
  action: Joi.string()
    .valid('start', 'pause', 'resume', 'complete')
    .default('start')
    .optional()
    .messages({
      'any.only': 'Action must be: start, pause, resume, or complete',
    }),
});

module.exports = executeSimulationSchema;
