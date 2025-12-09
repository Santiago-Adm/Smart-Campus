/**
 * GetContextualInfo Use Case
 * Obtiene información contextual del usuario para el chatbot
 */

class GetContextualInfoUseCase {
  constructor({ contextBuilderService }) {
    this.contextBuilderService = contextBuilderService;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} data - Datos de entrada
   * @returns {Promise<Object>} Información contextual
   */
  async execute({ userId, contextType = 'full' }) {
    try {
      console.log(`📊 Getting contextual info for user: ${userId}`);

      let context;

      if (contextType === 'light') {
        context = await this.contextBuilderService.buildLightContext(userId);
      } else {
        context = await this.contextBuilderService.buildUserContext(userId);
      }

      console.log('✅ Contextual info retrieved');

      return {
        success: true,
        context,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('❌ Error getting contextual info:', error);
      throw new Error(`Error getting contextual info: ${error.message}`);
    }
  }
}

module.exports = GetContextualInfoUseCase;
