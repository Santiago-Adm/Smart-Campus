/**
 * DTO: Update Appointment Status
 * Datos para actualizar estado de cita
 */

const { AppointmentStatus } = require('../../../domain/enums/AppointmentStatus.enum');

class UpdateAppointmentStatusDto {
  constructor({ appointmentId, newStatus, userId, userRole, notes }) {
    this.appointmentId = this.validateRequired(appointmentId, 'Appointment ID');
    this.newStatus = this.validateStatus(newStatus);
    this.userId = this.validateRequired(userId, 'User ID');
    this.userRole = this.validateRequired(userRole, 'User Role');
    this.notes = notes || null;
  }

  validateRequired(value, fieldName) {
    if (!value) {
      throw new Error(`${fieldName} is required`);
    }
    return value;
  }

  validateStatus(status) {
    if (!status) {
      throw new Error('Status is required');
    }

    const validStatuses = Object.values(AppointmentStatus);
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return status;
  }

  toObject() {
    return {
      appointmentId: this.appointmentId,
      newStatus: this.newStatus,
      userId: this.userId,
      userRole: this.userRole,
      notes: this.notes,
    };
  }
}

module.exports = UpdateAppointmentStatusDto;
