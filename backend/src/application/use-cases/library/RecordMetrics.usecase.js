/**
 * Use Case: Record Simulation Metrics
 * Registra las métricas de una simulación completada
 */

class RecordMetricsUseCase {
  constructor({ scenarioRepository }) {
    this.scenarioRepository = scenarioRepository;
  }

  /**
   * Ejecutar registro de métricas
   * @param {Object} metricsData - Datos de la simulación completada
   * @returns {Promise<Object>}
   */
  async execute(metricsData) {
    try {
      console.log('📊 Recording simulation metrics...');
      console.log('📊 Input data:', JSON.stringify(metricsData, null, 2));

      // Validar datos requeridos
      const {
        userId,
        scenarioId,
        sessionId,
        startedAt,
        completedAt,
        stepsCompleted,
        stepsTotal,
        accuracy,
        score,
        errors = [],
        vitalSignsData = null,
      } = metricsData;

      // Validaciones
      if (!userId) {
        throw new Error('userId is required');
      }

      if (!scenarioId) {
        throw new Error('scenarioId is required');
      }

      if (!sessionId) {
        throw new Error('sessionId is required');
      }

      if (!startedAt || !completedAt) {
        throw new Error('startedAt and completedAt are required');
      }

      // Calcular duración en segundos
      const startDate = new Date(startedAt);
      const endDate = new Date(completedAt);
      const duration = Math.floor((endDate - startDate) / 1000);

      console.log('⏱️ Calculated duration:', duration, 'seconds');

      // Crear documento de métricas
      const metricsDoc = {
        userId,
        scenarioId,
        sessionId,
        startedAt: startDate,
        completedAt: endDate,
        duration,
        stepsCompleted: Number(stepsCompleted),
        stepsTotal: Number(stepsTotal),
        accuracy: Number(accuracy),
        score: Number(score),
        errors: Array.isArray(errors) ? errors : [],
        vitalSignsData: vitalSignsData || null,
      };

      console.log('💾 Creating metrics document:', JSON.stringify(metricsDoc, null, 2));

      // Guardar en MongoDB
      // eslint-disable-next-line no-undef
      const savedMetrics = await SimulationMetricsModel.create(metricsDoc);

      console.log('✅ Metrics saved successfully with ID:', savedMetrics._id);

      // Retornar resumen
      return {
        id: savedMetrics._id.toString(),
        userId: savedMetrics.userId,
        scenarioId: savedMetrics.scenarioId,
        duration: savedMetrics.duration,
        stepsCompleted: savedMetrics.stepsCompleted,
        stepsTotal: savedMetrics.stepsTotal,
        accuracy: savedMetrics.accuracy,
        score: savedMetrics.score,
        errorCount: savedMetrics.errors.length,
        completedAt: savedMetrics.completedAt,
      };
    } catch (error) {
      console.error('❌ Error recording metrics:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to record metrics: ${error.message}`);
    }
  }
}

module.exports = RecordMetricsUseCase;
