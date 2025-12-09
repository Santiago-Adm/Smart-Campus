/**
 * Express Application Setup
 * Configura la aplicación Express con todos sus middlewares y rutas
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Middlewares
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler.middleware');

// Routes
const setupRoutes = require('./routes');

/**
 * Crear y configurar la aplicación Express
 * @param {Object} controllers - Controllers con dependencias inyectadas
 * @returns {Express} Aplicación Express configurada
 */
const createApp = (controllers) => {
  const app = express();

  // ============================================
  // SEGURIDAD
  // ============================================
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'default-src': ["'self'"],
          'frame-ancestors': ["'self'", 'http://localhost:3001'], // ✅ Permitir iframe desde frontend
          'frame-src': ["'self'", 'http://localhost:3000'], // ✅ Permitir iframe para previsualización
          'media-src': ["'self'", 'http://localhost:3000', 'blob:', 'data:'], // ✅ Permitir videos
          'img-src': ["'self'", 'http://localhost:3000', 'data:', 'blob:'], // ✅ Permitir imágenes
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configurado correctamente
  const corsOptions = {
    origin: [
      'http://localhost:3001', // Frontend en desarrollo
      'http://localhost:3000', // Backend (para archivos estáticos)
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    exposedHeaders: ['Content-Length', 'Content-Type', 'Content-Range', 'Accept-Ranges'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  };
  app.use(cors(corsOptions));

  // ============================================
  // PARSERS
  // ============================================
  // Parser de JSON
  app.use(express.json({ limit: '10mb' }));

  // Parser de URL-encoded
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ============================================
  // ARCHIVOS ESTÁTICOS (MOCK MODE) - CONFIGURACIÓN COMPLETA
  // ============================================
  const storagePath = path.join(__dirname, '../../../storage/uploads');

  // ✅ Middleware CORS completo para archivos estáticos
  // eslint-disable-next-line consistent-return
  app.use('/storage/uploads', (req, res, next) => {
    // Headers CORS necesarios
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // ✅ Soportar solicitudes de rango (para videos)
    res.setHeader('Accept-Ranges', 'bytes');

    // Para solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  // ✅ Servir archivos estáticos con soporte de rango
  app.use(
    '/storage/uploads',
    express.static(storagePath, {
      acceptRanges: true, // ✅ CRÍTICO: Habilitar soporte de rango
      etag: true,
      lastModified: true,
      maxAge: 0, // Sin caché en desarrollo
    })
  );

  console.log('📁 Serving local storage files from:', storagePath);

  // ============================================
  // LOGGING
  // ============================================
  // Morgan - HTTP request logger
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // ============================================
  // RUTAS
  // ============================================
  // Montar rutas de la API
  app.use('/api', setupRoutes(controllers));

  // ============================================
  // ERROR HANDLERS
  // ============================================
  // 404 - Ruta no encontrada
  app.use(notFoundHandler);

  // Error handler global (debe ser el último middleware)
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
