/**
 * Use Case: Get Upcoming Appointments
 * Obtener citas próximas (próximas 24 horas)
 * ✅ CORREGIDO: Retorna solo el array
 */

class GetUpcomingAppointmentsUseCase {
  constructor({ appointmentRepository }) {
    this.appointmentRepository = appointmentRepository;
  }

  async execute({ userId }) {
    try {
      console.log('📅 GetUpcomingAppointmentsUseCase - userId:', userId);

      const upcomingAppointments = await this.appointmentRepository.findUpcoming(userId);

      console.log('📅 Found upcoming appointments:', upcomingAppointments.length);
      console.log('📅 First appointment:', upcomingAppointments[0]);

      // ✅ CRÍTICO: Retornar SOLO el array
      return upcomingAppointments;
    } catch (error) {
      console.error('❌ Error in GetUpcomingAppointmentsUseCase:', error);
      throw error;
    }
  }
}

module.exports = GetUpcomingAppointmentsUseCase;
