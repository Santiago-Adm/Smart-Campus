/**
 * Use Case: Get Dashboard Data
 * Obtiene métricas consolidadas para el dashboard
 */

class GetDashboardDataUseCase {
  constructor({
    userRepository,
    documentRepository,
    resourceRepository,
    appointmentRepository,
    scenarioRepository,
    simulationMetricsRepository,
  }) {
    this.userRepository = userRepository;
    this.documentRepository = documentRepository;
    this.resourceRepository = resourceRepository;
    this.appointmentRepository = appointmentRepository;
    this.scenarioRepository = scenarioRepository;
    this.simulationMetricsRepository = simulationMetricsRepository;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Datos del dashboard
   */
  async execute({ userId = null, userRole = null, startDate = null, endDate = null }) {
    try {
      console.log('📊 Fetching dashboard data...');

      // Determinar alcance según rol
      const scope = this._determineScope(userId, userRole);

      // Obtener todas las métricas en paralelo
      const [
        userMetrics,
        documentMetrics,
        libraryMetrics,
        appointmentMetrics,
        simulationMetrics,
        trendsData,
      ] = await Promise.all([
        this._getUserMetrics(scope, startDate, endDate),
        this._getDocumentMetrics(scope, startDate, endDate),
        this._getLibraryMetrics(scope, startDate, endDate),
        this._getAppointmentMetrics(scope, startDate, endDate),
        this._getSimulationMetrics(scope, startDate, endDate),
        this._getTrendsData(scope, startDate, endDate),
      ]);

      const dashboardData = {
        overview: {
          totalStudents: userMetrics.totalStudents,
          totalTeachers: userMetrics.totalTeachers,
          activeUsers: userMetrics.activeUsers,
          totalAppointments: appointmentMetrics.total,
        },
        users: userMetrics,
        documents: documentMetrics,
        library: libraryMetrics,
        appointments: appointmentMetrics,
        simulations: simulationMetrics,
        trends: trendsData,
        generatedAt: new Date(),
        scope: scope.type,
      };

      console.log('✅ Dashboard data fetched successfully');
      return dashboardData;
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      throw new Error(`Error fetching dashboard data: ${error.message}`);
    }
  }

  /**
   * Determinar alcance de datos según rol
   * @private
   */
  _determineScope(userId, userRole) {
    // ADMIN, IT_ADMIN, DIRECTOR, ADMINISTRATIVE → Todos los datos
    if (['ADMIN', 'IT_ADMIN', 'DIRECTOR', 'ADMINISTRATIVE'].includes(userRole)) {
      return { type: 'GLOBAL', userId: null };
    }

    // TEACHER → Solo sus estudiantes
    if (userRole === 'TEACHER') {
      return { type: 'TEACHER', userId };
    }

    // STUDENT → Solo sus propios datos
    if (userRole === 'STUDENT') {
      return { type: 'STUDENT', userId };
    }

    return { type: 'GLOBAL', userId: null };
  }

  /**
   * Obtener métricas de usuarios
   * @private
   */
  async _getUserMetrics(_scope, _startDate, _endDate) {
    try {
      // Total de estudiantes
      const totalStudents = await this.userRepository.count({
        roles: ['STUDENT'],
        isActive: true,
      });

      // Total de docentes
      const totalTeachers = await this.userRepository.count({
        roles: ['TEACHER'],
        isActive: true,
      });

      // Usuarios activos (login en últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeUsers = await this.userRepository.count({
        isActive: true,
        lastLoginAfter: thirtyDaysAgo,
      });

      // Total de usuarios
      const totalUsers = await this.userRepository.count({ isActive: true });

      return {
        totalStudents,
        totalTeachers,
        activeUsers,
        totalUsers,
        activeRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      return {
        totalStudents: 0,
        totalTeachers: 0,
        activeUsers: 0,
        totalUsers: 0,
        activeRate: 0,
      };
    }
  }

  /**
   * Obtener métricas de documentos
   * @private
   */
  async _getDocumentMetrics(scope, _startDate, _endDate) {
    try {
      const filter = {};
      if (scope.type === 'STUDENT') {
        filter.userId = scope.userId;
      }

      // Contar por estado
      const [pending, approved, rejected, inReview] = await Promise.all([
        this.documentRepository.countByStatus(filter.userId, 'PENDING'),
        this.documentRepository.countByStatus(filter.userId, 'APPROVED'),
        this.documentRepository.countByStatus(filter.userId, 'REJECTED'),
        this.documentRepository.countByStatus(filter.userId, 'IN_REVIEW'),
      ]);

      const total = pending + approved + rejected + inReview;

      return {
        total,
        pending,
        approved,
        rejected,
        inReview,
        approvalRate: total > 0 ? ((approved / total) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      console.error('Error fetching document metrics:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        inReview: 0,
        approvalRate: 0,
      };
    }
  }

  /**
   * Obtener métricas de biblioteca
   * @private
   */
  async _getLibraryMetrics(_scope, _startDate, _endDate) {
    try {
      // Total de recursos usando count()
      const totalResources = await this.resourceRepository.count({});

      // Recursos más populares (top 5)
      const popularResources = await this.resourceRepository.findMostViewed(5);

      // Obtener todos los recursos para calcular vistas totales
      let allResources = [];
      let totalViews = 0;

      try {
        // Usar search() en lugar de findAll()
        const searchResult = await this.resourceRepository.search({
          limit: 1000,
          page: 1,
        });

        // Manejar diferentes estructuras de respuesta
        if (Array.isArray(searchResult)) {
          allResources = searchResult;
        } else if (searchResult.resources && Array.isArray(searchResult.resources)) {
          allResources = searchResult.resources;
        } else if (searchResult.data && Array.isArray(searchResult.data)) {
          allResources = searchResult.data;
        }

        // Calcular total de vistas
        totalViews = allResources.reduce((sum, r) => sum + (r.viewCount || 0), 0);
      } catch (error) {
        console.warn('Could not fetch all resources for view count:', error.message);
        // No lanzar error, solo usar 0
        totalViews = 0;
      }

      return {
        totalResources,
        totalViews,
        popularResources: popularResources.map((r) => ({
          id: r.id,
          title: r.title,
          views: r.viewCount,
          category: r.category,
        })),
        avgViewsPerResource: totalResources > 0 ? (totalViews / totalResources).toFixed(2) : 0,
      };
    } catch (error) {
      console.error('Error fetching library metrics:', error);
      return {
        totalResources: 0,
        totalViews: 0,
        popularResources: [],
        avgViewsPerResource: 0,
      };
    }
  }

  /**
   * Obtener métricas de citas
   * @private
   */
  async _getAppointmentMetrics(scope, _startDate, _endDate) {
    try {
      const filter = {};

      if (scope.type === 'STUDENT') {
        filter.studentId = scope.userId;
      } else if (scope.type === 'TEACHER') {
        filter.teacherId = scope.userId;
      }

      // Contar por estado
      const [scheduled, confirmed, completed, cancelled, inProgress, noShow] = await Promise.all([
        this.appointmentRepository.countByStatus('SCHEDULED', filter),
        this.appointmentRepository.countByStatus('CONFIRMED', filter),
        this.appointmentRepository.countByStatus('COMPLETED', filter),
        this.appointmentRepository.countByStatus('CANCELLED', filter),
        this.appointmentRepository.countByStatus('IN_PROGRESS', filter),
        this.appointmentRepository.countByStatus('NO_SHOW', filter),
      ]);

      const total = scheduled + confirmed + completed + cancelled + inProgress + noShow;
      const upcoming = scheduled + confirmed;

      // Calcular tasa de no-show
      const totalFinished = completed + noShow;
      const noShowRate = totalFinished > 0 ? ((noShow / totalFinished) * 100).toFixed(2) : 0;

      return {
        total,
        upcoming,
        scheduled,
        confirmed,
        completed,
        cancelled,
        inProgress,
        noShow,
        noShowRate,
        completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      console.error('Error fetching appointment metrics:', error);
      return {
        total: 0,
        upcoming: 0,
        scheduled: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        inProgress: 0,
        noShow: 0,
        noShowRate: 0,
        completionRate: 0,
      };
    }
  }

  /**
   * Obtener métricas de simulaciones
   * @private
   */
  async _getSimulationMetrics(scope, _startDate, _endDate) {
    try {
      // Total de escenarios públicos
      const totalScenarios = await this.scenarioRepository.countPublicScenarios();

      const filter = {};
      if (scope.type === 'STUDENT') {
        filter.userId = scope.userId;
      }

      // Obtener métricas de MongoDB
      const metricsData = await this.simulationMetricsRepository.getAggregatedMetrics(filter);

      return {
        totalScenarios,
        totalSimulations: metricsData.totalSimulations || 0,
        averageScore: metricsData.averageScore || 0,
        averageAccuracy: metricsData.averageAccuracy || 0,
        averageDuration: metricsData.averageDuration || 0,
        totalErrors: metricsData.totalErrors || 0,
      };
    } catch (error) {
      console.error('Error fetching simulation metrics:', error);
      return {
        totalScenarios: 0,
        totalSimulations: 0,
        averageScore: 0,
        averageAccuracy: 0,
        averageDuration: 0,
        totalErrors: 0,
      };
    }
  }

  /**
   * Obtener datos de tendencias (comparación temporal)
   * @private
   */
  async _getTrendsData(_scope, _startDate, _endDate) {
    try {
      // Calcular período anterior (mismo rango de tiempo)
      // eslint-disable-next-line no-unused-vars
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      // Obtener métricas del período actual y anterior
      const [currentUsers, previousUsers] = await Promise.all([
        this.userRepository.count({
          isActive: true,
          createdAfter: thirtyDaysAgo,
        }),
        this.userRepository.count({
          isActive: true,
          createdAfter: sixtyDaysAgo,
          createdBefore: thirtyDaysAgo,
        }),
      ]);

      const userGrowth = this._calculateGrowthRate(currentUsers, previousUsers);

      // Nota: Para un MVP, solo calculamos crecimiento de usuarios
      // En producción, calcularíamos también para appointments, resources, etc.

      return {
        userGrowth,
        period: 'last_30_days',
        comparedTo: 'previous_30_days',
      };
    } catch (error) {
      console.error('Error fetching trends data:', error);
      return {
        userGrowth: 0,
        period: 'last_30_days',
        comparedTo: 'previous_30_days',
      };
    }
  }

  /**
   * Calcular tasa de crecimiento
   * @private
   */
  _calculateGrowthRate(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(2);
  }
}

module.exports = GetDashboardDataUseCase;
