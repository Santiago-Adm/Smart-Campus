/**
 * Documents Routes
 * Define todas las rutas para el módulo de documentos
 */

const express = require('express');
const multer = require('multer');

// Middlewares
const { authenticate } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validation.middleware');

// Validators
const uploadDocumentSchema = require('../validators/documents/UploadDocumentValidator');
const searchDocumentSchema = require('../validators/documents/SearchDocumentValidator');
const validateDocumentSchema = require('../validators/documents/ValidateDocumentValidator');
const approveDocumentSchema = require('../validators/documents/ApproveDocumentValidator');
const rejectDocumentSchema = require('../validators/documents/RejectDocumentValidator');

// Configurar multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan PDF, JPG y PNG'));
    }
  },
});

/**
 * Setup Documents Routes
 * @param {Object} documentsController - Controller de documentos
 */
const setupDocumentsRoutes = (documentsController) => {
  const router = express.Router();

  // ============================================
  // RUTAS PÚBLICAS (requieren autenticación)
  // ============================================

  /**
   * @route   POST /api/documents/upload
   * @desc    Subir un nuevo documento
   * @access  Private (Todos los usuarios autenticados)
   */
  router.post(
    '/upload',
    authenticate,
    upload.single('file'),
    // eslint-disable-next-line consistent-return
    (req, res, next) => {
      // Middleware para verificar archivo antes de validar
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo',
        });
      }
      next();
    },
    validate(uploadDocumentSchema, 'body'),
    (req, res, next) => documentsController.uploadDocument(req, res, next)
  );

  /**
   * @route   GET /api/documents
   * @desc    Obtener lista de documentos con filtros
   * @access  Private (Todos los usuarios autenticados)
   */
  router.get('/', authenticate, validate(searchDocumentSchema, 'query'), (req, res, next) =>
    documentsController.getDocuments(req, res, next)
  );

  /**
   * @route   GET /api/documents/:id
   * @desc    Obtener un documento por ID
   * @access  Private (Propietario o ADMIN/STAFF)
   */
  router.get('/:id', authenticate, (req, res, next) =>
    documentsController.getDocumentById(req, res, next)
  );

  // ============================================
  // RUTAS ADMINISTRATIVAS (requieren ADMIN/STAFF)
  // ============================================

  /**
   * @route   POST /api/documents/:id/validate
   * @desc    Validar documento con OCR
   * @access  Private (Solo ADMIN y STAFF)
   */
  router.post(
    '/:id/validate',
    authenticate,
    authorize(['IT_ADMIN', 'ADMINISTRATIVE']),
    validate(validateDocumentSchema, 'body'),
    (req, res, next) => documentsController.validateDocument(req, res, next)
  );

  /**
   * @route   POST /api/documents/:id/approve
   * @desc    Aprobar un documento
   * @access  Private (Solo ADMIN y STAFF)
   */
  router.post(
    '/:id/approve',
    authenticate,
    authorize(['IT_ADMIN', 'ADMINISTRATIVE']),
    validate(approveDocumentSchema, 'body'),
    (req, res, next) => documentsController.approveDocument(req, res, next)
  );

  /**
   * @route   POST /api/documents/:id/reject
   * @desc    Rechazar un documento
   * @access  Private (Solo ADMIN y STAFF)
   */
  router.post(
    '/:id/reject',
    authenticate,
    authorize(['IT_ADMIN', 'ADMINISTRATIVE']),
    validate(rejectDocumentSchema, 'body'),
    (req, res, next) => documentsController.rejectDocument(req, res, next)
  );

  /**
   * @route   DELETE /api/documents/:id
   * @desc    Eliminar un documento (soft delete)
   * @access  Private (Propietario o ADMIN)
   */
  router.delete('/:id', authenticate, (req, res, next) =>
    documentsController.deleteDocument(req, res, next)
  );

  return router;
};

module.exports = setupDocumentsRoutes;
