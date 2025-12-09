/**
 * Use Case: Update Appointment Status
 * Actualizar estado de una cita
 */

const { AppointmentStatus } = require('../../../domain/enums/AppointmentStatus.enum');

class UpdateAppointmentStatusUseCase {
  constructor({ appointmentRepository, notificationService, eventBus }) {
    this.appointmentRepository = appointmentRepository;
    this.notificationService = notificationService;
    this.eventBus = eventBus;
  }

  async execute({ appointmentId, newStatus, userId, userRole, notes = null }) {
    // Buscar la cita
    const appointment = await this.appointmentRepository.findById(appointmentId);

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Verificar permisos
    const isStudent = appointment.studentId === userId;
    const isTeacher = appointment.teacherId === userId;
    const isAdmin = ['ADMIN', 'IT_ADMIN'].includes(userRole);

    if (!isStudent && !isTeacher && !isAdmin) {
      throw new Error('You do not have permission to update this appointment');
    }

    // Validar transición de estado
    const currentStatus = appointment.status;

    // Aplicar cambio según el nuevo estado
    switch (newStatus) {
      case AppointmentStatus.CONFIRMED:
        appointment.confirm();
        break;

      case AppointmentStatus.IN_PROGRESS:
        appointment.start();
        break;

      case AppointmentStatus.COMPLETED:
        appointment.complete(notes);
        break;

      case AppointmentStatus.CANCELLED:
        appointment.cancel();
        break;

      case AppointmentStatus.NO_SHOW:
        // Solo docentes/admin pueden marcar como no-show
        if (!isTeacher && !isAdmin) {
          throw new Error('Only teachers or admins can mark appointments as no-show');
        }
        appointment.markAsNoShow();
        break;

      default:
        throw new Error(`Invalid status: ${newStatus}`);
    }

    // Persistir cambios
    const updatedAppointment = await this.appointmentRepository.update(appointmentId, {
      status: appointment.status,
      notes: appointment.notes,
      updatedAt: appointment.updatedAt,
    });

    // Publicar evento
    this.eventBus.publish('appointment.status_updated', {
      appointmentId,
      oldStatus: currentStatus,
      newStatus: appointment.status,
      userId,
    });

    return updatedAppointment;
  }
}

module.exports = UpdateAppointmentStatusUseCase;
