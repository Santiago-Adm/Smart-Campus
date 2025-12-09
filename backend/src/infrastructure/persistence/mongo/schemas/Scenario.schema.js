/**
 * Mongoose Schema: Scenario
 * Schema para escenarios de simulación AR
 */

const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: 'text',
    },
    description: {
      type: String,
      index: 'text',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'venopuncion',
        'rcp',
        'cateterismo',
        'curacion',
        'inyeccion',
        'signos_vitales',
        'otros',
      ],
      index: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
      index: true,
    },
    modelUrl: {
      type: String,
      required: true,
    },
    steps: [
      {
        order: Number,
        title: String,
        description: String,
        expectedTime: Number, // segundos
        markers: mongoose.Schema.Types.Mixed,
        validations: mongoose.Schema.Types.Mixed,
      },
    ],
    criteria: [
      {
        name: String,
        description: String,
        weight: Number,
        type: String, // 'time', 'accuracy', 'sequence', etc.
      },
    ],
    estimatedDuration: {
      type: Number, // minutos
      default: 15,
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    thumbnailUrl: {
      type: String,
    },
    completionCount: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    collection: 'scenarios',
  }
);

// Índices compuestos
scenarioSchema.index({ category: 1, difficulty: 1 });
scenarioSchema.index({ isPublic: 1, averageScore: -1 });
scenarioSchema.index({ completionCount: -1 });

// Índice de texto para búsqueda
scenarioSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Scenario', scenarioSchema);
