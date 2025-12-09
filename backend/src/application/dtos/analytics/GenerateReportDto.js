/**
 * DTO: Generate Report Request
 * Parámetros para generación de reportes
 */

class GenerateReportDto {
  constructor({ reportType, format, startDate, endDate, userId, userRole, includeCharts }) {
    this.reportType = this.validateRequired(reportType, 'Report type');
    this.format = format ? format.toUpperCase() : 'PDF';
    this.startDate = startDate ? new Date(startDate) : null;
    this.endDate = endDate ? new Date(endDate) : null;
    this.userId = userId || null;
    this.userRole = userRole || null;
    this.includeCharts = includeCharts || false;

    this.validate();
  }

  validateRequired(value, fieldName) {
    if (!value) {
      throw new Error(`${fieldName} is required`);
    }
    return value;
  }

  validate() {
    // Validar tipo de reporte
    const validTypes = [
      'enrollment',
      'academic_performance',
      'library_usage',
      'appointments',
      'simulations',
      'general',
    ];

    if (!validTypes.includes(this.reportType)) {
      throw new Error(`Invalid report type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validar formato
    const validFormats = ['PDF', 'EXCEL'];
    if (!validFormats.includes(this.format)) {
      throw new Error(`Invalid format. Must be one of: ${validFormats.join(', ')}`);
    }

    // Validar fechas si se proporcionan
    if (this.startDate && this.endDate) {
      if (this.startDate > this.endDate) {
        throw new Error('Start date must be before end date');
      }
    }

    // Validar includeCharts
    if (typeof this.includeCharts !== 'boolean') {
      this.includeCharts = Boolean(this.includeCharts);
    }
  }

  toObject() {
    return {
      reportType: this.reportType,
      format: this.format,
      startDate: this.startDate,
      endDate: this.endDate,
      userId: this.userId,
      userRole: this.userRole,
      includeCharts: this.includeCharts,
    };
  }
}

module.exports = GenerateReportDto;
