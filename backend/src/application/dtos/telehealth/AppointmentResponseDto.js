/**
 * DTO: Appointment Response
 * Formato de respuesta de citas
 */

class AppointmentResponseDto {
  constructor(appointment, includeUsers = false) {
    this.id = appointment.id;
    this.studentId = appointment.studentId;
    this.teacherId = appointment.teacherId;
    this.scheduledAt = appointment.scheduledAt;
    this.endTime = appointment.getEndTime();
    this.duration = appointment.duration;
    this.status = appointment.status;
    this.reason = appointment.reason;
    this.notes = appointment.notes;
    this.recordingUrl = appointment.recordingUrl;
    this.vitalSigns = appointment.vitalSigns;
    this.isPast = appointment.isPast();
    this.isToday = appointment.isToday();
    this.createdAt = appointment.createdAt;
    this.updatedAt = appointment.updatedAt;

    // Si se incluyen datos de usuarios (de relaciones Sequelize)
    if (includeUsers && appointment.student) {
      this.student = {
        id: appointment.student.id,
        name: `${appointment.student.firstName} ${appointment.student.lastName}`,
        email: appointment.student.email,
      };
    }

    if (includeUsers && appointment.teacher) {
      this.teacher = {
        id: appointment.teacher.id,
        name: `${appointment.teacher.firstName} ${appointment.teacher.lastName}`,
        email: appointment.teacher.email,
      };
    }
  }

  static toSummary(appointment) {
    return {
      id: appointment.id,
      scheduledAt: appointment.scheduledAt,
      duration: appointment.duration,
      status: appointment.status,
      reason: appointment.reason,
      isToday: appointment.isToday(),
      isPast: appointment.isPast(),
    };
  }

  static toList(appointments, includeUsers = false) {
    return appointments.map((apt) => new AppointmentResponseDto(apt, includeUsers));
  }
}

module.exports = AppointmentResponseDto;
