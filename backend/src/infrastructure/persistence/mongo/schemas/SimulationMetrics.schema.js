/**
 * Mongoose Schema: SimulationMetrics
 * Schema para métricas de simulaciones AR
 */

const mongoose = require('mongoose');

const simulationMetricsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    scenarioId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true, // ← Evita duplicados
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      required: true, // ← Cambiar a required
    },
    duration: {
      type: Number, // segundos
      required: true, // ← Cambiar a required
      min: 0,
    },
    stepsCompleted: {
      type: Number,
      required: true, // ← Cambiar a required
      default: 0,
      min: 0,
    },
    stepsTotal: {
      type: Number,
      required: true,
      min: 1,
    },
    accuracy: {
      type: Number, // ✅ CAMBIAR: 0-100 en lugar de 0-1
      required: true,
      min: 0,
      max: 100, // ← ERA 1, AHORA ES 100
    },
    score: {
      type: Number, // 0-100
      required: true,
      min: 0,
      max: 100,
    },
    errors: [
      {
        step: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        attempts: {
          type: Number,
          default: 1,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    vitalSignsData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'simulation_metrics',
  }
);

// Índices compuestos para consultas optimizadas
simulationMetricsSchema.index({ userId: 1, scenarioId: 1 });
simulationMetricsSchema.index({ userId: 1, completedAt: -1 });
simulationMetricsSchema.index({ scenarioId: 1, completedAt: -1 });
simulationMetricsSchema.index({ score: -1 });

module.exports = mongoose.model('SimulationMetrics', simulationMetricsSchema);
