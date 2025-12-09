/**
 * ValidateDocument Use Case
 * Valida un documento usando OCR (Google Vision API)
 * y actualiza su estado
 */

const { DocumentStatus } = require('../../../domain/enums/DocumentStatus.enum');

class ValidateDocumentUseCase {
  /**
   * @param {Object} dependencies
   * @param {IDocumentRepository} dependencies.documentRepository
   * @param {IOCRService} dependencies.ocrService
   * @param {EventBus} dependencies.eventBus
   */
  constructor({ documentRepository, ocrService, eventBus }) {
    this.documentRepository = documentRepository;
    this.ocrService = ocrService;
    this.eventBus = eventBus;
  }

  /**
   * Ejecutar validación automática del documento
   * @param {Object} data
   * @param {string} data.documentId - ID del documento a validar
   * @returns {Promise<Object>}
   */
  async execute(data) {
    try {
      // 1. Obtener documento de la base de datos
      const document = await this.documentRepository.findById(data.documentId);

      if (!document) {
        throw new Error('Documento no encontrado');
      }

      // 2. Verificar que el documento esté en estado PENDING
      if (document.status !== DocumentStatus.PENDING) {
        throw new Error(
          `El documento no está en estado pendiente. Estado actual: ${document.status}`
        );
      }

      // 3. Mover documento a estado IN_REVIEW
      document.moveToReview();
      await this.documentRepository.update(document);

      console.log('📄 Document moved to IN_REVIEW:', document.id);

      // 4. Extraer texto del documento con OCR
      console.log('🔍 Extracting text from document with OCR...');
      const ocrResult = await this.ocrService.extractText(document.fileUrl);

      console.log('✅ OCR extraction completed. Confidence:', ocrResult.confidence);

      // 5. Validar datos extraídos
      const validationResult = this._validateExtractedData(ocrResult, document);

      // 6. Actualizar documento con resultados de OCR
      document.ocrData = {
        extractedText: ocrResult.text,
        confidence: ocrResult.confidence,
        extractedFields: ocrResult.fields,
        validatedAt: new Date(),
      };

      // 7. Determinar si se aprueba automáticamente o requiere revisión manual
      if (validationResult.autoApprove) {
        document.approve('Aprobado automáticamente por OCR');
        console.log('✅ Document auto-approved');
      } else {
        document.status = DocumentStatus.IN_REVIEW;
        document.reviewNotes = validationResult.reason;
        console.log('⚠️ Document requires manual review:', validationResult.reason);
      }

      // 8. Guardar cambios
      const updatedDocument = await this.documentRepository.update(document);

      // 9. Publicar evento
      this.eventBus.publish('DOCUMENT_VALIDATED', {
        documentId: document.id,
        status: document.status,
        autoApproved: validationResult.autoApprove,
        confidence: ocrResult.confidence,
        timestamp: new Date(),
      });

      return {
        document: updatedDocument,
        ocrResult,
        validationResult,
      };
    } catch (error) {
      console.error('❌ Error in ValidateDocumentUseCase:', error);
      throw error;
    }
  }

  /**
   * Validar datos extraídos del OCR
   * @private
   */
  _validateExtractedData(ocrResult, document) {
    // Criterios para aprobación automática:
    // 1. Confidence score > 85%
    // 2. Campos clave detectados
    // 3. Formato válido

    if (ocrResult.confidence < 0.85) {
      return {
        autoApprove: false,
        reason: `Confianza del OCR baja: ${(ocrResult.confidence * 100).toFixed(1)}%`,
      };
    }

    // Validar campos según tipo de documento
    const requiredFields = this._getRequiredFieldsByType(document.metadata.type);
    const missingFields = requiredFields.filter(
      (field) => !ocrResult.fields || !ocrResult.fields[field]
    );

    if (missingFields.length > 0) {
      return {
        autoApprove: false,
        reason: `Campos faltantes: ${missingFields.join(', ')}`,
      };
    }

    // Si pasa todas las validaciones
    return {
      autoApprove: true,
      reason: 'Documento validado automáticamente',
    };
  }

  /**
   * Obtener campos requeridos según tipo de documento
   * @private
   */
  _getRequiredFieldsByType(documentType) {
    const fieldMap = {
      DNI: ['nombres', 'apellidos', 'dni', 'fecha_nacimiento'],
      CERTIFICATE: ['nombres', 'institucion', 'fecha_emision'],
      MEDICAL_CERTIFICATE: ['nombres', 'diagnostico', 'fecha_emision'],
      RESIDENCE_PROOF: ['nombres', 'direccion'],
    };

    return fieldMap[documentType] || [];
  }
}

module.exports = ValidateDocumentUseCase;
