/**
 * TelehealthController
 * Maneja todas las operaciones relacionadas con teleenfermería
 */

class TelehealthController {
  constructor({
    scheduleAppointmentUseCase,
    getAppointmentsUseCase,
    getAppointmentDetailsUseCase,
    updateAppointmentStatusUseCase,
    cancelAppointmentUseCase,
    checkAvailabilityUseCase,
    getUpcomingAppointmentsUseCase,
    uploadRecordingUseCase,
  }) {
    this.scheduleAppointmentUseCase = scheduleAppointmentUseCase;
    this.getAppointmentsUseCase = getAppointmentsUseCase;
    this.getAppointmentDetailsUseCase = getAppointmentDetailsUseCase;
    this.updateAppointmentStatusUseCase = updateAppointmentStatusUseCase;
    this.cancelAppointmentUseCase = cancelAppointmentUseCase;
    this.checkAvailabilityUseCase = checkAvailabilityUseCase;
    this.getUpcomingAppointmentsUseCase = getUpcomingAppointmentsUseCase;
    this.uploadRecordingUseCase = uploadRecordingUseCase;
  }

  /**
   * Helper: Determinar rol principal del usuario
   */
  _getPrimaryRole(userRoles) {
    if (userRoles.includes('IT_ADMIN')) return 'IT_ADMIN';
    if (userRoles.includes('ADMINISTRATIVE')) return 'ADMINISTRATIVE';
    if (userRoles.includes('DIRECTOR')) return 'DIRECTOR';
    if (userRoles.includes('TEACHER')) return 'TEACHER';
    if (userRoles.includes('STUDENT')) return 'STUDENT';
    return 'STUDENT'; // Default
  }

  /**
   * POST /api/telehealth/appointments
   * Agendar nueva cita
   */
  // eslint-disable-next-line consistent-return
  async scheduleAppointment(req, res, next) {
    try {
      const { studentId, teacherId, scheduledAt, duration, reason } = req.body;

      // ✅ Agregar estos console.log
      console.log('🔍 DEBUG - req.user:', req.user);
      console.log('🔍 DEBUG - req.user.userId:', req.user?.userId);
      console.log('🔍 DEBUG - req.user.id:', req.user?.id);

      // ✅ CRÍTICO: Usar req.user.userId (como lo guarda auth.middleware.js)
      const { userId } = req.user;
      const userRoles = req.user.roles;
      const userRole = this._getPrimaryRole(userRoles);

      console.log('🔍 DEBUG - userId asignado:', userId);
      console.log('🔍 DEBUG - userRoles:', userRoles);

      console.log('📅 Schedule appointment request:', {
        userId,
        userRole,
        userRoles,
        studentId,
        teacherId,
        scheduledAt,
        duration,
        reason: `${reason?.substring(0, 50)}...`,
      });

      // Validaciones básicas
      if (!teacherId) {
        return res.status(400).json({
          success: false,
          message: 'El teacherId es obligatorio',
        });
      }

      if (!scheduledAt) {
        return res.status(400).json({
          success: false,
          message: 'La fecha y hora son obligatorias',
        });
      }

      if (!duration) {
        return res.status(400).json({
          success: false,
          message: 'La duración es obligatoria',
        });
      }

      if (!reason || reason.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'El motivo debe tener al menos 10 caracteres',
        });
      }

      // Ejecutar use case
      const appointment = await this.scheduleAppointmentUseCase.execute({
        userId,
        userRole,
        studentId,
        teacherId,
        scheduledAt,
        duration: parseInt(duration, 10),
        reason: reason.trim(),
      });

      console.log('✅ Appointment created:', appointment.id);

      return res.status(201).json({
        success: true,
        message: 'Cita agendada exitosamente',
        data: appointment,
      });
    } catch (error) {
      console.error('❌ Error in scheduleAppointment:', error);
      next(error);
    }
  }

  /**
   * GET /api/telehealth/appointments
   * Obtener citas del usuario
   */
  // eslint-disable-next-line consistent-return
  async getAppointments(req, res, next) {
    try {
      // ✅ Usar req.user.userId
      const { userId } = req.user;
      const userRoles = req.user.roles;
      const userRole = this._getPrimaryRole(userRoles);

      const { status, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

      console.log('📋 Get appointments request:', {
        userId,
        userRole,
        status,
        dateFrom,
        dateTo,
      });

      const result = await this.getAppointmentsUseCase.execute({
        userId,
        userRole,
        status,
        dateFrom,
        dateTo,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      return res.status(200).json({
        success: true,
        message: 'Appointments retrieved successfully',
        data: result.appointments,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('❌ Error in getAppointments:', error);
      next(error);
    }
  }

  /**
   * GET /api/telehealth/appointments/upcoming
   * Obtener citas próximas (próximas 24 horas)
   * ✅ CORREGIDO: Maneja el array directo del use case
   */
  // eslint-disable-next-line consistent-return
  async getUpcomingAppointments(req, res, next) {
    try {
      const { userId } = req.user;

      console.log('📅 Get upcoming appointments for user:', userId);

      // ✅ El use case ahora retorna directamente el array
      const appointments = await this.getUpcomingAppointmentsUseCase.execute({ userId });

      console.log('📅 Appointments returned from use case:', {
        type: typeof appointments,
        isArray: Array.isArray(appointments),
        length: Array.isArray(appointments) ? appointments.length : 'N/A',
        firstItem: Array.isArray(appointments) ? appointments[0] : appointments,
      });

      // ✅ CRÍTICO: appointments ya debe ser un array
      const appointmentsArray = Array.isArray(appointments) ? appointments : [];

      return res.status(200).json({
        success: true,
        message:
          appointmentsArray.length > 0
            ? `You have ${appointmentsArray.length} upcoming appointment(s) in the next 24 hours`
            : 'No upcoming appointments in the next 24 hours',
        data: appointmentsArray,
        total: appointmentsArray.length,
      });
    } catch (error) {
      console.error('❌ Error in getUpcomingAppointments:', error);
      next(error);
    }
  }

  /**
   * GET /api/telehealth/appointments/:id
   * Obtener detalles de una cita
   */
  // eslint-disable-next-line consistent-return
  async getAppointmentDetails(req, res, next) {
    try {
      const { id } = req.params;
      // ✅ Usar req.user.userId
      const { userId } = req.user;
      const userRoles = req.user.roles;

      console.log('📋 Get appointment details:', { appointmentId: id, userId });

      const appointment = await this.getAppointmentDetailsUseCase.execute({
        appointmentId: id,
        userId,
        userRoles,
      });

      return res.status(200).json({
        success: true,
        message: 'Appointment details retrieved successfully',
        data: appointment,
      });
    } catch (error) {
      console.error('❌ Error in getAppointmentDetails:', error);
      next(error);
    }
  }

  /**
   * PATCH /api/telehealth/appointments/:id/status
   * Actualizar estado de una cita
   */
  // eslint-disable-next-line consistent-return
  async updateAppointmentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const { userId } = req.user;
      const userRoles = req.user.roles;
      const userRole = this._getPrimaryRole(userRoles); // ✅ Obtener rol principal

      console.log('🔄 Update appointment status:', {
        appointmentId: id,
        status,
        userId,
        userRole,
      });

      // ✅ CORRECCIÓN: Pasar parámetros con los nombres correctos
      const appointment = await this.updateAppointmentStatusUseCase.execute({
        appointmentId: id,
        newStatus: status, // ✅ CAMBIAR: status → newStatus
        userId,
        userRole, // ✅ CAMBIAR: userRoles → userRole
        notes,
      });

      return res.status(200).json({
        success: true,
        message: 'Appointment status updated successfully',
        data: appointment,
      });
    } catch (error) {
      console.error('❌ Error in updateAppointmentStatus:', error);
      next(error);
    }
  }

  /**
   * DELETE /api/telehealth/appointments/:id
   * Cancelar una cita
   */
  // eslint-disable-next-line consistent-return
  async cancelAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      // ✅ Usar req.user.userId
      const { userId } = req.user;
      const userRoles = req.user.roles;

      console.log('❌ Cancel appointment:', { appointmentId: id, userId, reason });

      const appointment = await this.cancelAppointmentUseCase.execute({
        appointmentId: id,
        userId,
        userRoles,
        reason,
      });

      return res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        data: appointment,
      });
    } catch (error) {
      console.error('❌ Error in cancelAppointment:', error);
      next(error);
    }
  }

  /**
   * POST /api/telehealth/availability/check
   * Verificar disponibilidad de un docente
   */
  // eslint-disable-next-line consistent-return
  async checkAvailability(req, res, next) {
    try {
      const { teacherId, scheduledAt, duration } = req.body;

      console.log('🔍 Check availability:', { teacherId, scheduledAt, duration });

      const isAvailable = await this.checkAvailabilityUseCase.execute({
        teacherId,
        scheduledAt,
        duration,
      });

      return res.status(200).json({
        success: true,
        message: 'Availability checked successfully',
        data: {
          isAvailable,
          teacherId,
          scheduledAt,
          duration,
        },
      });
    } catch (error) {
      console.error('❌ Error in checkAvailability:', error);
      next(error);
    }
  }

  /**
   * POST /api/telehealth/appointments/:id/recording
   * Subir grabación de sesión
   */
  // eslint-disable-next-line consistent-return
  async uploadRecording(req, res, next) {
    try {
      const { id } = req.params;
      const { file } = req;
      // ✅ Usar req.user.userId
      const { userId } = req.user;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó archivo de grabación',
        });
      }

      console.log('📹 Upload recording:', {
        appointmentId: id,
        userId,
        fileName: file.originalname,
        size: file.size,
      });

      const result = await this.uploadRecordingUseCase.execute({
        appointmentId: id,
        userId,
        file,
      });

      return res.status(200).json({
        success: true,
        message: 'Recording uploaded successfully',
        data: result,
      });
    } catch (error) {
      console.error('❌ Error in uploadRecording:', error);
      next(error);
    }
  }
}

module.exports = TelehealthController;
