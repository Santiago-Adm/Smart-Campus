/**
 * Use Case: Predict Dropout Risk
 * Predice riesgo de deserción estudiantil usando IA
 */

class PredictDropoutRiskUseCase {
  constructor({
    dropoutPredictionService,
    userRepository,
    appointmentRepository,
    simulationMetricsRepository,
    resourceRepository,
    conversationRepository,
  }) {
    this.dropoutPredictionService = dropoutPredictionService;
    this.userRepository = userRepository;
    this.appointmentRepository = appointmentRepository;
    this.simulationMetricsRepository = simulationMetricsRepository;
    this.resourceRepository = resourceRepository;
    this.conversationRepository = conversationRepository;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} params - Parámetros de predicción
   * @returns {Promise<Object>} Predicción de riesgo de deserción
   */
  async execute({ userId = null, userIds = null }) {
    try {
      console.log('🧠 Predicting dropout risk...');

      // Predicción individual o batch
      if (userId) {
        const prediction = await this._predictSingleStudent(userId);
        return { predictions: [prediction], type: 'SINGLE' };
      }
      if (userIds && Array.isArray(userIds)) {
        const predictions = await this._predictBatchStudents(userIds);
        return { predictions, type: 'BATCH' };
      }
      // Predecir para todos los estudiantes activos
      const allStudents = await this.userRepository.findByRole('STUDENT', { isActive: true });
      const studentIds = allStudents.map((s) => s.id);
      const predictions = await this._predictBatchStudents(studentIds);
      return { predictions, type: 'ALL' };
    } catch (error) {
      console.error('❌ Error predicting dropout risk:', error);
      throw new Error(`Error predicting dropout risk: ${error.message}`);
    }
  }

  /**
   * Predecir para un solo estudiante
   * @private
   */
  async _predictSingleStudent(userId) {
    // Recolectar datos del estudiante
    const studentData = await this._collectStudentData(userId);

    // Obtener predicción del servicio de IA
    const prediction = await this.dropoutPredictionService.predictDropoutRisk(studentData);

    // Agregar información del usuario
    const user = await this.userRepository.findById(userId);

    return {
      ...prediction,
      userInfo: {
        id: user.id,
        fullName: user.getFullName(),
        email: user.email.getValue(),
      },
    };
  }

  /**
   * Predecir para múltiples estudiantes
   * @private
   */
  async _predictBatchStudents(userIds) {
    console.log(`🧠 Batch prediction for ${userIds.length} students...`);

    // Recolectar datos de todos los estudiantes en paralelo
    const studentsData = await Promise.all(
      userIds.map((userId) => this._collectStudentData(userId))
    );

    // Obtener predicciones en batch
    const predictions = await this.dropoutPredictionService.predictBatch(studentsData);

    // Agregar información de usuarios
    const users = await Promise.all(userIds.map((userId) => this.userRepository.findById(userId)));

    return predictions.map((pred, index) => ({
      ...pred,
      userInfo: {
        id: users[index].id,
        fullName: users[index].getFullName(),
        email: users[index].email.getValue(),
      },
    }));
  }

  /**
   * Recolectar datos del estudiante para predicción
   * @private
   */
  async _collectStudentData(userId) {
    const [
      attendanceRate,
      avgSimulationScore,
      libraryAccessCount,
      chatbotInteractionCount,
      daysSinceLastLogin,
    ] = await Promise.all([
      this._calculateAttendanceRate(userId),
      this._calculateAvgSimulationScore(userId),
      this._calculateLibraryAccessCount(userId),
      this._calculateChatbotInteractionCount(userId),
      this._calculateDaysSinceLastLogin(userId),
    ]);

    return {
      userId,
      attendanceRate,
      avgSimulationScore,
      libraryAccessCount,
      chatbotInteractionCount,
      daysSinceLastLogin,
    };
  }

  /**
   * Calcular tasa de asistencia (basada en citas completadas)
   * @private
   */
  async _calculateAttendanceRate(userId) {
    try {
      const [completed, noShow] = await Promise.all([
        this.appointmentRepository.countByStatus('COMPLETED', { studentId: userId }),
        this.appointmentRepository.countByStatus('NO_SHOW', { studentId: userId }),
      ]);

      const total = completed + noShow;
      if (total === 0) return 75; // Default: 75% si no hay datos

      return (completed / total) * 100;
    } catch (error) {
      console.warn('Error calculating attendance rate:', error);
      return 75; // Default
    }
  }

  /**
   * Calcular puntuación promedio en simulaciones
   * @private
   */
  async _calculateAvgSimulationScore(userId) {
    try {
      const metrics = await this.simulationMetricsRepository.getAggregatedMetrics({ userId });
      return metrics.averageScore || 60; // Default: 60 si no hay datos
    } catch (error) {
      console.warn('Error calculating avg simulation score:', error);
      return 60; // Default
    }
  }

  /**
   * Calcular accesos a biblioteca (últimos 30 días)
   * @private
   */
  async _calculateLibraryAccessCount(_userId) {
    try {
      // Nota: Esto requeriría un tracking de accesos en ResourceRepository
      // Por ahora, retornamos un valor por defecto
      return 10; // Default: 10 accesos/mes
      // eslint-disable-next-line no-unreachable
    } catch (error) {
      console.warn('Error calculating library access count:', error);
      return 10; // Default
    }
  }

  /**
   * Calcular interacciones con chatbot (últimos 30 días)
   * @private
   */
  async _calculateChatbotInteractionCount(userId) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const conversations = await this.conversationRepository.countByUser(userId, thirtyDaysAgo);
      return conversations;
    } catch (error) {
      console.warn('Error calculating chatbot interaction count:', error);
      return 5; // Default: 5 interacciones/mes
    }
  }

  /**
   * Calcular días desde último login
   * @private
   */
  async _calculateDaysSinceLastLogin(userId) {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user.lastLoginAt) {
        return 30; // Default: 30 días si nunca hizo login
      }

      const now = new Date();
      const lastLogin = new Date(user.lastLoginAt);
      const diffTime = Math.abs(now - lastLogin);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    } catch (error) {
      console.warn('Error calculating days since last login:', error);
      return 7; // Default: 7 días
    }
  }
}

module.exports = PredictDropoutRiskUseCase;
