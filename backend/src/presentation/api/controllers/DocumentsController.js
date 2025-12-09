/**
 * DocumentsController
 * Maneja todas las operaciones relacionadas con documentos
 */

class DocumentsController {
  constructor({
    uploadDocumentUseCase,
    validateDocumentUseCase,
    searchDocumentsUseCase,
    approveDocumentUseCase,
    rejectDocumentUseCase,
    documentRepository,
  }) {
    this.uploadDocumentUseCase = uploadDocumentUseCase;
    this.validateDocumentUseCase = validateDocumentUseCase;
    this.searchDocumentsUseCase = searchDocumentsUseCase;
    this.approveDocumentUseCase = approveDocumentUseCase;
    this.rejectDocumentUseCase = rejectDocumentUseCase;
    this.documentRepository = documentRepository;
  }

  /**
   * POST /api/documents/upload
   * Sube un nuevo documento
   * - ESTUDIANTES: Pueden subir sus propios documentos
   * - ADMINISTRATIVE: Puede subir documentos POR estudiantes/docentes
   * - IT_ADMIN: Puede subir documentos por cualquier usuario
   */
  // eslint-disable-next-line consistent-return
  async uploadDocument(req, res, next) {
    try {
      const userRoles = req.user.roles;
      const currentUserId = req.user.userId;

      // ✅ Validar roles permitidos
      const canUpload =
        userRoles.includes('STUDENT') ||
        userRoles.includes('ADMINISTRATIVE') ||
        userRoles.includes('IT_ADMIN');

      if (!canUpload) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para subir documentos',
        });
      }

      // 📝 DEBUG
      console.log('========== DEBUG UPLOAD ==========');
      console.log('User roles:', userRoles);
      console.log('Current userId:', currentUserId);
      console.log('req.file:', req.file);
      console.log('req.body:', req.body);
      console.log('==================================');

      // Validar que existe el archivo
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo',
        });
      }

      // Extraer datos del request
      const { documentType, description, issueDate, targetUserId } = req.body;

      // ✅ Determinar a quién pertenece el documento
      let finalUserId;

      if (userRoles.includes('STUDENT')) {
        // Estudiantes SOLO pueden subir para ellos mismos
        finalUserId = currentUserId;

        console.log('📝 Student uploading for self:', finalUserId);
      } else if (userRoles.includes('ADMINISTRATIVE')) {
        // Administrative puede subir para otros usuarios o para sí mismo
        if (targetUserId && targetUserId !== '' && targetUserId !== 'self') {
          finalUserId = targetUserId;
          console.log('📝 Administrative uploading for user:', finalUserId);
        } else {
          finalUserId = currentUserId;
          console.log('📝 Administrative uploading for self:', finalUserId);
        }
      } else if (userRoles.includes('IT_ADMIN')) {
        // IT_ADMIN puede subir para cualquier usuario o para sí mismo
        if (targetUserId && targetUserId !== '' && targetUserId !== 'self') {
          finalUserId = targetUserId;
          console.log('📝 IT_ADMIN uploading for user:', finalUserId);
        } else {
          finalUserId = currentUserId;
          console.log('📝 IT_ADMIN uploading for self:', finalUserId);
        }
      }

      // Validar que finalUserId existe
      if (!finalUserId) {
        return res.status(400).json({
          success: false,
          message: 'No se pudo determinar el usuario destino',
        });
      }

      // Datos del archivo (multer)
      const { buffer, originalname, mimetype, size } = req.file;

      // Ejecutar use case
      const result = await this.uploadDocumentUseCase.execute({
        userId: finalUserId,
        fileBuffer: buffer,
        fileName: originalname,
        mimeType: mimetype,
        fileSize: size,
        documentType,
        description,
        issueDate: issueDate ? new Date(issueDate) : null,
      });

      return res.status(201).json({
        success: true,
        message: 'Documento subido exitosamente',
        data: result,
      });
    } catch (error) {
      console.error('❌ Error in uploadDocument:', error);
      next(error);
    }
  }

  /**
   * GET /api/documents
   * Obtiene lista de documentos con filtros
   * Filtrado por rol:
   * - STUDENT/TEACHER: Solo sus documentos
   * - ADMINISTRATIVE/IT_ADMIN: Todos los documentos
   * - DIRECTOR: Todos (solo lectura)
   */
  // eslint-disable-next-line consistent-return
  async getDocuments(req, res, next) {
    try {
      // Extraer query params
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
      } = req.query;

      // ✅ DETERMINAR USERID SEGÚN ROL
      let finalUserId = null;

      if (req.user.roles.includes('STUDENT') || req.user.roles.includes('TEACHER')) {
        // Estudiantes y Docentes solo ven SUS propios documentos
        finalUserId = req.user.userId;
      } else if (
        req.user.roles.includes('ADMINISTRATIVE') ||
        req.user.roles.includes('IT_ADMIN') ||
        req.user.roles.includes('DIRECTOR')
      ) {
        // Administrativos, IT_ADMIN y Director ven TODOS los documentos
        finalUserId = userId || null; // Pueden filtrar por userId si quieren
      }

      console.log('📄 Getting documents for userId:', finalUserId);
      console.log('📄 User roles:', req.user.roles);

      // Ejecutar use case
      const result = await this.searchDocumentsUseCase.execute({
        userId: finalUserId,
        documentType,
        status,
        dateFrom: dateFrom ? new Date(dateFrom) : null,
        dateTo: dateTo ? new Date(dateTo) : null,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
      });

      return res.status(200).json({
        success: true,
        message: 'Documentos obtenidos exitosamente',
        data: result.documents,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/documents/:id
   * Obtiene un documento por ID
   */
  // eslint-disable-next-line consistent-return
  async getDocumentById(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const userRoles = req.user.roles;

      // Buscar documento
      const document = await this.documentRepository.findById(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado',
        });
      }

      // Verificar permisos: solo el dueño o admin/staff pueden ver
      const isOwner = document.userId === userId;
      const isAdmin =
        userRoles.includes('ADMINISTRATIVE') ||
        userRoles.includes('IT_ADMIN') ||
        userRoles.includes('DIRECTOR');

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este documento',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Documento obtenido exitosamente',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/documents/:id/validate
   * Valida un documento con OCR
   * Solo ADMINISTRATIVE y IT_ADMIN
   */
  // eslint-disable-next-line consistent-return
  async validateDocument(req, res, next) {
    try {
      const { id } = req.params;

      // Ejecutar use case
      const result = await this.validateDocumentUseCase.execute({
        documentId: id,
      });

      return res.status(200).json({
        success: true,
        message: 'Documento validado exitosamente',
        data: {
          document: result.document,
          validationResult: result.validationResult,
          ocrResult: result.ocrResult,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/documents/:id/approve
   * Aprueba un documento
   * Solo ADMINISTRATIVE y IT_ADMIN
   */
  // eslint-disable-next-line consistent-return
  async approveDocument(req, res, next) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const approvedBy = req.user.userId;

      // Ejecutar use case
      const result = await this.approveDocumentUseCase.execute({
        documentId: id,
        approvedBy,
        notes,
      });

      return res.status(200).json({
        success: true,
        message: 'Documento aprobado exitosamente',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/documents/:id/reject
   * Rechaza un documento
   * Solo ADMINISTRATIVE y IT_ADMIN
   */
  // eslint-disable-next-line consistent-return
  async rejectDocument(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const rejectedBy = req.user.userId;

      // Validar que se proporcione una razón
      if (!reason || reason.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar una razón para el rechazo',
        });
      }

      // Ejecutar use case
      const result = await this.rejectDocumentUseCase.execute({
        documentId: id,
        rejectedBy,
        reason,
      });

      return res.status(200).json({
        success: true,
        message: 'Documento rechazado',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/documents/:id
   * Elimina un documento (soft delete)
   * Solo el dueño o IT_ADMIN
   */
  // eslint-disable-next-line consistent-return
  async deleteDocument(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const userRoles = req.user.roles;

      // Buscar documento
      const document = await this.documentRepository.findById(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado',
        });
      }

      // Verificar permisos
      const isOwner = document.userId === userId;
      const isAdmin = userRoles.includes('IT_ADMIN');

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar este documento',
        });
      }

      // Eliminar documento
      await this.documentRepository.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Documento eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DocumentsController;
