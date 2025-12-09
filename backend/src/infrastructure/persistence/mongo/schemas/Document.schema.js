/**
 * Mongoose Schema: Document
 * Schema para documentos en MongoDB
 */

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      type: {
        type: String,
        required: true,
        enum: [
          'DNI',
          'BIRTH_CERTIFICATE',
          'ACADEMIC_CERTIFICATE',
          'MEDICAL_CERTIFICATE',
          'RESIDENCE_PROOF',
          'PHOTO',
          'TRANSCRIPT',
          'DIPLOMA',
          'OTHER',
        ],
      },
      fileName: {
        type: String,
        required: true,
      },
      fileSize: {
        type: Number,
        required: true,
      },
      mimeType: {
        type: String,
        required: true,
      },
      issueDate: {
        type: Date,
      },
      description: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    ocrData: {
      type: mongoose.Schema.Types.Mixed,
    },
    validationScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    rejectionReason: {
      type: String,
    },
    reviewedBy: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
    version: {
      type: Number,
      default: 1,
    },
    previousVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
  },
  {
    timestamps: true,
    collection: 'documents',
  }
);

// Índices compuestos
documentSchema.index({ userId: 1, status: 1 });
documentSchema.index({ 'metadata.type': 1 });
documentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
