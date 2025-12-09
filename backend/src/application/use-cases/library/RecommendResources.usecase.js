/**
 * Use Case: Recommend Resources
 * Genera recomendaciones personalizadas de recursos para el usuario
 */

class RecommendResourcesUseCase {
  constructor({ resourceRepository }) {
    this.resourceRepository = resourceRepository;
  }

  /**
   * Ejecutar generación de recomendaciones
   * @param {Object} params
   * @returns {Promise<Array>}
   */
  async execute({ userId, limit = 10, strategy = 'popular' }) {
    try {
      // Validar parámetros
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (limit < 1 || limit > 50) {
        throw new Error('Limit must be between 1 and 50');
      }

      let recommendedResources = [];

      switch (strategy) {
        case 'popular':
          // Estrategia 1: Recursos más populares
          recommendedResources = await this._getPopularResources(limit);
          break;

        case 'rating':
          // Estrategia 2: Mejor calificados
          recommendedResources = await this._getTopRatedResources(limit);
          break;

        case 'personalized':
          // Estrategia 3: Personalizadas (usa historial del usuario)
          recommendedResources = await this._getPersonalizedResources(userId, limit);
          break;

        default:
          throw new Error('Invalid recommendation strategy');
      }

      return {
        recommendations: recommendedResources,
        strategy,
        userId,
        generatedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Error generating recommendations: ${error.message}`);
    }
  }

  /**
   * Obtener recursos más populares
   */
  async _getPopularResources(limit) {
    return this.resourceRepository.findMostPopular(limit);
  }

  /**
   * Obtener recursos mejor calificados
   */
  async _getTopRatedResources(limit) {
    const result = await this.resourceRepository.findMany({
      isPublic: true,
      limit,
      sortBy: 'rating',
      sortOrder: 'desc',
    });
    return result.resources;
  }

  /**
   * Obtener recursos personalizados
   * (En el futuro se implementará con ML)
   */
  async _getPersonalizedResources(userId, limit) {
    // Por ahora retornamos los recomendados genéricos
    // TODO: Implementar lógica de ML con scikit-learn
    return this.resourceRepository.findRecommendedForUser(userId, limit);
  }
}

module.exports = RecommendResourcesUseCase;
