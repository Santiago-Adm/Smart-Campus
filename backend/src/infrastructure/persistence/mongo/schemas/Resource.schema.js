/**
 * Mongoose Schema: Resource
 * Schema para recursos educativos en MongoDB
 */

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
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
        'ANATOMY',
        'PHYSIOLOGY',
        'PHARMACOLOGY',
        'PROCEDURES',
        'ETHICS',
        'EMERGENCY',
        'PEDIATRICS',
        'GERIATRICS',
        'MENTAL_HEALTH',
        'COMMUNITY',
        'OTHER',
      ],
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['book', 'article', 'video', 'guide', 'case_study'],
      index: true,
    },
    author: {
      type: String,
    },
    publisher: {
      type: String,
    },
    publicationDate: {
      type: Date,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    tags: {
      type: [String],
      index: true,
    },
    language: {
      type: String,
      default: 'es',
    },
    pageCount: {
      type: Number,
    },
    duration: {
      type: Number, // Para videos (segundos)
    },
    fileSize: {
      type: Number,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    uploadedBy: {
      type: String,
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'resources',
  }
);

// Índices compuestos
resourceSchema.index({ category: 1, type: 1 });
resourceSchema.index({ tags: 1, isPublic: 1 });
resourceSchema.index({ viewCount: -1 });
resourceSchema.index({ downloadCount: -1 });
resourceSchema.index({ averageRating: -1 });

// Índice de texto para búsqueda
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
