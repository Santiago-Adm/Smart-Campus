/**
 * Use Case: Get Appointments
 * Obtener citas según filtros
 */

class GetAppointmentsUseCase {
  constructor({ appointmentRepository }) {
    this.appointmentRepository = appointmentRepository;
  }

  async execute({ userId, userRole, status, dateFrom, dateTo, page = 1, limit = 20 }) {
    let appointments = [];

    // Construir filtros
    const filters = {};
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    try {
      // Si es estudiante, solo ve sus propias citas (como estudiante)
      if (userRole === 'STUDENT') {
        appointments = await this.appointmentRepository.findByStudentId(userId, filters);
      }
      // Si es docente, ve las citas donde él es el teacher
      else if (userRole === 'TEACHER') {
        appointments = await this.appointmentRepository.findByTeacherId(userId, filters);
      }
      // Si es admin/director, ve TODAS las citas
      else if (['ADMINISTRATIVE', 'IT_ADMIN', 'DIRECTOR'].includes(userRole)) {
        // ✅ CORRECCIÓN: Usar findAll con filtros en lugar de findByDateRange
        appointments = await this.appointmentRepository.findAll(filters);
      } else {
        throw new Error('Invalid user role');
      }

      // Paginación manual (simple)
      const total = appointments.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedAppointments = appointments.slice(startIndex, endIndex);

      return {
        appointments: paginatedAppointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('❌ Error in GetAppointmentsUseCase:', error);
      throw error;
    }
  }
}

module.exports = GetAppointmentsUseCase;
