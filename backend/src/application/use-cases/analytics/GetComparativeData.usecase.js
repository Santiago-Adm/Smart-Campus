/**
 * Use Case: Get Comparative Data
 * Obtiene datos comparativos entre períodos
 */

class GetComparativeDataUseCase {
  constructor({ userRepository, appointmentRepository, simulationMetricsRepository }) {
    this.userRepository = userRepository;
    this.appointmentRepository = appointmentRepository;
    this.simulationMetricsRepository = simulationMetricsRepository;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Datos comparativos
   */
  async execute({ startDate, endDate, compareToStartDate, compareToEndDate, metric = 'all' }) {
    try {
      console.log('📊 Fetching comparative data...');

      // Validar fechas
      this._validateDates(startDate, endDate, compareToStartDate, compareToEndDate);

      const comparativeData = {
        currentPeriod: {
          startDate,
          endDate,
          metrics: {},
        },
        previousPeriod: {
          startDate: compareToStartDate,
          endDate: compareToEndDate,
          metrics: {},
        },
        comparison: {},
        generatedAt: new Date(),
      };

      // Obtener métricas según el tipo solicitado
      if (metric === 'all' || metric === 'users') {
        await this._compareUsers(
          comparativeData,
          startDate,
          endDate,
          compareToStartDate,
          compareToEndDate
        );
      }

      if (metric === 'all' || metric === 'appointments') {
        await this._compareAppointments(
          comparativeData,
          startDate,
          endDate,
          compareToStartDate,
          compareToEndDate
        );
      }

      if (metric === 'all' || metric === 'simulations') {
        await this._compareSimulations(
          comparativeData,
          startDate,
          endDate,
          compareToStartDate,
          compareToEndDate
        );
      }

      console.log('✅ Comparative data fetched successfully');
      return comparativeData;
    } catch (error) {
      console.error('❌ Error fetching comparative data:', error);
      throw new Error(`Error fetching comparative data: ${error.message}`);
    }
  }

  /**
   * Validar fechas
   * @private
   */
  _validateDates(startDate, endDate, compareToStartDate, compareToEndDate) {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    if (!compareToStartDate || !compareToEndDate) {
      throw new Error('Comparison dates are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const compareStart = new Date(compareToStartDate);
    const compareEnd = new Date(compareToEndDate);

    if (start > end) {
      throw new Error('Start date must be before end date');
    }

    if (compareStart > compareEnd) {
      throw new Error('Comparison start date must be before comparison end date');
    }
  }

  /**
   * Comparar métricas de usuarios
   * @private
   */
  async _compareUsers(data, startDate, endDate, compareToStartDate, compareToEndDate) {
    const [currentUsers, previousUsers] = await Promise.all([
      this.userRepository.count({
        createdAfter: new Date(startDate),
        createdBefore: new Date(endDate),
      }),
      this.userRepository.count({
        createdAfter: new Date(compareToStartDate),
        createdBefore: new Date(compareToEndDate),
      }),
    ]);

    // eslint-disable-next-line no-param-reassign
    data.currentPeriod.metrics.newUsers = currentUsers;
    // eslint-disable-next-line no-param-reassign
    data.previousPeriod.metrics.newUsers = previousUsers;
    // eslint-disable-next-line no-param-reassign
    data.comparison.usersGrowth = this._calculateGrowth(currentUsers, previousUsers);
  }

  /**
   * Comparar métricas de citas
   * @private
   */
  async _compareAppointments(data, startDate, endDate, compareToStartDate, compareToEndDate) {
    const [currentAppointments, previousAppointments] = await Promise.all([
      this.appointmentRepository.countInPeriod(new Date(startDate), new Date(endDate)),
      this.appointmentRepository.countInPeriod(
        new Date(compareToStartDate),
        new Date(compareToEndDate)
      ),
    ]);

    // eslint-disable-next-line no-param-reassign
    data.currentPeriod.metrics.appointments = currentAppointments;
    // eslint-disable-next-line no-param-reassign
    data.previousPeriod.metrics.appointments = previousAppointments;
    // eslint-disable-next-line no-param-reassign
    data.comparison.appointmentsGrowth = this._calculateGrowth(
      currentAppointments,
      previousAppointments
    );
  }

  /**
   * Comparar métricas de simulaciones
   * @private
   */
  async _compareSimulations(data, startDate, endDate, compareToStartDate, compareToEndDate) {
    const [currentMetrics, previousMetrics] = await Promise.all([
      this.simulationMetricsRepository.getMetricsInPeriod(new Date(startDate), new Date(endDate)),
      this.simulationMetricsRepository.getMetricsInPeriod(
        new Date(compareToStartDate),
        new Date(compareToEndDate)
      ),
    ]);

    // eslint-disable-next-line no-param-reassign
    data.currentPeriod.metrics.simulations = currentMetrics;
    // eslint-disable-next-line no-param-reassign
    data.previousPeriod.metrics.simulations = previousMetrics;
    // eslint-disable-next-line no-param-reassign
    data.comparison.simulationsGrowth = this._calculateGrowth(
      currentMetrics.totalSimulations,
      previousMetrics.totalSimulations
    );
  }

  /**
   * Calcular crecimiento porcentual
   * @private
   */
  _calculateGrowth(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }
}

module.exports = GetComparativeDataUseCase;
