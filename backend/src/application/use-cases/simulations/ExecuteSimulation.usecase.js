/**
 * Use Case: Execute Simulation
 * Inicia o continúa la ejecución de una simulación AR
 */

class ExecuteSimulationUseCase {
  constructor({ scenarioRepository }) {
    this.scenarioRepository = scenarioRepository;
  }

  /**
   * Ejecutar simulación
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async execute({ userId, scenarioId, action = 'start' }) {
    try {
      // Validar parámetros
      if (!userId) throw new Error('User ID is required');
      if (!scenarioId) throw new Error('Scenario ID is required');

      // Buscar escenario
      const scenario = await this.scenarioRepository.findById(scenarioId);

      if (!scenario) {
        throw new Error('Scenario not found');
      }

      // Verificar acceso (debe ser público o creado por el usuario)
      if (!scenario.isPublic && scenario.createdBy !== userId) {
        throw new Error('You do not have access to this scenario');
      }

      // Procesar según la acción
      let result = {};

      switch (action) {
        case 'start':
          result = this._startSimulation(scenario, userId);
          break;

        case 'pause':
          result = this._pauseSimulation(scenarioId, userId);
          break;

        case 'resume':
          result = this._resumeSimulation(scenarioId, userId);
          break;

        case 'complete':
          result = this._completeSimulation(scenarioId, userId);
          break;

        default:
          throw new Error('Invalid action');
      }

      return {
        success: true,
        scenario: scenario.toObject(),
        simulation: result,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`Error executing simulation: ${error.message}`);
    }
  }

  /**
   * Iniciar simulación
   * @private
   */
  _startSimulation(scenario, userId) {
    return {
      sessionId: this._generateSessionId(),
      userId,
      scenarioId: scenario.id,
      status: 'in_progress',
      currentStep: 0,
      totalSteps: scenario.getStepCount(),
      startedAt: new Date(),
      estimatedEndTime: this._calculateEstimatedEndTime(scenario.estimatedDuration),
      steps: scenario.steps.map((step, index) => ({
        order: index,
        title: step.title,
        description: step.description,
        completed: false,
        attempts: 0,
      })),
    };
  }

  /**
   * Pausar simulación
   * @private
   */
  _pauseSimulation(_scenarioId, _userId) {
    return {
      status: 'paused',
      pausedAt: new Date(),
      message: 'Simulation paused successfully',
    };
  }

  /**
   * Reanudar simulación
   * @private
   */
  _resumeSimulation(_scenarioId, _userId) {
    return {
      status: 'in_progress',
      resumedAt: new Date(),
      message: 'Simulation resumed successfully',
    };
  }

  /**
   * Completar simulación
   * @private
   */
  _completeSimulation(_scenarioId, _userId) {
    return {
      status: 'completed',
      completedAt: new Date(),
      message: 'Simulation completed successfully',
    };
  }

  /**
   * Generar ID de sesión único
   * @private
   */
  _generateSessionId() {
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calcular tiempo estimado de finalización
   * @private
   */
  _calculateEstimatedEndTime(durationMinutes) {
    const now = new Date();
    return new Date(now.getTime() + durationMinutes * 60000);
  }
}

module.exports = ExecuteSimulationUseCase;
