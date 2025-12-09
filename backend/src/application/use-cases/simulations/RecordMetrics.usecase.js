/**
 * Use Case: Record Metrics
 * Registra las métricas de desempeño de una simulación
 */

const SimulationMetricsModel = require('../../../infrastructure/persistence/mongo/schemas/SimulationMetrics.schema');

class RecordMetricsUseCase {
  constructor({ scenarioRepository }) {
    this.scenarioRepository = scenarioRepository;
  }

  /**
   * Ejecutar registro de métricas
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async execute({
    userId,
    scenarioId,
    sessionId,
    startedAt,
    completedAt = new Date(),
    stepsCompleted,
    stepsTotal,
    accuracy = 0,
    score = 0,
    errors = [],
    vitalSignsData = null,
  }) {
    try {
      // ✅ AGREGAR ESTA LÍNEA: Parsear errors si viene como string
      const parsedErrors = typeof errors === 'string' ? JSON.parse(errors) : errors || [];

      // Validar parámetros obligatorios
      this._validateParams({
        userId,
        scenarioId,
        stepsCompleted,
        stepsTotal,
      });

      // Calcular duración
      const duration = this._calculateDuration(startedAt, completedAt);

      // Calcular accuracy si no fue proporcionado
      if (accuracy === 0 && stepsCompleted > 0) {
        // eslint-disable-next-line no-param-reassign
        accuracy = stepsCompleted / stepsTotal;
      }

      // Calcular score si no fue proporcionado
      if (score === 0) {
        // eslint-disable-next-line no-param-reassign
        score = this._calculateScore(accuracy, duration, parsedErrors.length); // ⬅️ CAMBIAR errors.length por parsedErrors.length
      }

      // Crear registro de métricas en MongoDB
      const metrics = await SimulationMetricsModel.create({
        userId,
        scenarioId,
        sessionId,
        startedAt: new Date(startedAt),
        completedAt: new Date(completedAt),
        duration,
        stepsCompleted,
        stepsTotal,
        accuracy: parseFloat(accuracy.toFixed(2)),
        score: Math.round(score),
        errors: parsedErrors, // ⬅️ CAMBIAR errors por parsedErrors
        vitalSignsData,
      });

      // Actualizar estadísticas del escenario
      await this.scenarioRepository.recordCompletion(scenarioId, score);

      return {
        success: true,
        metricsId: metrics._id.toString(),
        summary: {
          userId,
          scenarioId,
          duration,
          stepsCompleted,
          stepsTotal,
          accuracy: parseFloat(accuracy.toFixed(2)),
          score: Math.round(score),
          errorCount: parsedErrors.length, // ⬅️ CAMBIAR errors.length por parsedErrors.length
          completedAt,
        },
      };
    } catch (error) {
      throw new Error(`Error recording metrics: ${error.message}`);
    }
  }

  /**
   * Validar parámetros
   */
  _validateParams({ userId, scenarioId, stepsCompleted, stepsTotal }) {
    if (!userId) throw new Error('User ID is required');
    if (!scenarioId) throw new Error('Scenario ID is required');
    if (stepsCompleted === undefined) throw new Error('Steps completed is required');
    if (stepsTotal === undefined) throw new Error('Steps total is required');

    if (stepsCompleted < 0 || stepsCompleted > stepsTotal) {
      throw new Error('Invalid steps completed value');
    }
  }

  /**
   * Calcular duración en segundos
   * @private
   */
  _calculateDuration(startedAt, completedAt) {
    const start = new Date(startedAt);
    const end = new Date(completedAt);
    return Math.floor((end - start) / 1000); // segundos
  }

  /**
   * Calcular score (0-100)
   * @private
   */
  _calculateScore(accuracy, duration, errorCount) {
    // Score base por accuracy (70% del total)
    let score = accuracy * 70;

    // Bonus por tiempo (20% del total)
    // Asumiendo tiempo ideal es 15 minutos = 900 segundos
    const idealTime = 900;
    const timeFactor = Math.max(0, 1 - Math.abs(duration - idealTime) / idealTime);
    score += timeFactor * 20;

    // Penalización por errores (10% del total)
    const errorPenalty = Math.min(errorCount * 2, 10);
    score += Math.max(0, 10 - errorPenalty);

    return Math.min(100, Math.max(0, score));
  }
}

module.exports = RecordMetricsUseCase;
