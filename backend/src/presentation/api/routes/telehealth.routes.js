/**
 * Telehealth Routes
 * Define todas las rutas para el módulo de teleenfermería
 */

const express = require('express');
const multer = require('multer');

// Middlewares
const { authenticate } = require('../middlewares/auth.middleware');
// eslint-disable-next-line no-unused-vars
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validation.middleware');

// Validators
const scheduleAppointmentSchema = require('../validators/telehealth/ScheduleAppointmentValidator');
const updateStatusSchema = require('../validators/telehealth/UpdateStatusValidator');
const checkAvailabilitySchema = require('../validators/telehealth/CheckAvailabilityValidator');

// Configurar multer para grabaciones de video
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB para videos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/webm', 'video/mp4', 'video/x-matroska'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo WebM, MP4, MKV'));
    }
  },
});

/**
 * Setup Telehealth Routes
 * @param {Object} telehealthController - Controller de teleenfermería
 */
const setupTelehealthRoutes = (telehealthController) => {
  const router = express.Router();

  // ============================================
  // RUTAS PÚBLICAS (requieren autenticación)
  // ============================================

  /**
   * @route   POST /api/telehealth/appointments
   * @desc    Agendar una nueva cita
   * @access  Private (STUDENT, TEACHER, ADMIN)
   */
  router.post(
    '/appointments',
    authenticate,
    validate(scheduleAppointmentSchema),
    (req, res, next) => telehealthController.scheduleAppointment(req, res, next)
  );

  /**
   * @route   GET /api/telehealth/appointments
   * @desc    Obtener citas del usuario
   * @access  Private
   */
  router.get('/appointments', authenticate, (req, res, next) =>
    telehealthController.getAppointments(req, res, next)
  );

  /**
   * @route   GET /api/telehealth/appointments/upcoming
   * @desc    Obtener citas próximas (próximas 24 horas)
   * @access  Private
   */
  router.get('/appointments/upcoming', authenticate, (req, res, next) =>
    telehealthController.getUpcomingAppointments(req, res, next)
  );

  /**
   * @route   GET /api/telehealth/appointments/:id
   * @desc    Obtener detalles de una cita
   * @access  Private
   */
  router.get('/appointments/:id', authenticate, (req, res, next) =>
    telehealthController.getAppointmentDetails(req, res, next)
  );

  /**
   * @route   PATCH /api/telehealth/appointments/:id/status
   * @desc    Actualizar estado de una cita
   * @access  Private
   */
  router.patch(
    '/appointments/:id/status',
    authenticate,
    validate(updateStatusSchema),
    (req, res, next) => telehealthController.updateAppointmentStatus(req, res, next)
  );

  /**
   * @route   DELETE /api/telehealth/appointments/:id
   * @desc    Cancelar una cita
   * @access  Private
   */
  router.delete('/appointments/:id', authenticate, (req, res, next) =>
    telehealthController.cancelAppointment(req, res, next)
  );

  /**
   * @route   POST /api/telehealth/availability/check
   * @desc    Verificar disponibilidad de un docente
   * @access  Private
   */
  router.post(
    '/availability/check',
    authenticate,
    validate(checkAvailabilitySchema),
    (req, res, next) => telehealthController.checkAvailability(req, res, next)
  );

  /**
   * @route   POST /api/telehealth/appointments/:id/recording
   * @desc    Subir grabación de sesión
   * @access  Private (Participantes de la cita)
   */
  router.post(
    '/appointments/:id/recording',
    authenticate,
    upload.single('recording'),
    (req, res, next) => telehealthController.uploadRecording(req, res, next)
  );

  return router;
};

module.exports = setupTelehealthRoutes;
