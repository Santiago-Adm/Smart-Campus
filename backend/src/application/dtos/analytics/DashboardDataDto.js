/**
 * DTO: Dashboard Data Request
 * Parámetros para obtener datos del dashboard
 */

class DashboardDataDto {
  constructor({ userId, userRole, startDate, endDate }) {
    this.userId = userId || null;
    this.userRole = userRole || null;
    this.startDate = startDate ? new Date(startDate) : null;
    this.endDate = endDate ? new Date(endDate) : null;

    this.validate();
  }

  validate() {
    // Validar fechas si se proporcionan
    if (this.startDate && this.endDate) {
      if (this.startDate > this.endDate) {
        throw new Error('Start date must be before end date');
      }
    }

    // Validar rol si se proporciona
    if (this.userRole) {
      // ⭐ AGREGAR 'ADMINISTRATIVE' aquí
      const validRoles = ['STUDENT', 'TEACHER', 'ADMINISTRATIVE', 'ADMIN', 'IT_ADMIN', 'DIRECTOR'];
      if (!validRoles.includes(this.userRole)) {
        throw new Error(`Invalid user role. Must be one of: ${validRoles.join(', ')}`);
      }
    }
  }

  toObject() {
    return {
      userId: this.userId,
      userRole: this.userRole,
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }
}

module.exports = DashboardDataDto;
