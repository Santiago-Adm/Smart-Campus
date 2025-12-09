/**
 * Use Case: Get Appointment Details
 * Obtener detalles completos de una cita
 * ✅ CORREGIDO: Validación de permisos
 */

class GetAppointmentDetailsUseCase {
  constructor({ appointmentRepository }) {
    this.appointmentRepository = appointmentRepository;
  }

  async execute({ appointmentId, userId, userRoles }) {
    try {
      console.log('📋 GetAppointmentDetails:', { appointmentId, userId, userRoles });

      // Buscar la cita
      const appointment = await this.appointmentRepository.findById(appointmentId);

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      console.log('📋 Found appointment:', {
        id: appointment.id,
        studentId: appointment.studentId,
        teacherId: appointment.teacherId,
      });

      // ✅ Validar permisos según rol
      const isAdmin = userRoles.some((role) =>
        ['ADMINISTRATIVE', 'IT_ADMIN', 'DIRECTOR'].includes(role)
      );
      const isStudent = appointment.studentId === userId;
      const isTeacher = appointment.teacherId === userId;

      if (!isAdmin && !isStudent && !isTeacher) {
        throw new Error('You do not have permission to view this appointment');
      }

      console.log('✅ Permission granted');

      return appointment;
    } catch (error) {
      console.error('❌ Error in GetAppointmentDetails:', error);
      throw error;
    }
  }
}

module.exports = GetAppointmentDetailsUseCase;
