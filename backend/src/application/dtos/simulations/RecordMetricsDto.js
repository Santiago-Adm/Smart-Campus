/**
 * DTO: Record Metrics
 * Valida datos para registrar métricas de simulación
 */

class RecordMetricsDto {
  constructor({
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
    this.scenarioId = scenarioId;
    this.sessionId = sessionId;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.stepsCompleted = parseInt(stepsCompleted, 10);
    this.stepsTotal = parseInt(stepsTotal, 10);
    this.accuracy = parseFloat(accuracy);
    this.score = parseFloat(score);
    this.errors = Array.isArray(errors) ? errors : [];
    this.vitalSignsData = vitalSignsData;
  }

  /**
   * Validar datos
   */
  validate() {
    const errors = [];

    // Validar scenarioId
    if (!this.scenarioId) {
      errors.push('Scenario ID is required');
    }

    // Validar sessionId
    if (!this.sessionId) {
      errors.push('Session ID is required');
    }

    // Validar startedAt
    if (!this.startedAt) {
      errors.push('Started at timestamp is required');
    }

    // Validar stepsCompleted y stepsTotal
    if (this.stepsCompleted === undefined || this.stepsCompleted < 0) {
      errors.push('Steps completed must be a non-negative number');
    }

    if (this.stepsTotal === undefined || this.stepsTotal < 1) {
      errors.push('Steps total must be at least 1');
    }

    if (this.stepsCompleted > this.stepsTotal) {
      errors.push('Steps completed cannot exceed steps total');
    }

    // Validar accuracy
    if (this.accuracy < 0 || this.accuracy > 1) {
      errors.push('Accuracy must be between 0 and 1');
    }

    // Validar score
    if (this.score < 0 || this.score > 100) {
      errors.push('Score must be between 0 and 100');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

module.exports = RecordMetricsDto;
