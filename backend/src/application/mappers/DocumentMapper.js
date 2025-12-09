/**
 * Document Mapper
 * Convierte entre Document Entity y diferentes representaciones
 */

const Document = require('../../domain/entities/Document.entity');
const DocumentResponseDto = require('../dtos/documents/DocumentResponseDto');

class DocumentMapper {
  /**
   * Convertir de MongoDB document a Entity
   * @param {Object} mongoDoc - Documento de MongoDB
   * @returns {Document}
   */
  static toEntity(mongoDoc) {
    if (!mongoDoc) return null;

    return new Document({
      id: mongoDoc._id?.toString(),
      userId: mongoDoc.userId,
      metadata: mongoDoc.metadata,
      fileUrl: mongoDoc.fileUrl,
      status: mongoDoc.status,
      ocrData: mongoDoc.ocrData || null,
      reviewNotes: mongoDoc.reviewNotes || null,
      reviewedBy: mongoDoc.reviewedBy || null,
      reviewedAt: mongoDoc.reviewedAt || null,
      createdAt: mongoDoc.createdAt,
      updatedAt: mongoDoc.updatedAt,
    });
  }

  /**
   * Convertir array de MongoDB documents a Entities
   * @param {Array} mongoDocs
   * @returns {Array<Document>}
   */
  static toEntityArray(mongoDocs) {
    if (!mongoDocs || !Array.isArray(mongoDocs)) {
      return [];
    }
    return mongoDocs.map((doc) => this.toEntity(doc));
  }

  /**
   * Convertir de Entity a Response DTO
   * @param {Document} entity
   * @returns {DocumentResponseDto}
   */
  static toResponseDto(entity) {
    if (!entity) return null;
    return DocumentResponseDto.fromEntity(entity);
  }

  /**
   * Convertir array de Entities a Response DTOs
   * @param {Array<Document>} entities
   * @returns {Array<DocumentResponseDto>}
   */
  static toResponseDtoArray(entities) {
    if (!entities || !Array.isArray(entities)) {
      return [];
    }
    return entities.map((entity) => this.toResponseDto(entity));
  }

  /**
   * Convertir de Entity a MongoDB document (para guardar)
   * @param {Document} entity
   * @returns {Object}
   */
  static toMongoDocument(entity) {
    if (!entity) return null;

    const doc = {
      userId: entity.userId,
      metadata: entity.metadata,
      fileUrl: entity.fileUrl,
      status: entity.status,
      ocrData: entity.ocrData || null,
      reviewNotes: entity.reviewNotes || null,
      reviewedBy: entity.reviewedBy || null,
      reviewedAt: entity.reviewedAt || null,
      updatedAt: new Date(),
    };

    // Solo incluir _id si existe (para updates)
    if (entity.id) {
      doc._id = entity.id;
    } else {
      // Para nuevos documentos, agregar createdAt
      doc.createdAt = new Date();
    }

    return doc;
  }

  /**
   * Crear respuesta paginada
   * @param {Array<Document>} entities
   * @param {Object} pagination
   * @returns {Object}
   */
  static toPaginatedResponse(entities, pagination) {
    return {
      documents: this.toResponseDtoArray(entities),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
      },
    };
  }
}

module.exports = DocumentMapper;
