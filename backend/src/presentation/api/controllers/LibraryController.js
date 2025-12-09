/**
 * LibraryController
 * Maneja todas las operaciones relacionadas con la biblioteca virtual
 */

const ResourceMapper = require('../../../application/mappers/ResourceMapper');

class LibraryController {
  constructor({
    searchResourcesUseCase,
    getResourceDetailsUseCase,
    recommendResourcesUseCase,
    trackResourceUsageUseCase,
    uploadResourceUseCase,
    resourceRepository,
  }) {
    this.searchResourcesUseCase = searchResourcesUseCase;
    this.getResourceDetailsUseCase = getResourceDetailsUseCase;
    this.recommendResourcesUseCase = recommendResourcesUseCase;
    this.trackResourceUsageUseCase = trackResourceUsageUseCase;
    this.uploadResourceUseCase = uploadResourceUseCase;
    this.resourceRepository = resourceRepository;
  }

  /**
   * GET /api/library/resources
   * Buscar recursos con filtros
   */
  // eslint-disable-next-line consistent-return
  async searchResources(req, res, next) {
    try {
      const {
        search,
        category,
        type,
        tags,
        language,
        isPublic,
        minRating,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      // Ejecutar búsqueda
      const result = await this.searchResourcesUseCase.execute({
        search,
        category,
        type,
        tags: tags ? tags.split(',') : [],
        language,
        isPublic: isPublic !== undefined ? isPublic === 'true' || isPublic === true : true,
        minRating: minRating ? parseFloat(minRating) : null,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
      });

      // ✅ AGREGAR LOGS
      console.log('📥 Received isPublic:', isPublic, typeof isPublic);

      // Convertir a DTOs (versión resumida para listados)
      const resourcesDto = ResourceMapper.toSummaryDtoList(result.resources);

      const finalResponse = {
        success: true,
        message: 'Resources retrieved successfully',
        data: resourcesDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      // ✅ LOG TEMPORAL
      console.log('📦 Final response structure:', {
        success: finalResponse.success,
        dataType: Array.isArray(finalResponse.data) ? 'array' : typeof finalResponse.data,
        dataLength: finalResponse.data?.length,
        pagination: finalResponse.pagination,
      });

      return res.status(200).json(finalResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/library/resources/:id
   * Obtener detalles de un recurso
   */
  // eslint-disable-next-line consistent-return
  async getResourceDetails(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;

      // Obtener recurso
      const resource = await this.getResourceDetailsUseCase.execute({
        resourceId: id,
        userId,
        trackView: true, // Incrementar contador de vistas
      });

      // Convertir a DTO (versión completa)
      const resourceDto = ResourceMapper.toFullDto(resource);

      return res.status(200).json({
        success: true,
        message: 'Resource details retrieved successfully',
        data: resourceDto,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/library/resources/upload
   * Subir un nuevo recurso
   */
  // eslint-disable-next-line consistent-return
  async uploadResource(req, res, next) {
    try {
      // Validar que existe el archivo
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided',
        });
      }

      const { userId } = req.user;
      const {
        title,
        description,
        category,
        type,
        author,
        publisher,
        publicationDate,
        tags,
        language,
        pageCount,
        duration,
        isPublic,
      } = req.body;

      // ✅ LOG: Recibir datos
      console.log('📥 ========================================');
      console.log('📥 STEP 1: Request received');
      console.log('📥 req.body.isPublic:', isPublic, typeof isPublic);
      console.log('📥 req.body:', req.body);

      // Datos del archivo
      const { buffer, originalname, mimetype, size } = req.file;

      // ✅ PROCESAR isPublic correctamente
      const processedIsPublic = (() => {
        if (isPublic === undefined || isPublic === null) {
          console.log('📥 isPublic is undefined/null, defaulting to true');
          return true;
        }

        if (typeof isPublic === 'boolean') {
          console.log('📥 isPublic is boolean:', isPublic);
          return isPublic;
        }

        if (typeof isPublic === 'string') {
          const result = isPublic.toLowerCase() === 'true';
          console.log('📥 isPublic is string:', isPublic, '→', result);
          return result;
        }

        if (typeof isPublic === 'number') {
          const result = isPublic === 1;
          console.log('📥 isPublic is number:', isPublic, '→', result);
          return result;
        }

        console.log('📥 isPublic unknown type, defaulting to true');
        return true;
      })();

      console.log('📥 STEP 2: Processed isPublic:', processedIsPublic, typeof processedIsPublic);

      // Ejecutar use case
      const resource = await this.uploadResourceUseCase.execute({
        userId,
        fileBuffer: buffer,
        fileName: originalname,
        mimeType: mimetype,
        fileSize: size,
        title,
        description,
        category,
        type,
        author,
        publisher,
        publicationDate: publicationDate ? new Date(publicationDate) : null,
        // eslint-disable-next-line no-nested-ternary
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
        language: language || 'es',
        pageCount: pageCount ? parseInt(pageCount, 10) : null,
        duration: duration ? parseInt(duration, 10) : null,
        isPublic: processedIsPublic, // ✅ Usar el valor procesado
      });

      console.log('📥 STEP 3: Resource created');
      console.log('📥 resource.isPublic:', resource.isPublic, typeof resource.isPublic);
      console.log('📥 resource.id:', resource.id);
      console.log('📥 ========================================');

      // Convertir a DTO
      const resourceDto = ResourceMapper.toFullDto(resource);

      return res.status(201).json({
        success: true,
        message: 'Resource uploaded successfully',
        data: resourceDto,
      });
    } catch (error) {
      console.error('❌ Error uploading resource:', error);
      next(error);
    }
  }

  /**
   * GET /api/library/recommendations
   * Obtener recomendaciones personalizadas
   */
  // eslint-disable-next-line consistent-return
  async getRecommendations(req, res, next) {
    try {
      const { userId } = req.user;
      const { limit = 10, strategy = 'popular' } = req.query;

      // Ejecutar use case
      const result = await this.recommendResourcesUseCase.execute({
        userId,
        limit: parseInt(limit, 10),
        strategy,
      });

      // Convertir a DTOs
      const recommendationsDto = ResourceMapper.toSummaryDtoList(result.recommendations);

      return res.status(200).json({
        success: true,
        message: 'Recommendations generated successfully',
        data: {
          recommendations: recommendationsDto,
          strategy: result.strategy,
          generatedAt: result.generatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/library/resources/:id/track
   * Registrar interacción con un recurso
   */
  // eslint-disable-next-line consistent-return
  async trackUsage(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const { action, rating } = req.body;

      // Ejecutar use case
      const result = await this.trackResourceUsageUseCase.execute({
        resourceId: id,
        userId,
        action,
        data: { rating },
      });

      return res.status(200).json({
        success: true,
        message: `${action} tracked successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/library/popular
   * Obtener recursos más populares
   */
  // eslint-disable-next-line consistent-return
  async getMostPopular(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      // Obtener recursos populares
      const resources = await this.resourceRepository.findMostPopular(parseInt(limit, 10));

      // Convertir a DTOs
      const resourcesDto = ResourceMapper.toSummaryDtoList(resources);

      return res.status(200).json({
        success: true,
        message: 'Most popular resources retrieved successfully',
        data: resourcesDto,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/library/resources/:id
   * Eliminar un recurso
   */
  // eslint-disable-next-line consistent-return
  async deleteResource(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user.userId;
      const userRoles = req.user.roles;

      // Buscar recurso
      const resource = await this.resourceRepository.findById(id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      // Verificar permisos (solo el creador o ADMIN)
      const isOwner = resource.uploadedBy === userId;
      const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('IT_ADMIN');

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this resource',
        });
      }

      // Eliminar recurso
      await this.resourceRepository.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Resource deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LibraryController;
