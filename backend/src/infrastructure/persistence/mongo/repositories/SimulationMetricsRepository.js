/**
 * SimulationMetrics Repository Implementation
 * Repositorio para métricas de simulaciones en MongoDB
 */

const SimulationMetrics = require('../schemas/SimulationMetrics.schema');

class SimulationMetricsRepository {
  /**
   * Buscar métricas por filtros (NUEVO - para GetUserMetrics)
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} options - Opciones de ordenamiento y paginación
   * @returns {Promise<Array>} Lista de métricas
   */
  async findByFilters(filters = {}, options = {}) {
    try {
      const { sortBy = 'completedAt', sortOrder = 'desc', limit = 50, skip = 0 } = options;

      console.log('🔍 Finding metrics with filters:', filters);
      console.log('🔍 Options:', options);

      const query = SimulationMetrics.find(filters)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const metrics = await query.exec();

      console.log('✅ Metrics found:', metrics.length);

      return metrics;
    } catch (error) {
      console.error('❌ Error finding metrics by filters:', error);
      throw new Error(`Error finding metrics: ${error.message}`);
    }
  }

  /**
   * Obtener métricas agregadas
   * @param {Object} filter - Filtros de búsqueda
   * @returns {Promise<Object>} Métricas agregadas
   */
  async getAggregatedMetrics(filter = {}) {
    try {
      const query = {};

      // Aplicar filtros
      if (filter.userId) {
        query.userId = filter.userId;
      }

      if (filter.scenarioId) {
        query.scenarioId = filter.scenarioId;
      }

      if (filter.completedAfter) {
        query.completedAt = { $gte: filter.completedAfter };
      }

      if (filter.completedBefore) {
        query.completedAt = { ...query.completedAt, $lte: filter.completedBefore };
      }

      // Agregación
      const metrics = await SimulationMetrics.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalSimulations: { $sum: 1 },
            averageScore: { $avg: '$score' },
            averageAccuracy: { $avg: '$accuracy' },
            averageDuration: { $avg: '$duration' },
            totalErrors: {
              $sum: {
                $size: {
                  $ifNull: ['$errors', []],
                },
              },
            },
          },
        },
      ]);

      if (metrics.length === 0) {
        return {
          totalSimulations: 0,
          averageScore: 0,
          averageAccuracy: 0,
          averageDuration: 0,
          totalErrors: 0,
        };
      }

      return metrics[0];
    } catch (error) {
      console.error('Error getting aggregated metrics:', error);
      // Retornar valores por defecto en lugar de lanzar error
      return {
        totalSimulations: 0,
        averageScore: 0,
        averageAccuracy: 0,
        averageDuration: 0,
        totalErrors: 0,
      };
    }
  }

  /**
   * Obtener métricas en un período específico
   * @param {Date} startDate - Fecha inicio
   * @param {Date} endDate - Fecha fin
   * @returns {Promise<Object>} Métricas del período
   */
  async getMetricsInPeriod(startDate, endDate) {
    try {
      const metrics = await SimulationMetrics.aggregate([
        {
          $match: {
            completedAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSimulations: { $sum: 1 },
            averageScore: { $avg: '$score' },
            averageAccuracy: { $avg: '$accuracy' },
            averageDuration: { $avg: '$duration' },
          },
        },
      ]);

      if (metrics.length === 0) {
        return {
          totalSimulations: 0,
          averageScore: 0,
          averageAccuracy: 0,
          averageDuration: 0,
        };
      }

      return metrics[0];
    } catch (error) {
      console.error('Error getting metrics in period:', error);
      throw new Error(`Error getting metrics in period: ${error.message}`);
    }
  }

  /**
   * Crear registro de métrica
   * @param {Object} metricsData - Datos de la métrica
   * @returns {Promise<Object>} Métrica creada
   */
  async create(metricsData) {
    try {
      console.log('💾 Creating metrics in repository...');
      const metrics = new SimulationMetrics(metricsData);
      await metrics.save();
      console.log('✅ Metrics saved with ID:', metrics._id);
      return metrics;
    } catch (error) {
      console.error('❌ Error creating simulation metrics:', error);
      throw new Error(`Error creating simulation metrics: ${error.message}`);
    }
  }

  /**
   * Obtener métricas por usuario
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Métricas del usuario
   */
  async findByUserId(userId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      const metrics = await SimulationMetrics.find({ userId })
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await SimulationMetrics.countDocuments({ userId });

      return {
        metrics,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error finding metrics by user:', error);
      throw new Error(`Error finding metrics by user: ${error.message}`);
    }
  }

  /**
   * Obtener métricas por escenario
   * @param {string} scenarioId - ID del escenario
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Métricas del escenario
   */
  async findByScenarioId(scenarioId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      const metrics = await SimulationMetrics.find({ scenarioId })
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await SimulationMetrics.countDocuments({ scenarioId });

      return {
        metrics,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error finding metrics by scenario:', error);
      throw new Error(`Error finding metrics by scenario: ${error.message}`);
    }
  }

  /**
   * Obtener top performers
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Top usuarios por score
   */
  async getTopPerformers(limit = 10) {
    try {
      const topPerformers = await SimulationMetrics.aggregate([
        {
          $group: {
            _id: '$userId',
            averageScore: { $avg: '$score' },
            totalSimulations: { $sum: 1 },
            averageAccuracy: { $avg: '$accuracy' },
          },
        },
        { $sort: { averageScore: -1 } },
        { $limit: limit },
      ]);

      return topPerformers;
    } catch (error) {
      console.error('Error getting top performers:', error);
      throw new Error(`Error getting top performers: ${error.message}`);
    }
  }

  /**
   * Contar métricas
   * @param {Object} filter - Filtros
   * @returns {Promise<number>} Total de métricas
   */
  async count(filter = {}) {
    try {
      const query = {};

      if (filter.userId) {
        query.userId = filter.userId;
      }

      if (filter.scenarioId) {
        query.scenarioId = filter.scenarioId;
      }

      return await SimulationMetrics.countDocuments(query);
    } catch (error) {
      console.error('Error counting metrics:', error);
      throw new Error(`Error counting metrics: ${error.message}`);
    }
  }

  /**
   * Eliminar métricas antiguas (cleanup)
   * @param {Date} beforeDate - Eliminar métricas anteriores a esta fecha
   * @returns {Promise<number>} Cantidad de métricas eliminadas
   */
  async deleteOldMetrics(beforeDate) {
    try {
      const result = await SimulationMetrics.deleteMany({
        completedAt: { $lt: beforeDate },
      });

      console.log(`🗑️ Deleted ${result.deletedCount} old metrics`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error deleting old metrics:', error);
      throw new Error(`Error deleting old metrics: ${error.message}`);
    }
  }
}

module.exports = SimulationMetricsRepository;
