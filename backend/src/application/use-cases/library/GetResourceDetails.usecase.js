/**
 * Use Case: Get Resource Details
 * Obtiene los detalles de un recurso e incrementa el contador de vistas
 */

class GetResourceDetailsUseCase {
  constructor({ resourceRepository }) {
    this.resourceRepository = resourceRepository;
  }

  /**
   * Ejecutar obtención de detalles del recurso
   * @param {Object} params
   * @returns {Promise<Resource>}
   */
  async execute({ resourceId, userId, trackView = true }) {
    try {
      // Validar resourceId
      if (!resourceId) {
        throw new Error('Resource ID is required');
      }

      // Buscar recurso
      const resource = await this.resourceRepository.findById(resourceId);

      if (!resource) {
        throw new Error('Resource not found');
      }

      // Verificar si es público o si el usuario es el propietario
      if (!resource.isPublic && resource.uploadedBy !== userId) {
        throw new Error('You do not have permission to view this resource');
      }

      // Incrementar contador de vistas (solo si trackView es true)
      if (trackView) {
        await this.resourceRepository.incrementViewCount(resourceId);
        resource.incrementViewCount(); // Actualizar en memoria
      }

      return resource;
    } catch (error) {
      throw new Error(`Error getting resource details: ${error.message}`);
    }
  }
}

module.exports = GetResourceDetailsUseCase;
