/**
 * ScenarioRepository Implementation
 * Implementa IScenarioRepository usando Mongoose (MongoDB)
 */

const IScenarioRepository = require('../../../../domain/interfaces/repositories/IScenarioRepository');
const Scenario = require('../../../../domain/entities/Scenario.entity');
const ScenarioModel = require('../schemas/Scenario.schema');

class ScenarioRepository extends IScenarioRepository {
  /**
   * Convertir scenario MongoDB a Entity Scenario
   */
  _toEntity(scenarioModel) {
    if (!scenarioModel) return null;

    return new Scenario({
      id: scenarioModel._id.toString(),
      title: scenarioModel.title,
      description: scenarioModel.description,
      category: scenarioModel.category,
      difficulty: scenarioModel.difficulty,
      modelUrl: scenarioModel.modelUrl,
      steps: scenarioModel.steps,
      criteria: scenarioModel.criteria,
      estimatedDuration: scenarioModel.estimatedDuration,
      createdBy: scenarioModel.createdBy,
      isPublic: scenarioModel.isPublic,
      version: scenarioModel.version,
      thumbnailUrl: scenarioModel.thumbnailUrl,
      completionCount: scenarioModel.completionCount,
      averageScore: scenarioModel.averageScore,
      createdAt: scenarioModel.createdAt,
      updatedAt: scenarioModel.updatedAt,
    });
  }

  /**
   * Convertir Entity Scenario a objeto plano
   */
  _toModel(scenario) {
    return {
      title: scenario.title,
      description: scenario.description,
      category: scenario.category,
      difficulty: scenario.difficulty,
      modelUrl: scenario.modelUrl,
      steps: scenario.steps,
      criteria: scenario.criteria,
      estimatedDuration: scenario.estimatedDuration,
      createdBy: scenario.createdBy,
      isPublic: scenario.isPublic,
      version: scenario.version,
      thumbnailUrl: scenario.thumbnailUrl,
      completionCount: scenario.completionCount,
      averageScore: scenario.averageScore,
    };
  }

  /**
   * Crear un nuevo escenario
   */
  async create(scenario) {
    try {
      const scenarioData = this._toModel(scenario);
      const scenarioModel = await ScenarioModel.create(scenarioData);

      return this._toEntity(scenarioModel);
    } catch (error) {
      throw new Error(`Error creating scenario: ${error.message}`);
    }
  }

  /**
   * Buscar escenario por ID
   */
  async findById(id) {
    try {
      const scenarioModel = await ScenarioModel.findById(id);
      return this._toEntity(scenarioModel);
    } catch (error) {
      throw new Error(`Error finding scenario by ID: ${error.message}`);
    }
  }

  /**
   * Buscar escenarios con filtros
   */
  async findMany(filters = {}) {
    try {
      const {
        category,
        difficulty,
        isPublic,
        createdBy,
        search,
        limit = 20,
        offset = 0,
        sortBy = 'createdAt',
      } = filters;

      const query = {};

      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (isPublic !== undefined) query.isPublic = isPublic;
      if (createdBy) query.createdBy = createdBy;

      // Búsqueda de texto completo
      if (search) {
        query.$text = { $search: search };
      }

      const sortOptions = {};
      if (sortBy === 'popular') {
        sortOptions.completionCount = -1;
      } else if (sortBy === 'rating') {
        sortOptions.averageScore = -1;
      } else {
        sortOptions[sortBy] = -1;
      }

      const scenarios = await ScenarioModel.find(query).sort(sortOptions).limit(limit).skip(offset);

      const total = await ScenarioModel.countDocuments(query);

      return {
        scenarios: scenarios.map((s) => this._toEntity(s)),
        total,
      };
    } catch (error) {
      throw new Error(`Error finding scenarios: ${error.message}`);
    }
  }

  /**
   * Actualizar escenario
   */
  async update(id, updates) {
    try {
      const scenarioModel = await ScenarioModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!scenarioModel) {
        throw new Error('Scenario not found');
      }

      return this._toEntity(scenarioModel);
    } catch (error) {
      throw new Error(`Error updating scenario: ${error.message}`);
    }
  }

  /**
   * Eliminar escenario
   */
  async delete(id) {
    try {
      const result = await ScenarioModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new Error(`Error deleting scenario: ${error.message}`);
    }
  }

  /**
   * Buscar escenarios públicos
   */
  async findPublicScenarios(limit = 20) {
    try {
      const scenarios = await ScenarioModel.find({ isPublic: true })
        .sort({ averageScore: -1, completionCount: -1 })
        .limit(limit);

      return scenarios.map((s) => this._toEntity(s));
    } catch (error) {
      throw new Error(`Error finding public scenarios: ${error.message}`);
    }
  }

  /**
   * Buscar escenarios por categoría
   */
  async findByCategory(category, limit = 20) {
    try {
      const scenarios = await ScenarioModel.find({
        category,
        isPublic: true,
      })
        .sort({ averageScore: -1 })
        .limit(limit);

      return scenarios.map((s) => this._toEntity(s));
    } catch (error) {
      throw new Error(`Error finding scenarios by category: ${error.message}`);
    }
  }

  /**
   * Buscar escenarios por creador
   */
  async findByCreator(userId) {
    try {
      const scenarios = await ScenarioModel.find({ createdBy: userId }).sort({
        createdAt: -1,
      });

      return scenarios.map((s) => this._toEntity(s));
    } catch (error) {
      throw new Error(`Error finding scenarios by creator: ${error.message}`);
    }
  }

  /**
   * Registrar completación de escenario
   */
  async recordCompletion(id, score) {
    try {
      const scenario = await ScenarioModel.findById(id);
      if (!scenario) {
        throw new Error('Scenario not found');
      }

      const totalScore = scenario.averageScore * scenario.completionCount + score;
      scenario.completionCount += 1;
      scenario.averageScore = totalScore / scenario.completionCount;

      await scenario.save();
    } catch (error) {
      throw new Error(`Error recording completion: ${error.message}`);
    }
  }

  /**
   * Contar escenarios públicos
   * @returns {Promise<number>} Total de escenarios públicos
   */
  async countPublicScenarios() {
    try {
      return await ScenarioModel.countDocuments({ isPublic: true });
    } catch (error) {
      console.error('Error counting public scenarios:', error);
      throw new Error(`Error counting public scenarios: ${error.message}`);
    }
  }
}

module.exports = ScenarioRepository;
