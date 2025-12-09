/**
 * Simulations Routes
 * Define todas las rutas para el módulo de simulaciones AR + IoT
 */

const express = require('express');
const multer = require('multer');

// Middlewares
const { authenticate } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

// Configurar multer para modelos 3D y thumbnails
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB para modelos 3D
  },
  fileFilter: (req, file, cb) => {
    // Modelos 3D
    if (file.fieldname === 'model') {
      const allowedTypes = ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'];
      if (
        allowedTypes.includes(file.mimetype) ||
        file.originalname.endsWith('.gltf') ||
        file.originalname.endsWith('.glb')
      ) {
        cb(null, true);
      } else {
        cb(new Error('Tipo de archivo no permitido para modelo. Solo GLTF/GLB'));
      }
    }
    // Thumbnails
    else if (file.fieldname === 'thumbnail') {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Tipo de archivo no permitido para thumbnail. Solo JPG, PNG, WebP'));
      }
    } else {
      cb(null, true);
    }
  },
});

/**
 * Setup Simulations Routes
 * @param {Object} simulationsController - Controller de simulaciones
 */
const setupSimulationsRoutes = (simulationsController) => {
  const router = express.Router();

  // ============================================
  // RUTAS PÚBLICAS (requieren autenticación)
  // ============================================

  /**
   * @route   GET /api/simulations/scenarios
   * @desc    Obtener escenarios con filtros
   * @access  Private
   */
  router.get('/scenarios', authenticate, (req, res, next) =>
    simulationsController.getScenarios(req, res, next)
  );

  /**
   * @route   GET /api/simulations/scenarios/public
   * @desc    Obtener escenarios públicos destacados
   * @access  Private
   */
  router.get('/scenarios/public', authenticate, (req, res, next) =>
    simulationsController.getPublicScenarios(req, res, next)
  );

  /**
   * @route   GET /api/simulations/scenarios/:id
   * @desc    Obtener detalles de un escenario
   * @access  Private
   */
  router.get('/scenarios/:id', authenticate, (req, res, next) =>
    simulationsController.getScenarioDetails(req, res, next)
  );

  /**
   * @route   POST /api/simulations/scenarios/:id/execute
   * @desc    Ejecutar una simulación
   * @access  Private
   */
  router.post('/scenarios/:id/execute', authenticate, (req, res, next) =>
    simulationsController.executeSimulation(req, res, next)
  );

  /**
   * @route   POST /api/simulations/metrics
   * @desc    Registrar métricas de simulación
   * @access  Private
   */
  router.post('/metrics', authenticate, (req, res, next) =>
    simulationsController.recordMetrics(req, res, next)
  );

  /**
   * @route   GET /api/simulations/metrics/my-history
   * @desc    Obtener historial de métricas del usuario
   * @access  Private
   */
  router.get('/metrics/my-history', authenticate, (req, res, next) =>
    simulationsController.getUserMetrics(req, res, next)
  );

  /**
   * @route   POST /api/simulations/iot/connect
   * @desc    Conectar/desconectar dispositivo IoT
   * @access  Private
   */
  router.post('/iot/connect', authenticate, (req, res, next) =>
    simulationsController.connectIoTDevice(req, res, next)
  );

  // ============================================
  // RUTAS ADMINISTRATIVAS (TEACHER/ADMIN)
  // ============================================

  /**
   * @route   POST /api/simulations/scenarios
   * @desc    Crear un nuevo escenario
   * @access  Private (TEACHER, ADMIN, IT_ADMIN)
   */
  router.post(
    '/scenarios',
    authenticate,
    authorize(['TEACHER', 'ADMIN', 'IT_ADMIN']),
    upload.fields([
      { name: 'model', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
    (req, res, next) => simulationsController.createScenario(req, res, next)
  );

  /**
   * @route   PUT /api/simulations/scenarios/:id
   * @desc    Actualizar un escenario existente
   * @access  Private (Propietario, ADMIN, IT_ADMIN)
   * @note    La verificación de ownership se hace en el controller
   */
  router.put(
    '/scenarios/:id',
    authenticate,
    // ✅ REMOVIDO: authorize(['TEACHER', 'ADMIN', 'IT_ADMIN'])
    // La verificación de permisos (ownership) se hace en el controller
    upload.fields([
      { name: 'model', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
    (req, res, next) => simulationsController.updateScenario(req, res, next)
  );

  /**
   * @route   DELETE /api/simulations/scenarios/:id
   * @desc    Eliminar un escenario
   * @access  Private (Propietario o ADMIN)
   * @note    La verificación de ownership se hace en el controller
   */
  router.delete(
    '/scenarios/:id',
    authenticate,
    // ✅ No usamos authorize() aquí, verificamos ownership en el controller
    (req, res, next) => simulationsController.deleteScenario(req, res, next)
  );

  return router;
};

module.exports = setupSimulationsRoutes;
