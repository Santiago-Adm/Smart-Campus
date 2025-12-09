/**
 * UploadDocument Use Case
 * Permite a un usuario subir un documento con su metadata
 */

const Document = require('../../../domain/entities/Document.entity');
const { DocumentType } = require('../../../domain/enums/DocumentType.enum');
const { DocumentStatus } = require('../../../domain/enums/DocumentStatus.enum');

class UploadDocumentUseCase {
  /**
   * @param {Object} dependencies
   * @param {IDocumentRepository} dependencies.documentRepository
   * @param {IFileService} dependencies.fileService
   * @param {EventBus} dependencies.eventBus
   */
  constructor({ documentRepository, fileService, eventBus }) {
    this.documentRepository = documentRepository;
    this.fileService = fileService;
    this.eventBus = eventBus;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} data
   * @param {string} data.userId - ID del usuario que sube el documento
   * @param {Buffer} data.fileBuffer - Buffer del archivo
   * @param {string} data.fileName - Nombre del archivo
   * @param {string} data.mimeType - Tipo MIME del archivo
   * @param {number} data.fileSize - Tamaño del archivo en bytes
   * @param {string} data.documentType - Tipo de documento (DNI, CERTIFICATE, etc.)
   * @param {string} data.description - Descripción opcional
   * @param {Date} data.issueDate - Fecha de emisión del documento
   * @returns {Promise<Document>}
   */
  async execute(data) {
    try {
      // 1. Validar que el tipo de documento sea válido
      if (!Object.values(DocumentType).includes(data.documentType)) {
        throw new Error(`Tipo de documento inválido: ${data.documentType}`);
      }

      // 2. Validar tamaño del archivo (max 50MB)
      const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
      if (data.fileSize > MAX_FILE_SIZE) {
        throw new Error('El archivo supera el tamaño máximo permitido (50MB)');
      }

      // 3. Validar formato del archivo
      const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!ALLOWED_MIME_TYPES.includes(data.mimeType)) {
        throw new Error('Formato de archivo no permitido. Solo PDF, JPG, PNG');
      }

      // 4. Subir archivo al almacenamiento (Azure Blob Storage - MOCK por ahora)
      console.log('📤 Uploading file to storage...');
      const fileUrl = await this.fileService.uploadFile(
        data.fileBuffer,
        data.fileName,
        data.mimeType,
        {
          userId: data.userId,
          documentType: data.documentType,
        }
      );

      console.log('✅ File uploaded successfully:', fileUrl);

      // 5. Crear entidad Document
      const document = new Document({
        userId: data.userId,
        metadata: {
          type: data.documentType,
          fileName: data.fileName,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          issueDate: data.issueDate,
          description: data.description || '',
        },
        fileUrl,
        status: DocumentStatus.PENDING, // Inicia como pendiente
      });

      // 6. Guardar en base de datos
      const savedDocument = await this.documentRepository.create(document);

      console.log('✅ Document saved to database:', savedDocument.id);

      // 7. Publicar evento DOCUMENT_UPLOADED
      this.eventBus.publish('DOCUMENT_UPLOADED', {
        documentId: savedDocument.id,
        userId: data.userId,
        documentType: data.documentType,
        timestamp: new Date(),
      });

      return savedDocument;
    } catch (error) {
      console.error('❌ Error in UploadDocumentUseCase:', error);
      throw error;
    }
  }
}

module.exports = UploadDocumentUseCase;
