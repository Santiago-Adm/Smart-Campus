/**
 * Entity: Document
 * Representa un documento subido por un usuario
 */

const { DocumentStatus } = require('../enums/DocumentStatus.enum');
const { DocumentType } = require('../enums/DocumentType.enum');
const DocumentMetadata = require('../value-objects/DocumentMetadata.vo');

class Document {
  constructor({
    id = null,
    userId,
    metadata,
    status = DocumentStatus.PENDING,
    fileUrl,
    ocrData = null,
    validationScore = null,
    rejectionReason = null,
    reviewedBy = null,
    reviewedAt = null,
    version = 1,
    previousVersionId = null,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.userId = this.validateUserId(userId);
    this.metadata =
      metadata instanceof DocumentMetadata ? metadata : new DocumentMetadata(metadata);
    this.status = this.validateStatus(status);
    this.fileUrl = this.validateFileUrl(fileUrl);
    this.ocrData = ocrData;
    this.validationScore = validationScore;
    this.rejectionReason = rejectionReason;
    this.reviewedBy = reviewedBy;
    this.reviewedAt = reviewedAt ? new Date(reviewedAt) : null;
    this.version = version;
    this.previousVersionId = previousVersionId;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  }

  // ============================================
  // VALIDACIONES
  // ============================================

  validateUserId(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return userId;
  }

  validateStatus(status) {
    if (!Object.values(DocumentStatus).includes(status)) {
      throw new Error(`Invalid document status: ${status}`);
    }
    return status;
  }

  validateFileUrl(fileUrl) {
    if (!fileUrl || typeof fileUrl !== 'string') {
      throw new Error('File URL is required');
    }
    return fileUrl;
  }

  // ============================================
  // MÉTODOS DE NEGOCIO
  // ============================================

  /**
   * Mover documento a revisión
   */
  moveToReview() {
    if (this.status !== DocumentStatus.PENDING) {
      throw new Error('Only pending documents can be moved to review');
    }
    this.status = DocumentStatus.IN_REVIEW;
    this.updatedAt = new Date();
  }

  /**
   * Aprobar documento
   * @param {string} reviewerId - ID del usuario que aprueba
   */
  approve(reviewerId) {
    if (this.status !== DocumentStatus.IN_REVIEW) {
      throw new Error('Only documents in review can be approved');
    }

    this.status = DocumentStatus.APPROVED;
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.rejectionReason = null;
    this.updatedAt = new Date();
  }

  /**
   * Rechazar documento
   * @param {string} reason - Razón del rechazo (mínimo 10 caracteres)
   * @param {string} reviewerId - ID del usuario que rechaza
   */
  reject(reason, reviewerId) {
    // ✅ ORDEN CORREGIDO
    // Validar estados permitidos
    if (this.status !== DocumentStatus.IN_REVIEW && this.status !== DocumentStatus.PENDING) {
      throw new Error('Only pending or in-review documents can be rejected');
    }

    // Validar razón
    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      throw new Error('Rejection reason must be at least 10 characters long');
    }

    // Actualizar documento
    this.status = DocumentStatus.REJECTED;
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.rejectionReason = reason.trim();
    this.updatedAt = new Date();
  }

  /**
   * Verificar si el documento está aprobado
   */
  isApproved() {
    return this.status === DocumentStatus.APPROVED;
  }

  /**
   * Verificar si el documento está rechazado
   */
  isRejected() {
    return this.status === DocumentStatus.REJECTED;
  }

  /**
   * Verificar si el documento está pendiente
   */
  isPending() {
    return this.status === DocumentStatus.PENDING;
  }

  /**
   * Agregar datos de OCR
   */
  addOCRData(ocrData, validationScore) {
    this.ocrData = ocrData;
    this.validationScore = validationScore;
    this.updatedAt = new Date();
  }

  /**
   * Crear nueva versión del documento
   */
  createNewVersion(newFileUrl) {
    return new Document({
      userId: this.userId,
      metadata: this.metadata,
      status: DocumentStatus.PENDING,
      fileUrl: newFileUrl,
      version: this.version + 1,
      previousVersionId: this.id,
    });
  }

  /**
   * Convertir a objeto plano
   */
  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      metadata: this.metadata.toObject(),
      status: this.status,
      fileUrl: this.fileUrl,
      ocrData: this.ocrData,
      validationScore: this.validationScore,
      rejectionReason: this.rejectionReason,
      reviewedBy: this.reviewedBy,
      reviewedAt: this.reviewedAt,
      version: this.version,
      previousVersionId: this.previousVersionId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Document;
