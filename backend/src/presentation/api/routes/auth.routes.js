/**
 * Auth Routes
 * Define las rutas del módulo de autenticación
 */

const express = require('express');

const router = express.Router();

// Middlewares
const validate = require('../middlewares/validation.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

// Validators
const registerSchema = require('../validators/auth/RegisterValidator');
const loginSchema = require('../validators/auth/LoginValidator');
const recoverPasswordSchema = require('../validators/auth/RecoverPasswordValidator');
const resetPasswordSchema = require('../validators/auth/ResetPasswordValidator');
// eslint-disable-next-line import/no-unresolved, import/extensions
const refreshTokenSchema = require('../validators/auth/RefreshTokenValidator');

/**
 * Configurar rutas con el controller
 * @param {AuthController} authController
 */
const setupAuthRoutes = (authController) => {
  /**
   * @route   POST /api/auth/register
   * @desc    Registrar nuevo usuario
   * @access  Public
   */
  router.post('/register', validate(registerSchema, 'body'), (req, res, next) =>
    authController.register(req, res, next)
  );

  /**
   * @route   POST /api/auth/login
   * @desc    Iniciar sesión
   * @access  Public
   */
  router.post('/login', validate(loginSchema, 'body'), (req, res, next) =>
    authController.login(req, res, next)
  );

  /**
   * @route   POST /api/auth/recover-password
   * @desc    Solicitar recuperación de contraseña
   * @access  Public
   */
  router.post('/recover-password', validate(recoverPasswordSchema, 'body'), (req, res, next) =>
    authController.recoverPassword(req, res, next)
  );

  /**
   * @route   POST /api/auth/reset-password
   * @desc    Resetear contraseña con token
   * @access  Public
   */
  router.post('/reset-password', validate(resetPasswordSchema, 'body'), (req, res, next) =>
    authController.resetPassword(req, res, next)
  );

  /**
   * @route   POST /api/auth/refresh-token
   * @desc    Renovar tokens de acceso
   * @access  Public
   */
  router.post('/refresh-token', validate(refreshTokenSchema, 'body'), (req, res, next) =>
    authController.refreshToken(req, res, next)
  );

  /**
   * @route   GET /api/auth/me
   * @desc    Obtener datos del usuario actual
   * @access  Private (requiere autenticación)
   */
  router.get('/me', authenticate, (req, res, next) =>
    authController.getCurrentUser(req, res, next)
  );

  /**
   * @route   POST /api/auth/logout
   * @desc    Cerrar sesión
   * @access  Private (requiere autenticación)
   */
  router.post('/logout', authenticate, (req, res, next) => authController.logout(req, res, next));

  return router;
};

module.exports = setupAuthRoutes;
