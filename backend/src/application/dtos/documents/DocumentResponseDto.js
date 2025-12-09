/**
 * DocumentResponse DTO
 * Define la estructura de respuesta de un documento
 */

class DocumentResponseDto {
  constructor(document) {
    this.id = document.id;
    this.userId = document.userId;
    this.metadata = {
      type: document.metadata.type,
      fileName: document.metadata.fileName,
      fileSize: document.metadata.fileSize,
      mimeType: document.metadata.mimeType,
      issueDate: document.metadata.issueDate,
      description: document.metadata.description,
    };
    this.fileUrl = document.fileUrl;
    this.status = document.status;
    this.reviewNotes = document.reviewNotes || null;
    this.reviewedBy = document.reviewedBy || null;
    this.reviewedAt = document.reviewedAt || null;
    this.createdAt = document.createdAt;
    this.updatedAt = document.updatedAt;

    // OCR data (si existe)
    if (document.ocrData) {
      this.ocrData = {
        confidence: document.ocrData.confidence,
        extractedFields: document.ocrData.extractedFields,
        validatedAt: document.ocrData.validatedAt,
        // No incluir extractedText completo por seguridad
      };
    }
  }

  /**
   * Crear DTO desde entidad
   */
  static fromEntity(document) {
    return new DocumentResponseDto(document);
  }

  /**
   * Crear array de DTOs desde array de entidades
   */
  static fromEntityArray(documents) {
    return documents.map((doc) => new DocumentResponseDto(doc));
  }

  /**
   * Versión simplificada (para listados)
   */
  toSimplified() {
    return {
      id: this.id,
      type: this.metadata.type,
      fileName: this.metadata.fileName,
      status: this.status,
      createdAt: this.createdAt,
    };
  }

  /**
   * Versión completa (para detalles)
   */
  toDetailed() {
    return {
      id: this.id,
      userId: this.userId,
      metadata: this.metadata,
      fileUrl: this.fileUrl,
      status: this.status,
      reviewNotes: this.reviewNotes,
      reviewedBy: this.reviewedBy,
      reviewedAt: this.reviewedAt,
      ocrData: this.ocrData,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = DocumentResponseDto;
