/**
 * DTO: Check Availability
 * Datos para verificar disponibilidad de docente
 */

class CheckAvailabilityDto {
  constructor({ teacherId, scheduledAt, duration }) {
    this.teacherId = this.validateRequired(teacherId, 'Teacher ID');
    this.scheduledAt = this.validateScheduledAt(scheduledAt);
    this.duration = this.validateDuration(duration);
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

    return date;
  }

  validateDuration(duration) {
    if (!duration) return 30; // Default

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
      teacherId: this.teacherId,
      scheduledAt: this.scheduledAt,
      duration: this.duration,
    };
  }
}

module.exports = CheckAvailabilityDto;
