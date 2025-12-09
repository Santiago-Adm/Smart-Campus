/**
 * Validator: Get Dashboard Data
 * Validación de parámetros para obtener datos del dashboard
 */

const Joi = require('joi');

const GetDashboardValidator = Joi.object({
  userId: Joi.string().optional().allow(null, ''),
  userRole: Joi.string()
    .valid('STUDENT', 'TEACHER', 'ADMIN', 'IT_ADMIN', 'DIRECTOR')
    .optional()
    .allow(null, ''),
  startDate: Joi.date().optional().allow(null, ''),
  endDate: Joi.date().optional().allow(null, '').greater(Joi.ref('startDate')),
});

module.exports = GetDashboardValidator;
