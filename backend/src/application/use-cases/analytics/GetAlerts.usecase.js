/**
 * Use Case: Get Alerts
 * Obtiene alertas del sistema (anomalías, eventos importantes)
 */

class GetAlertsUseCase {
  constructor({
    userRepository,
    documentRepository,
    appointmentRepository,
    simulationMetricsRepository,
  }) {
    this.userRepository = userRepository;
    this.documentRepository = documentRepository;
    this.appointmentRepository = appointmentRepository;
    this.simulationMetricsRepository = simulationMetricsRepository;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Alertas del sistema
   */
  async execute({ severity = null, category = null, limit = 50 }) {
    try {
      console.log('🚨 Fetching system alerts...');

      // Generar alertas en paralelo
      const [
        inactiveUsersAlerts,
        pendingDocumentsAlerts,
        upcomingAppointmentsAlerts,
        noShowAlerts,
        lowPerformanceAlerts,
      ] = await Promise.all([
        this._checkInactiveUsers(),
        this._checkPendingDocuments(),
        this._checkUpcomingAppointments(),
        this._checkNoShowRate(),
        this._checkLowPerformance(),
      ]);

      // Consolidar todas las alertas
      let allAlerts = [
        ...inactiveUsersAlerts,
        ...pendingDocumentsAlerts,
        ...upcomingAppointmentsAlerts,
        ...noShowAlerts,
        ...lowPerformanceAlerts,
      ];

      // Filtrar por severidad si se especifica
      if (severity) {
        allAlerts = allAlerts.filter((alert) => alert.severity === severity);
      }

      // Filtrar por categoría si se especifica
      if (category) {
        allAlerts = allAlerts.filter((alert) => alert.category === category);
      }

      // Ordenar por severidad (CRITICAL > HIGH > MEDIUM > LOW)
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      allAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      // Limitar resultados
      allAlerts = allAlerts.slice(0, limit);

      console.log(`✅ Found ${allAlerts.length} alerts`);

      return {
        alerts: allAlerts,
        total: allAlerts.length,
        summary: this._generateSummary(allAlerts),
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('❌ Error fetching alerts:', error);
      throw new Error(`Error fetching alerts: ${error.message}`);
    }
  }

  /**
   * Verificar usuarios inactivos
   * @private
   */
  async _checkInactiveUsers() {
    const alerts = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      const inactiveCount = await this.userRepository.count({
        isActive: true,
        lastLoginBefore: sevenDaysAgo,
      });

      if (inactiveCount > 0) {
        alerts.push({
          id: `inactive-users-${Date.now()}`,
          severity: inactiveCount > 20 ? 'HIGH' : 'MEDIUM',
          category: 'USERS',
          title: 'Usuarios inactivos detectados',
          message: `${inactiveCount} usuarios no han iniciado sesión en los últimos 7 días`,
          count: inactiveCount,
          action: 'Revisar y contactar usuarios inactivos',
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.warn('Error checking inactive users:', error);
    }

    return alerts;
  }

  /**
   * Verificar documentos pendientes
   * @private
   */
  async _checkPendingDocuments() {
    const alerts = [];

    try {
      const pendingCount = await this.documentRepository.countByStatus(null, 'PENDING');

      if (pendingCount > 0) {
        alerts.push({
          id: `pending-docs-${Date.now()}`,
          severity: pendingCount > 50 ? 'HIGH' : 'MEDIUM',
          category: 'DOCUMENTS',
          title: 'Documentos pendientes de validación',
          message: `${pendingCount} documentos requieren revisión`,
          count: pendingCount,
          action: 'Revisar y validar documentos pendientes',
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.warn('Error checking pending documents:', error);
    }

    return alerts;
  }

  /**
   * Verificar citas próximas (24 horas)
   * @private
   */
  async _checkUpcomingAppointments() {
    const alerts = [];

    try {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const upcomingCount = await this.appointmentRepository.countInPeriod(now, tomorrow);

      if (upcomingCount > 0) {
        alerts.push({
          id: `upcoming-appointments-${Date.now()}`,
          severity: 'LOW',
          category: 'APPOINTMENTS',
          title: 'Citas próximas en las siguientes 24 horas',
          message: `${upcomingCount} citas agendadas para mañana`,
          count: upcomingCount,
          action: 'Enviar recordatorios a participantes',
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.warn('Error checking upcoming appointments:', error);
    }

    return alerts;
  }

  /**
   * Verificar tasa de no-show alta
   * @private
   */
  async _checkNoShowRate() {
    const alerts = [];

    try {
      const [completed, noShow] = await Promise.all([
        this.appointmentRepository.countByStatus('COMPLETED', {}),
        this.appointmentRepository.countByStatus('NO_SHOW', {}),
      ]);

      const total = completed + noShow;
      if (total > 0) {
        const noShowRate = (noShow / total) * 100;

        if (noShowRate > 15) {
          // Si la tasa supera el 15%
          alerts.push({
            id: `high-noshow-${Date.now()}`,
            severity: noShowRate > 25 ? 'CRITICAL' : 'HIGH',
            category: 'APPOINTMENTS',
            title: 'Tasa de no-show elevada',
            message: `${noShowRate.toFixed(2)}% de citas resultan en no-show`,
            value: noShowRate,
            action: 'Implementar recordatorios más efectivos',
            timestamp: new Date(),
          });
        }
      }
    } catch (error) {
      console.warn('Error checking no-show rate:', error);
    }

    return alerts;
  }

  /**
   * Verificar estudiantes con bajo desempeño
   * @private
   */
  async _checkLowPerformance() {
    const alerts = [];

    try {
      // Obtener métricas agregadas
      const metrics = await this.simulationMetricsRepository.getAggregatedMetrics({});

      if (metrics.averageScore < 60) {
        alerts.push({
          id: `low-performance-${Date.now()}`,
          severity: 'HIGH',
          category: 'ACADEMIC',
          title: 'Bajo desempeño académico detectado',
          message: `Puntuación promedio en simulaciones: ${metrics.averageScore.toFixed(2)}/100`,
          value: metrics.averageScore,
          action: 'Revisar estrategias pedagógicas y ofrecer apoyo adicional',
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.warn('Error checking low performance:', error);
    }

    return alerts;
  }

  /**
   * Generar resumen de alertas
   * @private
   */
  _generateSummary(alerts) {
    const summary = {
      total: alerts.length,
      bySeverity: {
        CRITICAL: alerts.filter((a) => a.severity === 'CRITICAL').length,
        HIGH: alerts.filter((a) => a.severity === 'HIGH').length,
        MEDIUM: alerts.filter((a) => a.severity === 'MEDIUM').length,
        LOW: alerts.filter((a) => a.severity === 'LOW').length,
      },
      byCategory: {
        USERS: alerts.filter((a) => a.category === 'USERS').length,
        DOCUMENTS: alerts.filter((a) => a.category === 'DOCUMENTS').length,
        APPOINTMENTS: alerts.filter((a) => a.category === 'APPOINTMENTS').length,
        ACADEMIC: alerts.filter((a) => a.category === 'ACADEMIC').length,
      },
    };

    return summary;
  }
}

module.exports = GetAlertsUseCase;
