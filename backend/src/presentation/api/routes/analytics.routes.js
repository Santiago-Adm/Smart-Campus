/**
 * Analytics Routes
 * Define rutas para analítica y reportes
 */

const express = require('express');

// Middlewares
const { authenticate } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validation.middleware');

// Validators
const GetDashboardValidator = require('../validators/analytics/GetDashboardValidator');
const GenerateReportValidator = require('../validators/analytics/GenerateReportValidator');
const PredictDropoutValidator = require('../validators/analytics/PredictDropoutValidator');
const GetAlertsValidator = require('../validators/analytics/GetAlertsValidator');
const GetComparativeValidator = require('../validators/analytics/GetComparativeValidator');

/**
 * Setup Analytics Routes
 * @param {Object} analyticsController - Controller de Analytics
 */
const setupAnalyticsRoutes = (analyticsController) => {
  const router = express.Router();

  if (!analyticsController) {
    console.error('❌ AnalyticsController is undefined!');
    return router;
  }

  // ============================================
  // RUTAS PÚBLICAS (requieren autenticación)
  // ============================================

  /**
   * @route   GET /api/analytics/dashboard
   * @desc    Obtener datos del dashboard
   * @access  Private (All authenticated users)
   */
  router.get(
    '/dashboard',
    authenticate,
    validate(GetDashboardValidator, 'query'),
    (req, res, next) => analyticsController.getDashboard(req, res, next)
  );

  /**
   * @route   GET /api/analytics/comparative
   * @desc    Obtener datos comparativos
   * @access  Private (ADMIN, IT_ADMIN, DIRECTOR)
   */
  router.get(
    '/comparative',
    authenticate,
    authorize(['ADMIN', 'IT_ADMIN', 'DIRECTOR']),
    validate(GetComparativeValidator, 'query'),
    (req, res, next) => analyticsController.getComparative(req, res, next)
  );

  /**
   * @route   POST /api/analytics/reports/generate
   * @desc    Generar reporte personalizado
   * @access  Private (TEACHER, ADMIN, IT_ADMIN, DIRECTOR)
   */
  router.post(
    '/reports/generate',
    authenticate,
    authorize(['TEACHER', 'ADMIN', 'IT_ADMIN', 'DIRECTOR']),
    validate(GenerateReportValidator),
    (req, res, next) => analyticsController.generateReport(req, res, next)
  );

  /**
   * @route   GET /api/analytics/reports
   * @desc    Listar reportes generados
   * @access  Private (TEACHER, ADMIN, IT_ADMIN, DIRECTOR)
   */
  router.get(
    '/reports',
    authenticate,
    authorize(['TEACHER', 'ADMIN', 'IT_ADMIN', 'DIRECTOR']),
    (req, res, next) => analyticsController.listReports(req, res, next)
  );

  /**
   * @route   GET /api/analytics/reports/:fileName/download
   * @desc    Descargar reporte
   * @access  Private (TEACHER, ADMIN, IT_ADMIN, DIRECTOR)
   */
  router.get(
    '/reports/:fileName/download',
    authenticate,
    authorize(['TEACHER', 'ADMIN', 'IT_ADMIN', 'DIRECTOR']),
    (req, res, next) => analyticsController.downloadReport(req, res, next)
  );

  /**
   * @route   DELETE /api/analytics/reports/:fileName
   * @desc    Eliminar reporte
   * @access  Private (ADMIN, IT_ADMIN)
   */
  router.delete(
    '/reports/:fileName',
    authenticate,
    authorize(['ADMIN', 'IT_ADMIN']),
    (req, res, next) => analyticsController.deleteReport(req, res, next)
  );

  /**
   * @route   POST /api/analytics/predictions/dropout-risk
   * @desc    Predecir riesgo de deserción
   * @access  Private (TEACHER, ADMIN, IT_ADMIN, DIRECTOR)
   */
  router.post(
    '/predictions/dropout-risk',
    authenticate,
    authorize(['TEACHER', 'ADMIN', 'IT_ADMIN', 'DIRECTOR']),
    validate(PredictDropoutValidator),
    (req, res, next) => analyticsController.predictDropoutRisk(req, res, next)
  );

  /**
   * @route   GET /api/analytics/alerts
   * @desc    Obtener alertas del sistema
   * @access  Private (ADMIN, IT_ADMIN, DIRECTOR)
   */
  router.get(
    '/alerts',
    authenticate,
    authorize(['ADMIN', 'IT_ADMIN', 'DIRECTOR']),
    validate(GetAlertsValidator, 'query'),
    (req, res, next) => analyticsController.getAlerts(req, res, next)
  );

  return router;
};

module.exports = setupAnalyticsRoutes;
