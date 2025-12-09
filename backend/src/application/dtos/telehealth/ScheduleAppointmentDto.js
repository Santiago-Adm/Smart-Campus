/**
 * DTO: Schedule Appointment
 * Datos para agendar una cita
 */

class ScheduleAppointmentDto {
  constructor({ studentId, teacherId, scheduledAt, duration, reason }) {
    this.studentId = this.validateRequired(studentId, 'Student ID');
    this.teacherId = this.validateRequired(teacherId, 'Teacher ID');
    this.scheduledAt = this.validateScheduledAt(scheduledAt);
    this.duration = this.validateDuration(duration);
    this.reason = reason || null;
  }

  validateRequired(value, fieldName) {
    if (!value) {
      throw new Error(`${fieldName} is required`);
    }
    return value;
  }

  validateScheduledAt(scheduledAt) {
    if (!scheduledAt) {
      throw new Error('Scheduled date is required');
    }

    const date = new Date(scheduledAt);
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(date.getTime())) {
      throw new Error('Invalid scheduled date format');
    }

    // No puede ser en el pasado
    const now = new Date();
    if (date < now) {
      throw new Error('Scheduled date cannot be in the past');
    }

    return date;
  }

  validateDuration(duration) {
    const durationNum = parseInt(duration, 10);

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(durationNum)) {
      throw new Error('Duration must be a number');
    }

    if (durationNum < 15 || durationNum > 120) {
      throw new Error('Duration must be between 15 and 120 minutes');
    }

    return durationNum;
  }

  toObject() {
    return {
      studentId: this.studentId,
      teacherId: this.teacherId,
      scheduledAt: this.scheduledAt,
      duration: this.duration,
      reason: this.reason,
    };
  }
}

module.exports = ScheduleAppointmentDto;
