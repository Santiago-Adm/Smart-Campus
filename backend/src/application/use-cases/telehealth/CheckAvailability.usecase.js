/**
 * Use Case: Check Availability
 * Verificar disponibilidad de un docente
 */

class CheckAvailabilityUseCase {
  constructor({ appointmentRepository, userRepository }) {
    this.appointmentRepository = appointmentRepository;
    this.userRepository = userRepository;
  }

  async execute({ teacherId, scheduledAt, duration = 30 }) {
    // Verificar que el docente existe
    const teacher = await this.userRepository.findById(teacherId);

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    if (!teacher.isTeacher()) {
      throw new Error('User is not a teacher');
    }

    // Verificar disponibilidad
    const isAvailable = await this.appointmentRepository.checkTeacherAvailability(
      teacherId,
      scheduledAt,
      duration
    );

    return {
      teacherId,
      teacherName: teacher.getFullName(),
      scheduledAt: new Date(scheduledAt),
      duration,
      isAvailable,
      message: isAvailable
        ? 'Teacher is available at the selected time'
        : 'Teacher is not available at the selected time. Please choose another slot.',
    };
  }
}

module.exports = CheckAvailabilityUseCase;
