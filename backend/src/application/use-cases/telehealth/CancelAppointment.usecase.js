/**
 * Use Case: Cancel Appointment
 * Cancelar una cita
 */

class CancelAppointmentUseCase {
  constructor({ appointmentRepository, notificationService, eventBus }) {
    this.appointmentRepository = appointmentRepository;
    this.notificationService = notificationService;
    this.eventBus = eventBus;
  }

  async execute({ appointmentId, userId, userRole, reason = null }) {
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
      throw new Error('You do not have permission to cancel this appointment');
    }

    // Verificar que se puede cancelar
    if (appointment.status === 'COMPLETED') {
      throw new Error('Cannot cancel a completed appointment');
    }

    if (appointment.status === 'CANCELLED') {
      throw new Error('Appointment is already cancelled');
    }

    // Cancelar la cita
    appointment.cancel();

    // Actualizar en base de datos
    const updatedAppointment = await this.appointmentRepository.update(appointmentId, {
      status: appointment.status,
      notes: reason || appointment.notes,
      updatedAt: appointment.updatedAt,
    });

    // Publicar evento
    this.eventBus.publish('appointment.cancelled', {
      appointmentId,
      cancelledBy: userId,
      reason,
    });

    return updatedAppointment;
  }
}

module.exports = CancelAppointmentUseCase;
