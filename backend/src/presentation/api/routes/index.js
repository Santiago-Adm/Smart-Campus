/* eslint-disable global-require */
/**
 * API Routes Index
 * Agrupa todas las rutas de la aplicación
 */

const express = require('express');

const router = express.Router();

/**
 * Configurar todas las rutas de la API
 * @param {Object} controllers - Objeto con todos los controllers
 */
const setupRoutes = (controllers) => {
  // Importar configuradores de rutas
  const setupAuthRoutes = require('./auth.routes');
  const setupDocumentsRoutes = require('./documents.routes');
  const setupLibraryRoutes = require('./library.routes');
  const setupSimulationsRoutes = require('./simulations.routes');
  const setupTelehealthRoutes = require('./telehealth.routes');
  const setupAnalyticsRoutes = require('./analytics.routes');
  const setupChatbotRoutes = require('./chatbot.routes');
  const setupUsersRoutes = require('./users.routes'); // ✅ NUEVO

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // API Info endpoint
  router.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Smart Campus API - Instituto María Parado de Bellido',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        documents: '/api/documents',
        library: '/api/library',
        simulations: '/api/simulations',
        telehealth: '/api/telehealth',
        analytics: '/api/analytics',
        chatbot: '/api/chatbot',
        users: '/api/users', // ✅ NUEVO
        docs: '/api/docs (próximamente)',
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Montar rutas de módulos
  router.use('/auth', setupAuthRoutes(controllers.authController));
  router.use('/documents', setupDocumentsRoutes(controllers.documentsController));
  router.use('/library', setupLibraryRoutes(controllers.libraryController));
  router.use('/simulations', setupSimulationsRoutes(controllers.simulationsController));
  router.use('/telehealth', setupTelehealthRoutes(controllers.telehealthController));
  router.use('/analytics', setupAnalyticsRoutes(controllers.analyticsController));
  router.use('/chatbot', setupChatbotRoutes(controllers.chatbotController));
  router.use('/users', setupUsersRoutes(controllers.usersController)); // ✅ NUEVO

  return router;
};

module.exports = setupRoutes;
