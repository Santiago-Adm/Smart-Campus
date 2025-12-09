/**
 * DTO: Execute Simulation
 * Valida datos para ejecutar una simulación
 */

class ExecuteSimulationDto {
  constructor({ scenarioId, action = 'start' }) {
    this.scenarioId = scenarioId;
    this.action = action;
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

    // Validar action
    const validActions = ['start', 'pause', 'resume', 'complete'];
    if (!validActions.includes(this.action)) {
      errors.push(`Action must be one of: ${validActions.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

module.exports = ExecuteSimulationDto;
