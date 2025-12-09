/**
 * DTO: Get Appointments
 * Filtros para buscar citas
 */

const { AppointmentStatus } = require('../../../domain/enums/AppointmentStatus.enum');

class GetAppointmentsDto {
  constructor({ userId, userRole, status, dateFrom, dateTo, page, limit }) {
    this.userId = this.validateRequired(userId, 'User ID');
    this.userRole = this.validateRequired(userRole, 'User Role');
    this.status = this.validateStatus(status);
    this.dateFrom = this.validateDate(dateFrom);
    this.dateTo = this.validateDate(dateTo);
    this.page = this.validatePage(page);
    this.limit = this.validateLimit(limit);
  }

  validateRequired(value, fieldName) {
    if (!value) {
      throw new Error(`${fieldName} is required`);
    }
    return value;
  }

  validateStatus(status) {
    if (!status) return null;

    const validStatuses = Object.values(AppointmentStatus);
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return status;
  }

  validateDate(dateString) {
    if (!dateString) return null;

    const date = new Date(dateString);
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    return date;
  }

  validatePage(page) {
    if (!page) return 1;

    const pageNum = parseInt(page, 10);
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(pageNum) || pageNum < 1) {
      throw new Error('Page must be a positive number');
    }

    return pageNum;
  }

  validateLimit(limit) {
    if (!limit) return 20;

    const limitNum = parseInt(limit, 10);
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    return limitNum;
  }

  toObject() {
    return {
      userId: this.userId,
      userRole: this.userRole,
      status: this.status,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      page: this.page,
      limit: this.limit,
    };
  }
}

module.exports = GetAppointmentsDto;
