/**
 * SimulationsController
 * Maneja todas las operaciones relacionadas con simulaciones AR + IoT
 */

const ScenarioMapper = require('../../../application/mappers/ScenarioMapper');

class SimulationsController {
  constructor({
    getScenariosUseCase,
    createScenarioUseCase,
    executeSimulationUseCase,
    recordMetricsUseCase,
    getUserMetricsUseCase,
    connectIoTDeviceUseCase,
    scenarioRepository,
  }) {
    this.getScenariosUseCase = getScenariosUseCase;
    this.createScenarioUseCase = createScenarioUseCase;
    this.executeSimulationUseCase = executeSimulationUseCase;
    this.recordMetricsUseCase = recordMetricsUseCase;
    this.getUserMetricsUseCase = getUserMetricsUseCase;
    this.connectIoTDeviceUseCase = connectIoTDeviceUseCase;
    this.scenarioRepository = scenarioRepository;
  }

  /**
   * GET /api/simulations/scenarios
   * Obtener escenarios con filtros
   */
  // eslint-disable-next-line consistent-return
  async getScenarios(req, res, next) {
    try {
      const {
        category,
        difficulty,
        isPublic,
        createdBy,
        search,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
      } = req.query;

      // Ejecutar búsqueda
      const result = await this.getScenariosUseCase.execute({
        category,
        difficulty,
        isPublic: isPublic !== undefined ? isPublic === 'true' : null,
        createdBy,
        search,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
      });

      // Convertir a DTOs (versión resumida para listados)
      const scenariosDto = ScenarioMapper.toSummaryDtoList(result.scenarios);

      return res.status(200).json({
        success: true,
        message: 'Scenarios retrieved successfully',
        data: scenariosDto,
        pagination: result.pagination,
        filters: result.filters,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/simulations/scenarios/:id
   * Obtener detalles de un escenario
   */
  // eslint-disable-next-line consistent-return
  async getScenarioDetails(req, res, next) {
    try {
      const { id } = req.params;

      // Buscar escenario
      const scenario = await this.scenarioRepository.findById(id);

      if (!scenario) {
        return res.status(404).json({
          success: false,
          message: 'Scenario not found',
        });
      }

      // Verificar acceso (público o creador)
      const { userId } = req.user;
      if (!scenario.isPublic && scenario.createdBy !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this scenario',
        });
      }

      // Convertir a DTO (versión completa)
      const scenarioDto = ScenarioMapper.toFullDto(scenario);

      return res.status(200).json({
        success: true,
        message: 'Scenario details retrieved successfully',
        data: scenarioDto,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/simulations/scenarios
   * Crear un nuevo escenario (TEACHER/ADMIN)
   */
  // eslint-disable-next-line consistent-return
  async createScenario(req, res, next) {
    try {
      const { userId } = req.user;
      const {
        title,
        description,
        category,
        difficulty,
        steps,
        criteria,
        estimatedDuration,
        isPublic,
      } = req.body;

      // Validar archivos
      let modelFile = null;
      let modelFileName = null;
      let modelMimeType = null;
      let thumbnailFile = null;
      let thumbnailFileName = null;
      let thumbnailMimeType = null;

      if (req.files) {
        if (req.files.model) {
          const model = req.files.model[0];
          modelFile = model.buffer;
          modelFileName = model.originalname;
          modelMimeType = model.mimetype;
        }

        if (req.files.thumbnail) {
          const thumbnail = req.files.thumbnail[0];
          thumbnailFile = thumbnail.buffer;
          thumbnailFileName = thumbnail.originalname;
          thumbnailMimeType = thumbnail.mimetype;
        }
      }

      // Parsear steps y criteria (vienen como JSON string)
      const parsedSteps = typeof steps === 'string' ? JSON.parse(steps) : steps;
      const parsedCriteria = typeof criteria === 'string' ? JSON.parse(criteria) : criteria || [];

      // Ejecutar use case
      const scenario = await this.createScenarioUseCase.execute({
        userId,
        title,
        description,
        category,
        difficulty,
        modelFile,
        modelFileName,
        modelMimeType,
        steps: parsedSteps,
        criteria: parsedCriteria,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration, 10) : 15,
        thumbnailFile,
        thumbnailFileName,
        thumbnailMimeType,
        isPublic: isPublic === 'true' || isPublic === true,
      });

      // Convertir a DTO
      const scenarioDto = ScenarioMapper.toFullDto(scenario);

      return res.status(201).json({
        success: true,
        message: 'Scenario created successfully',
        data: scenarioDto,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/simulations/scenarios/:id
   * Actualizar un escenario existente (TEACHER/ADMIN/IT_ADMIN)
   */
  // eslint-disable-next-line consistent-return
  async updateScenario(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const userRoles = req.user.roles;

      console.log('📝 Updating scenario:', id);
      console.log('📝 User ID:', userId);
      console.log('📝 User roles:', userRoles);

      // Buscar escenario existente
      const existingScenario = await this.scenarioRepository.findById(id);

      if (!existingScenario) {
        return res.status(404).json({
          success: false,
          message: 'Scenario not found',
        });
      }

      // ✅ CORRECCIÓN: Convertir ambos a String para comparar
      const scenarioCreatorId = String(existingScenario.createdBy);
      const currentUserId = String(userId);

      console.log('🔍 Scenario createdBy:', scenarioCreatorId);
      console.log('🔍 Current userId:', currentUserId);

      // ✅ CORRECCIÓN: Declarar variables en el ORDEN CORRECTO
      const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('IT_ADMIN');
      const isOwner = scenarioCreatorId === currentUserId;

      console.log('🔍 Is admin?', isAdmin);
      console.log('🔍 Is owner?', isOwner);

      // Verificar permisos (debe ser owner O admin)
      if (!isOwner && !isAdmin) {
        console.log('❌ Access denied - Not owner and not admin');
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this scenario',
        });
      }

      console.log('✅ Permission granted');

      // Preparar datos actualizados
      const updateData = {
        title: req.body.title,
        description: req.body.description || '',
        category: req.body.category,
        difficulty: req.body.difficulty,
        estimatedDuration: parseInt(req.body.estimatedDuration, 10),
        isPublic: req.body.isPublic === 'true' || req.body.isPublic === true,
        updatedBy: userId,
      };

      // Parsear steps si vienen como string
      if (req.body.steps) {
        updateData.steps =
          typeof req.body.steps === 'string' ? JSON.parse(req.body.steps) : req.body.steps;
      }

      // Parsear criteria si vienen como string
      if (req.body.criteria) {
        updateData.criteria =
          typeof req.body.criteria === 'string' ? JSON.parse(req.body.criteria) : req.body.criteria;
      }

      // Manejo de archivos nuevos (si se subieron)
      if (req.files) {
        if (req.files.model) {
          const model = req.files.model[0];
          updateData.modelFile = model.buffer;
          updateData.modelFileName = model.originalname;
          updateData.modelMimeType = model.mimetype;
          console.log('📦 New model file:', model.originalname);
        }

        if (req.files.thumbnail) {
          const thumbnail = req.files.thumbnail[0];
          updateData.thumbnailFile = thumbnail.buffer;
          updateData.thumbnailFileName = thumbnail.originalname;
          updateData.thumbnailMimeType = thumbnail.mimetype;
          console.log('🖼️ New thumbnail file:', thumbnail.originalname);
        }
      }

      console.log('📝 Update data prepared:', Object.keys(updateData));

      // Actualizar en base de datos
      const updatedScenario = await this.scenarioRepository.update(id, updateData);

      console.log('✅ Scenario updated successfully');

      // Convertir a DTO
      const scenarioDto = ScenarioMapper.toFullDto(updatedScenario);

      return res.status(200).json({
        success: true,
        message: 'Scenario updated successfully',
        data: scenarioDto,
      });
    } catch (error) {
      console.error('❌ Error updating scenario:', error);
      next(error);
    }
  }

  /**
   * POST /api/simulations/scenarios/:id/execute
   * Ejecutar una simulación
   */
  // eslint-disable-next-line consistent-return
  async executeSimulation(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const { action = 'start' } = req.body;

      // Ejecutar simulación
      const result = await this.executeSimulationUseCase.execute({
        userId,
        scenarioId: id,
        action,
      });

      return res.status(200).json({
        success: true,
        message: `Simulation ${action}ed successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/simulations/metrics
   * Registrar métricas de una simulación completada
   */
  // eslint-disable-next-line no-unused-vars
  async recordMetrics(req, res, next) {
    try {
      const { userId } = req.user;

      console.log('📊 === RECORDING METRICS - DETAILED DEBUG ===');
      console.log('👤 User ID:', userId);
      console.log('📦 Request body type:', typeof req.body);
      console.log('📦 Request body keys:', Object.keys(req.body));
      console.log('📦 Full request body:', JSON.stringify(req.body, null, 2));

      const {
        scenarioId,
        sessionId,
        startedAt,
        completedAt,
        stepsCompleted,
        stepsTotal,
        accuracy,
        score,
        errors,
        vitalSignsData,
      } = req.body;

      // Validar campos requeridos UNO POR UNO
      const validations = [
        { field: 'scenarioId', value: scenarioId },
        { field: 'sessionId', value: sessionId },
        { field: 'startedAt', value: startedAt },
        { field: 'completedAt', value: completedAt },
        { field: 'stepsCompleted', value: stepsCompleted },
        { field: 'stepsTotal', value: stepsTotal },
        { field: 'accuracy', value: accuracy },
        { field: 'score', value: score },
      ];

      // eslint-disable-next-line no-restricted-syntax
      for (const { field, value } of validations) {
        if (value === undefined || value === null) {
          console.error(`❌ Missing required field: ${field}`);
          return res.status(400).json({
            success: false,
            error: `Missing required field: ${field}`,
          });
        }
        console.log(`✅ ${field}:`, value, `(${typeof value})`);
      }

      // Parsear errors si viene como string
      let parsedErrors = [];
      if (errors) {
        try {
          parsedErrors = typeof errors === 'string' ? JSON.parse(errors) : errors;
          console.log('✅ Errors parsed:', parsedErrors);
        } catch (e) {
          console.warn('⚠️ Could not parse errors, using empty array');
          parsedErrors = [];
        }
      }

      console.log('✅ All validations passed, calling use case...');

      // Ejecutar use case
      const result = await this.recordMetricsUseCase.execute({
        userId,
        scenarioId,
        sessionId,
        startedAt,
        completedAt,
        stepsCompleted,
        stepsTotal,
        accuracy,
        score,
        errors: parsedErrors,
        vitalSignsData: vitalSignsData || null,
      });

      console.log('✅ Metrics recorded successfully:', result.id);

      return res.status(201).json({
        success: true,
        message: 'Metrics recorded successfully',
        data: result,
      });
    } catch (error) {
      console.error('❌ ========================================');
      console.error('❌ ERROR IN RECORD METRICS CONTROLLER');
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Stack trace:', error.stack);
      console.error('❌ ========================================');
      // Retornar error más específico
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to record metrics',
        errorName: error.name,
        errorCode: error.code,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }

  /**
   * GET /api/simulations/metrics/my-history
   * Obtener historial de métricas del usuario
   */
  // eslint-disable-next-line consistent-return
  async getUserMetrics(req, res, next) {
    try {
      const { userId } = req.user;
      const { scenarioId, limit = 10, sortBy = '-completedAt' } = req.query;

      console.log('📊 Getting user metrics for:', userId);
      console.log('📊 Filters:', { scenarioId, limit, sortBy });

      // Ejecutar use case
      const result = await this.getUserMetricsUseCase.execute({
        userId,
        scenarioId: scenarioId || null,
        limit: parseInt(limit, 10),
        sortBy,
      });

      return res.status(200).json({
        success: true,
        message: 'User metrics retrieved successfully',
        data: result.metrics,
        summary: result.summary,
      });
    } catch (error) {
      console.error('❌ Error getting user metrics:', error);
      next(error);
    }
  }

  /**
   * POST /api/simulations/iot/connect
   * Conectar dispositivo IoT
   */
  // eslint-disable-next-line consistent-return
  async connectIoTDevice(req, res, next) {
    try {
      const { userId } = req.user;
      const { sessionId, deviceId, deviceType, action = 'connect' } = req.body;

      let result;

      switch (action) {
        case 'connect':
          result = await this.connectIoTDeviceUseCase.execute({
            userId,
            sessionId,
            deviceId,
            deviceType,
          });
          break;

        case 'disconnect':
          result = await this.connectIoTDeviceUseCase.disconnect({ deviceId });
          break;

        case 'status':
          result = await this.connectIoTDeviceUseCase.getDeviceStatus({ deviceId });
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid action. Must be: connect, disconnect, or status',
          });
      }

      return res.status(200).json({
        success: true,
        message: `Device ${action} successful`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/simulations/scenarios/:id
   * Eliminar un escenario
   */
  // eslint-disable-next-line consistent-return
  async deleteScenario(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const userRoles = req.user.roles;

      console.log('🗑️ Deleting scenario:', id);

      // Buscar escenario
      const scenario = await this.scenarioRepository.findById(id);

      if (!scenario) {
        return res.status(404).json({
          success: false,
          message: 'Scenario not found',
        });
      }

      // ✅ CORRECCIÓN: Comparar como strings
      const scenarioCreatorId = String(scenario.createdBy);
      const currentUserId = String(userId);

      const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('IT_ADMIN');
      const isOwner = scenarioCreatorId === currentUserId;

      console.log('🗑️ Scenario creator:', scenarioCreatorId);
      console.log('🗑️ Current user:', currentUserId);
      console.log('🗑️ Is owner?', isOwner);
      console.log('🗑️ Is admin?', isAdmin);

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this scenario',
        });
      }

      // Eliminar escenario
      await this.scenarioRepository.delete(id);

      console.log('✅ Scenario deleted successfully');

      return res.status(200).json({
        success: true,
        message: 'Scenario deleted successfully',
      });
    } catch (error) {
      console.error('❌ Error deleting scenario:', error);
      next(error);
    }
  }

  /**
   * GET /api/simulations/scenarios/public
   * Obtener escenarios públicos destacados
   */
  // eslint-disable-next-line consistent-return
  async getPublicScenarios(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      // Obtener escenarios públicos
      const scenarios = await this.scenarioRepository.findPublicScenarios(parseInt(limit, 10));

      // Convertir a DTOs
      const scenariosDto = ScenarioMapper.toSummaryDtoList(scenarios);

      return res.status(200).json({
        success: true,
        message: 'Public scenarios retrieved successfully',
        data: scenariosDto,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SimulationsController;
