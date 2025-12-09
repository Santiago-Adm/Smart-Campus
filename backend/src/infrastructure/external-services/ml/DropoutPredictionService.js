/**
 * DropoutPredictionService Implementation
 * Servicio para predicción de riesgo de deserción estudiantil
 * Algoritmo simplificado basado en reglas ponderadas (MVP)
 */

class DropoutPredictionService {
  constructor() {
    this.weights = {
      attendance: 0.3, // 30% - Asistencia
      performance: 0.25, // 25% - Desempeño académico
      libraryUsage: 0.2, // 20% - Uso de biblioteca
      chatbotInteraction: 0.15, // 15% - Interacción con chatbot
      lastLogin: 0.1, // 10% - Días desde último login
    };

    this.thresholds = {
      high: 70, // >= 70 = Alto riesgo
      medium: 40, // 40-69 = Riesgo medio
      low: 0, // < 40 = Riesgo bajo
    };

    console.log('🧠 DropoutPredictionService initialized (Simplified Algorithm)');
  }

  /**
   * Predice el riesgo de deserción de un estudiante
   * @param {Object} studentData - Datos del estudiante
   * @returns {Object} Predicción con score y nivel de riesgo
   */
  async predictDropoutRisk(studentData) {
    try {
      // 1. Validar datos de entrada
      this._validateStudentData(studentData);

      // 2. Calcular métricas individuales
      const metrics = this._calculateMetrics(studentData);

      // 3. Calcular score ponderado (0-100)
      const dropoutScore = this._calculateWeightedScore(metrics);

      // 4. Determinar nivel de riesgo
      const riskLevel = this._determineRiskLevel(dropoutScore);

      // 5. Generar recomendaciones
      const recommendations = this._generateRecommendations(metrics, riskLevel);

      console.log(`📊 Dropout prediction for student ${studentData.userId}:`, {
        score: dropoutScore.toFixed(2),
        riskLevel,
      });

      return {
        userId: studentData.userId,
        dropoutScore: Math.round(dropoutScore * 100) / 100, // 2 decimales
        riskLevel,
        metrics,
        recommendations,
        calculatedAt: new Date(),
      };
    } catch (error) {
      console.error('❌ Error predicting dropout risk:', error);
      throw new Error(`Error predicting dropout risk: ${error.message}`);
    }
  }

  /**
   * Predice riesgo para múltiples estudiantes
   * @param {Array} studentsData - Array de datos de estudiantes
   * @returns {Array} Predicciones para todos los estudiantes
   */
  async predictBatch(studentsData) {
    try {
      const predictions = await Promise.all(
        studentsData.map((student) => this.predictDropoutRisk(student))
      );

      console.log(`📊 Batch prediction completed for ${predictions.length} students`);
      return predictions;
    } catch (error) {
      console.error('❌ Error in batch prediction:', error);
      throw error;
    }
  }

  /**
   * Valida datos del estudiante
   * @private
   */
  _validateStudentData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Student data must be an object');
    }

    const required = [
      'userId',
      'attendanceRate',
      'avgSimulationScore',
      'libraryAccessCount',
      'chatbotInteractionCount',
      'daysSinceLastLogin',
    ];

    // eslint-disable-next-line no-restricted-syntax
    for (const field of required) {
      if (data[field] === undefined || data[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  /**
   * Calcula métricas individuales (0-100)
   * @private
   */
  _calculateMetrics(data) {
    return {
      // Asistencia: Inverso (baja asistencia = alto riesgo)
      attendanceMetric: this._normalizeInverse(data.attendanceRate, 0, 100),

      // Desempeño: Inverso (bajo score = alto riesgo)
      performanceMetric: this._normalizeInverse(data.avgSimulationScore, 0, 100),

      // Uso de biblioteca: Bajo uso = alto riesgo
      libraryMetric: this._normalizeLibraryUsage(data.libraryAccessCount),

      // Interacción con chatbot: Baja interacción = alto riesgo
      chatbotMetric: this._normalizeChatbotUsage(data.chatbotInteractionCount),

      // Días desde último login: Más días = mayor riesgo
      lastLoginMetric: this._normalizeLastLogin(data.daysSinceLastLogin),
    };
  }

  /**
   * Normaliza valor inverso (100 - valor)
   * @private
   */
  _normalizeInverse(value, min, max) {
    const normalized = ((value - min) / (max - min)) * 100;
    return 100 - Math.max(0, Math.min(100, normalized)); // Invertir
  }

  /**
   * Normaliza uso de biblioteca
   * @private
   */
  _normalizeLibraryUsage(accessCount) {
    // < 5 accesos/mes = alto riesgo (80-100)
    // 5-15 accesos = medio riesgo (40-80)
    // > 15 accesos = bajo riesgo (0-40)
    if (accessCount < 5) return 80 + (5 - accessCount) * 4;
    if (accessCount < 15) return 80 - (accessCount - 5) * 4;
    return Math.max(0, 40 - (accessCount - 15) * 2);
  }

  /**
   * Normaliza interacción con chatbot
   * @private
   */
  _normalizeChatbotUsage(interactionCount) {
    // < 3 interacciones/mes = alto riesgo
    // 3-10 = medio riesgo
    // > 10 = bajo riesgo
    if (interactionCount < 3) return 70 + (3 - interactionCount) * 10;
    if (interactionCount < 10) return 70 - (interactionCount - 3) * 6;
    return Math.max(0, 28 - (interactionCount - 10) * 2);
  }

  /**
   * Normaliza días desde último login
   * @private
   */
  _normalizeLastLogin(days) {
    // 0-3 días = bajo riesgo (0-20)
    // 4-7 días = medio riesgo (20-50)
    // > 7 días = alto riesgo (50-100)
    if (days <= 3) return days * 6.67;
    if (days <= 7) return 20 + (days - 3) * 7.5;
    return Math.min(100, 50 + (days - 7) * 5);
  }

  /**
   * Calcula score ponderado final
   * @private
   */
  _calculateWeightedScore(metrics) {
    return (
      metrics.attendanceMetric * this.weights.attendance +
      metrics.performanceMetric * this.weights.performance +
      metrics.libraryMetric * this.weights.libraryUsage +
      metrics.chatbotMetric * this.weights.chatbotInteraction +
      metrics.lastLoginMetric * this.weights.lastLogin
    );
  }

  /**
   * Determina nivel de riesgo basado en score
   * @private
   */
  _determineRiskLevel(score) {
    if (score >= this.thresholds.high) return 'HIGH';
    if (score >= this.thresholds.medium) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Genera recomendaciones basadas en métricas
   * @private
   */
  _generateRecommendations(metrics, riskLevel) {
    const recommendations = [];

    if (riskLevel === 'HIGH') {
      recommendations.push('Immediate intervention required');
    }

    if (metrics.attendanceMetric > 50) {
      recommendations.push('Low attendance detected - Contact student');
    }

    if (metrics.performanceMetric > 60) {
      recommendations.push('Poor academic performance - Offer tutoring');
    }

    if (metrics.libraryMetric > 60) {
      recommendations.push('Low library usage - Encourage resource access');
    }

    if (metrics.lastLoginMetric > 50) {
      recommendations.push('Student inactive - Send reminder email');
    }

    if (recommendations.length === 0) {
      recommendations.push('Student is performing well - Continue monitoring');
    }

    return recommendations;
  }

  /**
   * Obtiene estadísticas del modelo
   */
  getModelInfo() {
    return {
      modelType: 'Rule-based weighted scoring',
      version: '1.0.0',
      weights: this.weights,
      thresholds: this.thresholds,
      lastUpdated: new Date('2024-11-12'),
    };
  }
}

module.exports = DropoutPredictionService;
