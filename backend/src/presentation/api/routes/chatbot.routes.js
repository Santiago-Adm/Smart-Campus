/**
 * Chatbot Routes
 * Define rutas para el asistente virtual inteligente
 */

const express = require('express');

// Middlewares
const { authenticate } = require('../middlewares/auth.middleware');
// eslint-disable-next-line no-unused-vars
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validation.middleware');

// Validators
const ProcessMessageValidator = require('../validators/chatbot/ProcessMessageValidator');
const EscalateValidator = require('../validators/chatbot/EscalateValidator');
const GetContextValidator = require('../validators/chatbot/GetContextValidator');

/**
 * Setup Chatbot Routes
 * @param {Object} chatbotController - Controller de Chatbot
 */
const setupChatbotRoutes = (chatbotController) => {
  const router = express.Router();

  if (!chatbotController) {
    console.error('❌ ChatbotController is undefined!');
    return router;
  }

  // Todas las rutas requieren autenticación
  router.use(authenticate);

  // ============================================
  // RUTAS PRINCIPALES
  // ============================================

  /**
   * @route   POST /api/chatbot/message
   * @desc    Enviar mensaje al chatbot
   * @access  Private (All authenticated users)
   */
  router.post('/message', validate(ProcessMessageValidator), (req, res, next) =>
    chatbotController.processMessage(req, res, next)
  );

  /**
   * @route   GET /api/chatbot/conversations
   * @desc    Listar conversaciones del usuario
   * @access  Private (All authenticated users)
   */
  router.get('/conversations', (req, res, next) =>
    chatbotController.getConversations(req, res, next)
  );

  /**
   * @route   GET /api/chatbot/conversations/:id
   * @desc    Obtener conversación específica
   * @access  Private (Owner only)
   */
  router.get('/conversations/:id', (req, res, next) =>
    chatbotController.getConversation(req, res, next)
  );

  /**
   * @route   POST /api/chatbot/escalate
   * @desc    Escalar conversación a soporte humano
   * @access  Private (All authenticated users)
   */
  router.post('/escalate', validate(EscalateValidator), (req, res, next) =>
    chatbotController.escalateConversation(req, res, next)
  );

  /**
   * @route   DELETE /api/chatbot/conversations/:id
   * @desc    Cerrar conversación
   * @access  Private (Owner only)
   */
  router.delete('/conversations/:id', (req, res, next) =>
    chatbotController.closeConversation(req, res, next)
  );

  /**
   * @route   GET /api/chatbot/context
   * @desc    Obtener información contextual del usuario
   * @access  Private (All authenticated users)
   */
  router.get('/context', validate(GetContextValidator, 'query'), (req, res, next) =>
    chatbotController.getContext(req, res, next)
  );

  return router;
};

module.exports = setupChatbotRoutes;
