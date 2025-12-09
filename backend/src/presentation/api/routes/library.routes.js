/**
 * Library Routes
 * Define todas las rutas para el módulo de biblioteca virtual
 */

const express = require('express');
const multer = require('multer');

// Middlewares
const { authenticate } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validation.middleware');

// Validators
const searchResourcesSchema = require('../validators/library/SearchResourcesValidator');
const uploadResourceSchema = require('../validators/library/UploadResourceValidator');
const trackUsageSchema = require('../validators/library/TrackUsageValidator');
const recommendationSchema = require('../validators/library/RecommendationValidator');

// Configurar multer para recursos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB (para videos)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'video/mp4', // ✅ VERIFICAR que esté permitido
      'video/quicktime',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  },
});

/**
 * Setup Library Routes
 * @param {Object} libraryController - Controller de biblioteca
 */
const setupLibraryRoutes = (libraryController) => {
  const router = express.Router();

  // ============================================
  // RUTAS PÚBLICAS (requieren autenticación)
  // ============================================

  /**
   * @route   GET /api/library/resources
   * @desc    Buscar recursos con filtros
   * @access  Private
   */
  router.get(
    '/resources',
    authenticate,
    validate(searchResourcesSchema, 'query'),
    (req, res, next) => libraryController.searchResources(req, res, next)
  );

  /**
   * @route   GET /api/library/resources/:id
   * @desc    Obtener detalles de un recurso
   * @access  Private
   */
  router.get('/resources/:id', authenticate, (req, res, next) =>
    libraryController.getResourceDetails(req, res, next)
  );

  /**
   * @route   GET /api/library/popular
   * @desc    Obtener recursos más populares
   * @access  Private
   */
  router.get('/popular', authenticate, (req, res, next) =>
    libraryController.getMostPopular(req, res, next)
  );

  /**
   * @route   GET /api/library/recommendations
   * @desc    Obtener recomendaciones personalizadas
   * @access  Private
   */
  router.get(
    '/recommendations',
    authenticate,
    validate(recommendationSchema, 'query'),
    (req, res, next) => libraryController.getRecommendations(req, res, next)
  );

  /**
   * @route   POST /api/library/resources/:id/track
   * @desc    Registrar uso de un recurso (view, download, rate)
   * @access  Private
   */
  router.post(
    '/resources/:id/track',
    authenticate,
    validate(trackUsageSchema, 'body'),
    (req, res, next) => libraryController.trackUsage(req, res, next)
  );

  // ============================================
  // RUTAS ADMINISTRATIVAS (requieren ADMIN/TEACHER)
  // ============================================

  /**
   * @route   POST /api/library/resources/upload
   * @desc    Subir un nuevo recurso
   * @access  Private (ADMIN, TEACHER, IT_ADMIN)
   */
  router.post(
    '/resources/upload',
    authenticate,
    authorize(['ADMIN', 'TEACHER', 'IT_ADMIN', 'ADMINISTRATIVE']),
    upload.single('file'),
    validate(uploadResourceSchema, 'body'),
    (req, res, next) => libraryController.uploadResource(req, res, next)
  );

  /**
   * @route   DELETE /api/library/resources/:id
   * @desc    Eliminar un recurso
   * @access  Private (Propietario o ADMIN)
   */
  router.delete('/resources/:id', authenticate, (req, res, next) =>
    libraryController.deleteResource(req, res, next)
  );

  return router;
};

module.exports = setupLibraryRoutes;
