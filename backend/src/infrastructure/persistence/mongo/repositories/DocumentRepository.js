/**
 * DocumentRepository Implementation
 * Implementa IDocumentRepository usando Mongoose (MongoDB)
 */

const IDocumentRepository = require('../../../../domain/interfaces/repositories/IDocumentRepository');
const Document = require('../../../../domain/entities/Document.entity');
const DocumentMetadata = require('../../../../domain/value-objects/DocumentMetadata.vo');
const DocumentModel = require('../schemas/Document.schema');

class DocumentRepository extends IDocumentRepository {
  /**
   * Convertir documento MongoDB a Entity Document
   */
  _toEntity(docModel) {
    if (!docModel) return null;

    return new Document({
      id: docModel._id.toString(),
      userId: docModel.userId,
      metadata: new DocumentMetadata(docModel.metadata),
      status: docModel.status,
      fileUrl: docModel.fileUrl,
      ocrData: docModel.ocrData,
      validationScore: docModel.validationScore,
      rejectionReason: docModel.rejectionReason,
      reviewedBy: docModel.reviewedBy,
      reviewedAt: docModel.reviewedAt,
      version: docModel.version,
      previousVersionId: docModel.previousVersionId?.toString(),
      createdAt: docModel.createdAt,
      updatedAt: docModel.updatedAt,
    });
  }

  /**
   * Convertir Entity Document a objeto plano
   */
  _toModel(document) {
    return {
      userId: document.userId,
      metadata: document.metadata.toObject(),
      status: document.status,
      fileUrl: document.fileUrl,
      ocrData: document.ocrData,
      validationScore: document.validationScore,
      rejectionReason: document.rejectionReason,
      reviewedBy: document.reviewedBy,
      reviewedAt: document.reviewedAt,
      version: document.version,
      previousVersionId: document.previousVersionId,
    };
  }

  /**
   * Crear un nuevo documento
   */
  async create(document) {
    try {
      const documentData = this._toModel(document);
      const docModel = await DocumentModel.create(documentData);

      return this._toEntity(docModel);
    } catch (error) {
      throw new Error(`Error creating document: ${error.message}`);
    }
  }

  /**
   * Buscar documento por ID
   */
  async findById(id) {
    try {
      const docModel = await DocumentModel.findById(id);
      return this._toEntity(docModel);
    } catch (error) {
      throw new Error(`Error finding document by ID: ${error.message}`);
    }
  }

  /**
   * Buscar documentos por usuario
   */
  async findByUserId(userId, filters = {}) {
    try {
      const { status, type, limit = 20, offset = 0 } = filters;

      const query = { userId };

      if (status) {
        query.status = status;
      }

      if (type) {
        query['metadata.type'] = type;
      }

      const documents = await DocumentModel.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);

      const total = await DocumentModel.countDocuments(query);

      return {
        documents: documents.map((doc) => this._toEntity(doc)),
        total,
      };
    } catch (error) {
      throw new Error(`Error finding documents by user: ${error.message}`);
    }
  }

  /**
   * Buscar documentos con filtros avanzados
   */
  async findMany(filters = {}) {
    try {
      const { userId, status, type, dateFrom, dateTo, limit = 20, offset = 0 } = filters;

      const query = {};

      if (userId) query.userId = userId;
      if (status) query.status = status;
      if (type) query['metadata.type'] = type;

      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }

      const documents = await DocumentModel.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);

      const total = await DocumentModel.countDocuments(query);

      return {
        documents: documents.map((doc) => this._toEntity(doc)),
        total,
      };
    } catch (error) {
      throw new Error(`Error finding documents: ${error.message}`);
    }
  }

  /**
   * Actualizar documento
   */
  async update(document) {
    try {
      // Si recibe un objeto Document entity
      const id = document.id || document._id;

      const updates = {
        status: document.status,
        ocrData: document.ocrData,
        validationScore: document.validationScore,
        reviewNotes: document.reviewNotes || document.rejectionReason,
        reviewedBy: document.reviewedBy,
        reviewedAt: document.reviewedAt,
        updatedAt: new Date(),
      };

      const docModel = await DocumentModel.findByIdAndUpdate(
        id,
        { $set: updates },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!docModel) {
        throw new Error('Document not found');
      }

      return this._toEntity(docModel);
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error(`Error updating document: ${error.message}`);
    }
  }

  /**
   * Eliminar documento
   */
  async delete(id) {
    try {
      const result = await DocumentModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new Error(`Error deleting document: ${error.message}`);
    }
  }

  /**
   * Buscar documentos pendientes de revisión
   */
  async findPendingReview(limit = 20) {
    try {
      const documents = await DocumentModel.find({
        status: { $in: ['PENDING', 'IN_REVIEW'] },
      })
        .sort({ createdAt: 1 })
        .limit(limit);

      return documents.map((doc) => this._toEntity(doc));
    } catch (error) {
      throw new Error(`Error finding pending documents: ${error.message}`);
    }
  }

  /**
   * Contar documentos por estado
   * @param {string|null} userId - ID del usuario (null para todos)
   * @param {string} status - Estado del documento
   * @returns {Promise<number>} Total de documentos
   */
  async countByStatus(userId, status) {
    try {
      const query = { status };

      if (userId) {
        query.userId = userId;
      }

      const count = await DocumentModel.countDocuments(query);

      // RETORNAR NÚMERO, NO OBJETO
      return count;
    } catch (error) {
      console.error('Error counting documents by status:', error);
      throw new Error(`Error counting documents: ${error.message}`);
    }
  }

  /**
   * Contar documentos
   * @param {Object} filter - Filtros opcionales
   * @returns {Promise<number>} Total de documentos
   */
  async count(filter = {}) {
    try {
      const query = {};

      if (filter.userId) {
        query.userId = filter.userId;
      }

      if (filter.status) {
        query.status = filter.status;
      }

      if (filter.type) {
        query['metadata.type'] = filter.type;
      }

      const count = await DocumentModel.countDocuments(query);
      return count;
    } catch (error) {
      console.error('Error counting documents:', error);
      throw new Error(`Error counting documents: ${error.message}`);
    }
  }

  /**
   * Buscar versiones anteriores de un documento
   */
  async findVersionHistory(documentId) {
    try {
      const versions = await DocumentModel.find({
        $or: [{ _id: documentId }, { previousVersionId: documentId }],
      }).sort({ version: -1 });

      return versions.map((doc) => this._toEntity(doc));
    } catch (error) {
      throw new Error(`Error finding version history: ${error.message}`);
    }
  }

  /**
   * Buscar documentos con filtros avanzados
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async findByFilters(filters = {}) {
    try {
      const {
        userId,
        documentType,
        status,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      // Construir query de MongoDB
      const query = {};

      if (userId) {
        query.userId = userId;
      }

      if (documentType) {
        query['metadata.type'] = documentType;
      }

      if (status) {
        query.status = status;
      }

      // Filtro de fechas
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) {
          query.createdAt.$gte = new Date(dateFrom);
        }
        if (dateTo) {
          query.createdAt.$lte = new Date(dateTo);
        }
      }

      // Calcular skip para paginación
      const skip = (page - 1) * limit;

      // Construir sort
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Ejecutar query con paginación
      const [documents, total] = await Promise.all([
        DocumentModel.find(query).sort(sort).skip(skip).limit(limit).lean().exec(),
        DocumentModel.countDocuments(query),
      ]);
      // Convertir a entidades
      const entities = documents.map((doc) => this._toEntity(doc));

      return {
        documents: entities,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error finding documents by filters:', error);
      throw new Error(`Error finding documents: ${error.message}`);
    }
  }
}

module.exports = DocumentRepository;
