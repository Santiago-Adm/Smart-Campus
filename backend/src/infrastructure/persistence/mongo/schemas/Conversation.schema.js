/**
 * Mongoose Schema: Conversation
 * Schema para conversaciones del chatbot en MongoDB
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    functionCalls: {
      type: mongoose.Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [messageSchema],
    context: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isEscalated: {
      type: Boolean,
      default: false,
      index: true,
    },
    escalatedTo: {
      type: String,
    },
    escalatedAt: {
      type: Date,
    },
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
    collection: 'conversations',
  }
);

// Índices compuestos
conversationSchema.index({ userId: 1, isActive: 1 });
conversationSchema.index({ isEscalated: 1, escalatedTo: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
