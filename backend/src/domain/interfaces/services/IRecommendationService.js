/**
 * Interface: IRecommendationService
 * Contrato para servicios de recomendaciones con IA
 */

class IRecommendationService {
  /**
   * Obtener recursos recomendados para un usuario
   * @param {string} _userId
   * @param {number} _limit
   * @returns {Promise<string[]>} - Array de resourceIds
   */
  async getResourceRecommendations(_userId, _limit) {
    throw new Error('Method getResourceRecommendations() must be implemented');
  }

  /**
   * Registrar interacción de usuario con recurso
   * @param {string} _userId
   * @param {string} _resourceId
   * @param {string} _interactionType - 'view', 'download', 'rating'
   * @param {Object} _metadata
   * @returns {Promise<void>}
   */
  async recordInteraction(_userId, _resourceId, _interactionType, _metadata) {
    throw new Error('Method recordInteraction() must be implemented');
  }

  /**
   * Entrenar modelo de recomendaciones
   * @returns {Promise<void>}
   */
  async trainModel() {
    throw new Error('Method trainModel() must be implemented');
  }
}

module.exports = IRecommendationService;
