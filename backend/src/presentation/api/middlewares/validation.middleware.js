/**
 * Validation Middleware
 * Valida el body, query o params del request usando schemas de Joi
 */

/**
 * Middleware factory para validar requests
 * @param {Object} schema - Schema de Joi
 * @param {string} source - 'body' | 'query' | 'params'
 * @returns {Function} Express middleware
 */
const validate =
  (schema, source = 'body') =>
  // eslint-disable-next-line consistent-return
  (req, res, next) => {
    // Obtener los datos a validar según el source
    const dataToValidate = req[source];

    // Verificar si el schema es un objeto de Joi válido
    if (!schema || typeof schema.validate !== 'function') {
      console.error('❌ Invalid Joi schema provided to validation middleware');
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error: Invalid validation schema',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Validar con Joi
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Retornar todos los errores, no solo el primero
      stripUnknown: true, // Eliminar campos no definidos en el schema
    });

    // Si hay errores de validación
    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Errores de validación',
          details: errorMessages,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Reemplazar los datos originales con los validados y sanitizados
    req[source] = value;

    // Continuar al siguiente middleware
    next();
  };

module.exports = validate;
