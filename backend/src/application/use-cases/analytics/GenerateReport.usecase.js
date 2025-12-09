/**
 * Use Case: Generate Report
 * Genera reportes personalizados en PDF o Excel
 */

class GenerateReportUseCase {
  constructor({
    reportGeneratorService,
    userRepository,
    documentRepository,
    resourceRepository,
    appointmentRepository,
    simulationMetricsRepository,
  }) {
    this.reportGeneratorService = reportGeneratorService;
    this.userRepository = userRepository;
    this.documentRepository = documentRepository;
    this.resourceRepository = resourceRepository;
    this.appointmentRepository = appointmentRepository;
    this.simulationMetricsRepository = simulationMetricsRepository;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} params - Parámetros del reporte
   * @returns {Promise<Object>} Información del reporte generado
   */
  async execute({
    reportType,
    format = 'PDF',
    startDate = null,
    endDate = null,
    userId = null,
    userRole = null,
    // eslint-disable-next-line no-unused-vars
    includeCharts = false,
  }) {
    try {
      console.log(`📄 Generating ${format} report: ${reportType}`);

      // Validar parámetros
      this._validateParams(reportType, format);

      // Construir datos del reporte según el tipo
      const reportData = await this._buildReportData(
        reportType,
        startDate,
        endDate,
        userId,
        userRole
      );

      // Generar reporte en el formato especificado
      let result;
      if (format.toUpperCase() === 'PDF') {
        result = await this.reportGeneratorService.generatePDF(reportData);
      } else if (format.toUpperCase() === 'EXCEL') {
        result = await this.reportGeneratorService.generateExcel(reportData);
      } else {
        throw new Error(`Unsupported format: ${format}`);
      }

      console.log('✅ Report generated successfully:', result.fileName);

      return {
        success: true,
        report: result,
        reportType,
        format,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('❌ Error generating report:', error);
      throw new Error(`Error generating report: ${error.message}`);
    }
  }

  /**
   * Validar parámetros
   * @private
   */
  _validateParams(reportType, format) {
    const validTypes = [
      'enrollment',
      'academic_performance',
      'library_usage',
      'appointments',
      'simulations',
      'general',
    ];

    if (!validTypes.includes(reportType)) {
      throw new Error(`Invalid report type. Must be one of: ${validTypes.join(', ')}`);
    }

    const validFormats = ['PDF', 'EXCEL'];
    if (!validFormats.includes(format.toUpperCase())) {
      throw new Error(`Invalid format. Must be one of: ${validFormats.join(', ')}`);
    }
  }

  /**
   * Construir datos del reporte según el tipo
   * @private
   */
  async _buildReportData(reportType, startDate, endDate, userId, userRole) {
    const period = this._formatPeriod(startDate, endDate);

    switch (reportType) {
      case 'enrollment':
        return this._buildEnrollmentReport(period, startDate, endDate);

      case 'academic_performance':
        return this._buildAcademicPerformanceReport(period, startDate, endDate, userId);

      case 'library_usage':
        return this._buildLibraryUsageReport(period, startDate, endDate);

      case 'appointments':
        return this._buildAppointmentsReport(period, startDate, endDate, userId, userRole);

      case 'simulations':
        return this._buildSimulationsReport(period, startDate, endDate, userId);

      case 'general':
        return this._buildGeneralReport(period, startDate, endDate);

      default:
        throw new Error(`Report type not implemented: ${reportType}`);
    }
  }

  /**
   * Formatear período de fechas
   * @private
   */
  _formatPeriod(startDate, endDate) {
    if (!startDate && !endDate) {
      return 'Todos los registros';
    }

    const start = startDate ? new Date(startDate).toLocaleDateString('es-PE') : 'Inicio';
    const end = endDate ? new Date(endDate).toLocaleDateString('es-PE') : 'Actualidad';

    return `${start} - ${end}`;
  }

  /**
   * Construir reporte de matrícula
   * @private
   */
  async _buildEnrollmentReport(period, startDate, endDate) {
    const filter = {};
    if (startDate) filter.createdAfter = new Date(startDate);
    if (endDate) filter.createdBefore = new Date(endDate);

    const totalStudents = await this.userRepository.count({
      roles: ['STUDENT'],
      ...filter,
    });

    const activeStudents = await this.userRepository.count({
      roles: ['STUDENT'],
      isActive: true,
      ...filter,
    });

    return {
      title: 'Reporte de Matrícula',
      subtitle: 'Instituto Superior Técnico de Enfermería "María Parado de Bellido"',
      type: 'enrollment',
      period,
      sections: [
        {
          title: 'Resumen General',
          type: 'metrics',
          metrics: {
            'Total de estudiantes': totalStudents,
            'Estudiantes activos': activeStudents,
            'Tasa de actividad': `${((activeStudents / totalStudents) * 100).toFixed(2)}%`,
          },
        },
        {
          title: 'Distribución por Estado',
          type: 'table',
          data: {
            headers: ['Estado', 'Cantidad', 'Porcentaje'],
            rows: [
              [
                'Activos',
                activeStudents,
                `${((activeStudents / totalStudents) * 100).toFixed(2)}%`,
              ],
              [
                'Inactivos',
                totalStudents - activeStudents,
                `${(((totalStudents - activeStudents) / totalStudents) * 100).toFixed(2)}%`,
              ],
            ],
          },
        },
      ],
    };
  }

  /**
   * Construir reporte de desempeño académico
   * @private
   */
  async _buildAcademicPerformanceReport(period, startDate, endDate, userId) {
    const filter = {};
    if (userId) filter.userId = userId;
    if (startDate) filter.completedAfter = new Date(startDate);
    if (endDate) filter.completedBefore = new Date(endDate);

    const metricsData = await this.simulationMetricsRepository.getAggregatedMetrics(filter);

    return {
      title: 'Reporte de Desempeño Académico',
      subtitle: 'Simulaciones y Prácticas',
      type: 'academic_performance',
      period,
      sections: [
        {
          title: 'Métricas Generales',
          type: 'metrics',
          metrics: {
            'Total de simulaciones completadas': metricsData.totalSimulations || 0,
            'Puntuación promedio': `${(metricsData.averageScore || 0).toFixed(2)}/100`,
            'Precisión promedio': `${((metricsData.averageAccuracy || 0) * 100).toFixed(2)}%`,
            'Duración promedio': `${(metricsData.averageDuration || 0).toFixed(2)} minutos`,
          },
        },
        {
          title: 'Análisis de Errores',
          type: 'metrics',
          metrics: {
            'Total de errores registrados': metricsData.totalErrors || 0,
            'Promedio de errores por simulación': (
              (metricsData.totalErrors || 0) / (metricsData.totalSimulations || 1)
            ).toFixed(2),
          },
        },
      ],
    };
  }

  /**
   * Construir reporte de uso de biblioteca
   * @private
   */
  async _buildLibraryUsageReport(period, _startDate, _endDate) {
    const totalResources = await this.resourceRepository.count({});
    const popularResources = await this.resourceRepository.findMostViewed(10);

    const allResources = await this.resourceRepository.findAll({ limit: 1000 });
    const totalViews = allResources.resources.reduce((sum, r) => sum + (r.viewCount || 0), 0);

    return {
      title: 'Reporte de Uso de Biblioteca Virtual',
      subtitle: 'Análisis de Recursos Educativos',
      type: 'library_usage',
      period,
      sections: [
        {
          title: 'Estadísticas Generales',
          type: 'metrics',
          metrics: {
            'Total de recursos': totalResources,
            'Total de visualizaciones': totalViews,
            'Promedio de visualizaciones por recurso': (totalViews / totalResources).toFixed(2),
          },
        },
        {
          title: 'Recursos Más Consultados (Top 10)',
          type: 'table',
          data: {
            headers: ['#', 'Título', 'Categoría', 'Visualizaciones'],
            rows: popularResources.map((r, index) => [
              index + 1,
              r.title.substring(0, 50) + (r.title.length > 50 ? '...' : ''),
              r.category,
              r.viewCount,
            ]),
          },
        },
      ],
    };
  }

  /**
   * Construir reporte de citas
   * @private
   */
  async _buildAppointmentsReport(period, startDate, endDate, userId, userRole) {
    const filter = {};
    if (userId && userRole === 'STUDENT') {
      filter.studentId = userId;
    } else if (userId && userRole === 'TEACHER') {
      filter.teacherId = userId;
    }

    const [scheduled, completed, cancelled, noShow] = await Promise.all([
      this.appointmentRepository.countByStatus('SCHEDULED', filter),
      this.appointmentRepository.countByStatus('COMPLETED', filter),
      this.appointmentRepository.countByStatus('CANCELLED', filter),
      this.appointmentRepository.countByStatus('NO_SHOW', filter),
    ]);

    const total = scheduled + completed + cancelled + noShow;

    return {
      title: 'Reporte de Citas de Teleenfermería',
      subtitle: 'Análisis de Consultas y Supervisiones',
      type: 'appointments',
      period,
      sections: [
        {
          title: 'Resumen de Citas',
          type: 'metrics',
          metrics: {
            'Total de citas': total,
            'Citas completadas': completed,
            'Citas agendadas': scheduled,
            'Citas canceladas': cancelled,
            'No presentados': noShow,
            'Tasa de completitud': `${((completed / total) * 100).toFixed(2)}%`,
            'Tasa de no-show': `${((noShow / (completed + noShow)) * 100).toFixed(2)}%`,
          },
        },
        {
          title: 'Distribución por Estado',
          type: 'table',
          data: {
            headers: ['Estado', 'Cantidad', 'Porcentaje'],
            rows: [
              ['Completadas', completed, `${((completed / total) * 100).toFixed(2)}%`],
              ['Agendadas', scheduled, `${((scheduled / total) * 100).toFixed(2)}%`],
              ['Canceladas', cancelled, `${((cancelled / total) * 100).toFixed(2)}%`],
              ['No presentados', noShow, `${((noShow / total) * 100).toFixed(2)}%`],
            ],
          },
        },
      ],
    };
  }

  /**
   * Construir reporte de simulaciones
   * @private
   */
  async _buildSimulationsReport(period, startDate, endDate, userId) {
    const filter = {};
    if (userId) filter.userId = userId;

    const metricsData = await this.simulationMetricsRepository.getAggregatedMetrics(filter);
    const totalScenarios = await this.scenarioRepository.countPublicScenarios();

    return {
      title: 'Reporte de Simulaciones AR',
      subtitle: 'Análisis de Experiencias Inmersivas',
      type: 'simulations',
      period,
      sections: [
        {
          title: 'Métricas Generales',
          type: 'metrics',
          metrics: {
            'Escenarios disponibles': totalScenarios,
            'Total de simulaciones': metricsData.totalSimulations || 0,
            'Puntuación promedio': `${(metricsData.averageScore || 0).toFixed(2)}/100`,
            'Precisión promedio': `${((metricsData.averageAccuracy || 0) * 100).toFixed(2)}%`,
            'Duración promedio': `${(metricsData.averageDuration || 0).toFixed(2)} min`,
          },
        },
      ],
    };
  }

  /**
   * Construir reporte general
   * @private
   */
  async _buildGeneralReport(period, _startDate, _endDate) {
    const [totalUsers, totalDocuments, totalResources, totalAppointments] = await Promise.all([
      this.userRepository.count({ isActive: true }),
      this.documentRepository.count({}),
      this.resourceRepository.count({}),
      this.appointmentRepository.countByStatus('COMPLETED', {}),
    ]);

    return {
      title: 'Reporte General del Sistema',
      subtitle: 'Smart Campus Instituto - Vista Global',
      type: 'general',
      period,
      sections: [
        {
          title: 'Resumen Ejecutivo',
          type: 'metrics',
          metrics: {
            'Total de usuarios activos': totalUsers,
            'Documentos en sistema': totalDocuments,
            'Recursos en biblioteca': totalResources,
            'Citas completadas': totalAppointments,
          },
        },
      ],
    };
  }
}

module.exports = GenerateReportUseCase;
