/**
 * Validator: Generate Report
 * Validación de parámetros para generación de reportes
 */

const Joi = require('joi');

const GenerateReportValidator = Joi.object({
  reportType: Joi.string()
    .valid(
      'enrollment',
      'academic_performance',
      'library_usage',
      'appointments',
      'simulations',
      'general'
    )
    .required()
    .messages({
      'any.required': 'Report type is required',
      'any.only': 'Invalid report type',
    }),

  format: Joi.string().valid('PDF', 'EXCEL', 'pdf', 'excel').optional().default('PDF').messages({
    'any.only': 'Format must be PDF or EXCEL',
  }),

  startDate: Joi.date().optional().allow(null, ''),

  endDate: Joi.date().optional().allow(null, '').greater(Joi.ref('startDate')).messages({
    'date.greater': 'End date must be after start date',
  }),

  userId: Joi.string().optional().allow(null, ''),

  userRole: Joi.string()
    .valid('STUDENT', 'TEACHER', 'ADMIN', 'IT_ADMIN', 'DIRECTOR')
    .optional()
    .allow(null, ''),

  includeCharts: Joi.boolean().optional().default(false),
});

module.exports = GenerateReportValidator;
