/**
 * ApproveDocument Use Case
 * Aprueba un documento (acción de administrativo)
 */

const { DocumentStatus } = require('../../../domain/enums/DocumentStatus.enum');

class ApproveDocumentUseCase {
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
   * Aprobar documento
   * @param {Object} data
   * @param {string} data.documentId - ID del documento
   * @param {string} data.approvedBy - ID del administrativo que aprueba
   * @param {string} data.notes - Notas opcionales
   * @returns {Promise<Document>}
   */
  async execute(data) {
    try {
      // 1. Validar datos requeridos
      if (!data.documentId) {
        throw new Error('documentId es requerido');
      }

      if (!data.approvedBy) {
        throw new Error('approvedBy es requerido');
      }

      // 2. Obtener documento
      const document = await this.documentRepository.findById(data.documentId);

      if (!document) {
        throw new Error('Documento no encontrado');
      }

      // 3. Verificar que el documento no esté ya aprobado
      if (document.status === DocumentStatus.APPROVED) {
        throw new Error('El documento ya está aprobado');
      }

      // 4. Verificar que el documento no esté rechazado
      if (document.status === DocumentStatus.REJECTED) {
        throw new Error('No se puede aprobar un documento rechazado');
      }

      // 5. Aprobar documento
      document.approve(data.notes || 'Aprobado por administrativo');
      document.reviewedBy = data.approvedBy;
      document.reviewedAt = new Date();

      console.log('✅ Approving document:', document.id);

      // 6. Guardar cambios
      const updatedDocument = await this.documentRepository.update(document);

      // 7. Enviar notificación al usuario
      await this.notificationService.sendDocumentStatusEmail(document.userId, {
        documentType: document.metadata.type,
        status: DocumentStatus.APPROVED,
        notes: data.notes,
      });

      console.log('📧 Notification sent to user:', document.userId);

      // 8. Publicar evento
      this.eventBus.publish('DOCUMENT_APPROVED', {
        documentId: document.id,
        userId: document.userId,
        approvedBy: data.approvedBy,
        timestamp: new Date(),
      });

      return updatedDocument;
    } catch (error) {
      console.error('❌ Error in ApproveDocumentUseCase:', error);
      throw error;
    }
  }
}

module.exports = ApproveDocumentUseCase;
