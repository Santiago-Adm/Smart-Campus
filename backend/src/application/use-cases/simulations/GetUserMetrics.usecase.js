/**
 * Use Case: Get User Metrics
 * Obtener historial de métricas de simulaciones del usuario
 */

const SimulationMetricsModel = require('../../../infrastructure/persistence/mongo/schemas/SimulationMetrics.schema');

class GetUserMetricsUseCase {
  /**
   * Ejecutar consulta de métricas
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async execute({ userId, scenarioId = null, limit = 10, sortBy = '-completedAt' }) {
    try {
      // Construir query
      const query = { userId };

      if (scenarioId) {
        query.scenarioId = scenarioId;
      }

      console.log('📊 Fetching user metrics with query:', query);

      // Obtener métricas
      const metrics = await SimulationMetricsModel.find(query).sort(sortBy).limit(limit).lean();

      console.log(`✅ Found ${metrics.length} metrics for user`);

      // Calcular resumen si hay métricas
      let summary = null;
      if (metrics.length > 0) {
        const totalAttempts = metrics.length;
        const averageScore = Math.round(
          metrics.reduce((sum, m) => sum + m.score, 0) / totalAttempts
        );
        const bestScore = Math.max(...metrics.map((m) => m.score));
        const totalTime = metrics.reduce((sum, m) => sum + m.duration, 0);

        summary = {
          totalAttempts,
          averageScore,
          bestScore,
          totalTime,
        };
      }

      return {
        success: true,
        metrics,
        summary,
      };
    } catch (error) {
      console.error('❌ Error fetching user metrics:', error);
      throw new Error(`Error fetching user metrics: ${error.message}`);
    }
  }
}

module.exports = GetUserMetricsUseCase;
