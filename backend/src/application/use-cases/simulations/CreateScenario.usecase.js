/**
 * Use Case: Create Scenario
 * Crear un nuevo escenario de simulación AR (solo TEACHER/ADMIN)
 */

const Scenario = require('../../../domain/entities/Scenario.entity');

class CreateScenarioUseCase {
  constructor({ scenarioRepository, fileService }) {
    this.scenarioRepository = scenarioRepository;
    this.fileService = fileService;
  }

  /**
   * Ejecutar creación de escenario
   * @param {Object} params
   * @returns {Promise<Scenario>}
   */
  async execute({
    userId,
    title,
    description,
    category,
    difficulty,
    modelFile = null, // Archivo del modelo 3D
    modelFileName = null,
    modelMimeType = null,
    steps = [],
    criteria = [],
    estimatedDuration = 15,
    thumbnailFile = null,
    thumbnailFileName = null,
    thumbnailMimeType = null,
    isPublic = false,
  }) {
    try {
      // Validar datos obligatorios
      this._validateRequiredFields({
        userId,
        title,
        category,
        difficulty,
        steps,
      });

      // Subir modelo 3D (MOCK)
      let modelUrl = 'https://smartcampus.blob.core.windows.net/models/mock-model.gltf';
      if (modelFile) {
        modelUrl = await this.fileService.uploadFile(modelFile, modelFileName, modelMimeType, {
          folder: 'ar-models',
        });
      }

      // Subir thumbnail si existe
      let thumbnailUrl = null;
      if (thumbnailFile) {
        thumbnailUrl = await this.fileService.uploadFile(
          thumbnailFile,
          thumbnailFileName,
          thumbnailMimeType,
          { folder: 'scenario-thumbnails' }
        );
      }

      // Crear entidad Scenario
      const scenario = new Scenario({
        title,
        description,
        category,
        difficulty,
        modelUrl,
        steps,
        criteria,
        estimatedDuration,
        createdBy: userId,
        isPublic,
        thumbnailUrl,
      });

      // Guardar en repositorio
      const savedScenario = await this.scenarioRepository.create(scenario);

      return savedScenario;
    } catch (error) {
      throw new Error(`Error creating scenario: ${error.message}`);
    }
  }

  /**
   * Validar campos requeridos
   */
  _validateRequiredFields({ userId, title, category, difficulty, steps }) {
    if (!userId) throw new Error('User ID is required');
    if (!title) throw new Error('Title is required');
    if (!category) throw new Error('Category is required');
    if (!difficulty) throw new Error('Difficulty is required');
    if (!Array.isArray(steps) || steps.length === 0) {
      throw new Error('At least one step is required');
    }

    // Validar que cada step tenga title y description
    steps.forEach((step, index) => {
      if (!step.title || !step.description) {
        throw new Error(`Step ${index + 1} must have title and description`);
      }
    });
  }
}

module.exports = CreateScenarioUseCase;
