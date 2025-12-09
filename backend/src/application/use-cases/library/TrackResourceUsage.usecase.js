/**
 * Use Case: Track Resource Usage
 * Registra el uso de recursos (descargas, ratings, etc.)
 */

class TrackResourceUsageUseCase {
  constructor({ resourceRepository }) {
    this.resourceRepository = resourceRepository;
  }

  /**
   * Ejecutar registro de uso
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async execute({ resourceId, userId, action, data = {} }) {
    try {
      // Validar parámetros
      this._validateParams({ resourceId, userId, action });

      // Buscar recurso
      const resource = await this.resourceRepository.findById(resourceId);

      if (!resource) {
        throw new Error('Resource not found');
      }

      // Procesar según el tipo de acción
      let result = {};

      switch (action) {
        case 'download':
          result = await this._trackDownload(resourceId);
          break;

        case 'rate':
          result = await this._trackRating(resourceId, data.rating);
          break;

        case 'view':
          result = await this._trackView(resourceId);
          break;

        default:
          throw new Error('Invalid action type');
      }

      return {
        success: true,
        resourceId,
        userId,
        action,
        timestamp: new Date(),
        ...result,
      };
    } catch (error) {
      throw new Error(`Error tracking resource usage: ${error.message}`);
    }
  }

  /**
   * Registrar descarga
   */
  async _trackDownload(resourceId) {
    await this.resourceRepository.incrementDownloadCount(resourceId);
    return { message: 'Download tracked successfully' };
  }

  /**
   * Registrar calificación
   */
  async _trackRating(resourceId, rating) {
    // Validar rating
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Buscar recurso para actualizar
    const resource = await this.resourceRepository.findById(resourceId);
    resource.addRating(rating);

    // Actualizar en la base de datos
    await this.resourceRepository.update(resourceId, {
      averageRating: resource.averageRating,
      ratingCount: resource.ratingCount,
    });

    return {
      message: 'Rating added successfully',
      newAverageRating: resource.averageRating,
      totalRatings: resource.ratingCount,
    };
  }

  /**
   * Registrar vista
   */
  async _trackView(resourceId) {
    await this.resourceRepository.incrementViewCount(resourceId);
    return { message: 'View tracked successfully' };
  }

  /**
   * Validar parámetros
   */
  _validateParams({ resourceId, userId, action }) {
    if (!resourceId) {
      throw new Error('Resource ID is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    const validActions = ['download', 'rate', 'view'];
    if (!validActions.includes(action)) {
      throw new Error(`Invalid action. Must be one of: ${validActions.join(', ')}`);
    }
  }
}

module.exports = TrackResourceUsageUseCase;
