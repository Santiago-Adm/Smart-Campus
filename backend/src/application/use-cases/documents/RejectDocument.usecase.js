/**
 * RejectDocument Use Case
 * Rechaza un documento con motivo (acción de administrativo)
 */

const { DocumentStatus } = require('../../../domain/enums/DocumentStatus.enum');

class RejectDocumentUseCase {
  /**
   * @param {Object} dependencies
   * @param {IDocumentRepository} dependencies.documentRepository
   * @param {INotificationService} dependencies.notificationService
   * @param {EventBus} dependencies.eventBus
   */
  constructor({ documentRepository, notificationService, eventBus }) {
    this.documentRepository = documentRepository;
    this.notificationService = notificationService;
    this.eventBus = eventBus;
  }

  /**
   * Rechazar documento
   * @param {Object} data
   * @param {string} data.documentId - ID del documento
   * @param {string} data.rejectedBy - ID del administrativo que rechaza
   * @param {string} data.reason - Motivo del rechazo (REQUERIDO)
   * @returns {Promise<Document>}
   */
  async execute(data) {
    try {
      // 1. Validar datos requeridos
      if (!data.documentId) {
        throw new Error('documentId es requerido');
      }

      if (!data.rejectedBy) {
        throw new Error('rejectedBy es requerido');
      }

      if (!data.reason || data.reason.trim().length === 0) {
        throw new Error('reason es requerido al rechazar un documento');
      }

      // 2. Obtener documento
      const document = await this.documentRepository.findById(data.documentId);

      if (!document) {
        throw new Error('Documento no encontrado');
      }

      // 3. Verificar que el documento no esté ya rechazado
      if (document.status === DocumentStatus.REJECTED) {
        throw new Error('El documento ya está rechazado');
      }

      // 4. Verificar que el documento no esté aprobado
      if (document.status === DocumentStatus.APPROVED) {
        throw new Error('No se puede rechazar un documento aprobado');
      }

      // 5. Rechazar documento
      document.reject(data.reason);
      document.reviewedBy = data.rejectedBy;
      document.reviewedAt = new Date();

      console.log('❌ Rejecting document:', document.id);
      console.log('📝 Reason:', data.reason);

      // 6. Guardar cambios
      const updatedDocument = await this.documentRepository.update(document);

      // 7. Enviar notificación al usuario
      await this.notificationService.sendDocumentStatusEmail(document.userId, {
        documentType: document.metadata.type,
        status: DocumentStatus.REJECTED,
        reason: data.reason,
      });

      console.log('📧 Rejection notification sent to user:', document.userId);

      // 8. Publicar evento
      this.eventBus.publish('DOCUMENT_REJECTED', {
        documentId: document.id,
        userId: document.userId,
        rejectedBy: data.rejectedBy,
        reason: data.reason,
        timestamp: new Date(),
      });

      return updatedDocument;
    } catch (error) {
      console.error('❌ Error in RejectDocumentUseCase:', error);
      throw error;
    }
  }
}

module.exports = RejectDocumentUseCase;
