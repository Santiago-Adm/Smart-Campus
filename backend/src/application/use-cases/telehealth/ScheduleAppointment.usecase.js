/**
 * Use Case: Schedule Appointment
 * Agendar una nueva cita
 */

const Appointment = require('../../../domain/entities/Appointment.entity');

class ScheduleAppointmentUseCase {
  constructor({ appointmentRepository }) {
    this.appointmentRepository = appointmentRepository;
  }

  async execute({ userId, userRole, studentId, teacherId, scheduledAt, duration, reason }) {
    try {
      console.log('📅 ScheduleAppointmentUseCase - Input:', {
        userId,
        userRole,
        studentId,
        teacherId,
        scheduledAt,
        duration,
      });

      // ✅ Determinar el studentId final según el rol
      let finalStudentId = studentId;

      // Si el usuario es STUDENT, usar su propio ID
      if (userRole === 'STUDENT') {
        finalStudentId = userId;
        console.log('🎓 User is STUDENT, using their own ID as studentId:', finalStudentId);
      }
      // Si es ADMIN y no especificó studentId, error
      else if (['ADMINISTRATIVE', 'IT_ADMIN', 'DIRECTOR'].includes(userRole)) {
        if (!studentId) {
          console.error('❌ Admin must specify studentId');
          throw new Error('Admin must specify studentId');
        }
        finalStudentId = studentId;
        console.log('👨‍💼 User is ADMIN, using provided studentId:', finalStudentId);
      }
      // Si es TEACHER, no puede agendar
      else if (userRole === 'TEACHER') {
        console.error('❌ Teachers cannot schedule appointments');
        throw new Error('Teachers cannot schedule appointments for themselves');
      }

      console.log('✅ Final studentId:', finalStudentId);

      // ✅ Validar que finalStudentId no sea undefined
      if (!finalStudentId) {
        throw new Error('Student ID could not be determined');
      }

      // ✅ Validar disponibilidad del docente
      console.log('🔍 Checking teacher availability...');

      try {
        const isAvailable = await this.appointmentRepository.checkTeacherAvailability(
          teacherId,
          scheduledAt,
          duration
        );

        console.log('🔍 Availability result:', isAvailable);

        if (!isAvailable) {
          const error = new Error('Teacher is not available at the requested time');
          error.statusCode = 400; // ✅ Bad Request, no 500
          throw error;
        }

        console.log('✅ Teacher is available');
      } catch (error) {
        console.error('❌ Error checking availability:', error);

        // ✅ Si es error de disponibilidad, lanzarlo como 400
        if (error.message.includes('not available')) {
          error.statusCode = 400;
        }

        throw error;
      }

      console.log('✅ Teacher is available');

      // ✅ Crear la entidad Appointment
      const appointment = new Appointment({
        studentId: finalStudentId,
        teacherId,
        scheduledAt: new Date(scheduledAt),
        duration: parseInt(duration, 10),
        status: 'SCHEDULED',
        reason,
      });

      console.log('📝 Creating appointment entity:', {
        studentId: appointment.studentId,
        teacherId: appointment.teacherId,
        scheduledAt: appointment.scheduledAt,
        duration: appointment.duration,
      });

      // ✅ Guardar en la base de datos
      const createdAppointment = await this.appointmentRepository.create(appointment);

      console.log('✅ Appointment created successfully:', createdAppointment.id);

      return createdAppointment;
    } catch (error) {
      console.error('❌ Error in ScheduleAppointmentUseCase:', error.message);
      throw error;
    }
  }
}

module.exports = ScheduleAppointmentUseCase;
