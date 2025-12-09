/**
 * Error Handler Middleware
 * Maneja todos los errores de la aplicación de forma centralizada
 * Este middleware debe ser el último en la cadena de middlewares
 */

const config = require('../../../infrastructure/config/env.config');

/**
 * Middleware de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  // Log del error completo (solo en desarrollo)
  if (config.env === 'development') {
    console.error('❌ Error caught by errorHandler:', err);
  }

  // Determinar el código de estado HTTP
  let statusCode = err.statusCode || 500;
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Error interno del servidor',
      code: err.code || 'INTERNAL_ERROR',
    },
    timestamp: new Date().toISOString(),
  };

  // Errores de validación de Joi (aunque el validation middleware debería capturarlos)
  if (err.name === 'ValidationError' && err.isJoi) {
    statusCode = 400;
    errorResponse.error.message = 'Errores de validación';
    errorResponse.error.details = err.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
  }

  // Errores de validación de Mongoose
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    errorResponse.error.message = 'Errores de validación';
    errorResponse.error.details = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
  }

  // Errores de Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    errorResponse.error.message = 'Errores de validación';
    errorResponse.error.details = err.errors.map((error) => ({
      field: error.path,
      message: error.message,
    }));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    errorResponse.error.message = 'El registro ya existe';
    errorResponse.error.code = 'DUPLICATE_ENTRY';
    errorResponse.error.details = err.errors.map((error) => ({
      field: error.path,
      message: `${error.path} ya está en uso`,
    }));
  }

  // Errores de JWT (aunque el auth middleware debería capturarlos)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorResponse.error.message = 'Token inválido';
    errorResponse.error.code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorResponse.error.message = 'Token expirado';
    errorResponse.error.code = 'TOKEN_EXPIRED';
  }

  // Errores de MongoDB
  if (err.name === 'MongoError' && err.code === 11000) {
    statusCode = 409;
    errorResponse.error.message = 'El registro ya existe';
    errorResponse.error.code = 'DUPLICATE_ENTRY';
  }

  // Errores de casteo (ID inválido)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorResponse.error.message = `ID inválido: ${err.value}`;
    errorResponse.error.code = 'INVALID_ID';
  }

  // En desarrollo, incluir stack trace
  if (config.env === 'development') {
    errorResponse.stack = err.stack;
  }

  // Enviar respuesta de error
  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para manejar rutas no encontradas (404)
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
      code: 'ROUTE_NOT_FOUND',
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
