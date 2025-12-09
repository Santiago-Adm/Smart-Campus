/**
 * Simulations Service
 * Maneja todas las llamadas API del módulo de simulaciones AR + IoT
 */

import api from './api';

const SIMULATIONS_BASE_URL = '/simulations';

// ============================================
// OBTENER ESCENARIOS
// ============================================

/**
 * Buscar escenarios con filtros
 */
export const getScenarios = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    // ✅ SOLO agregar filtros con valores válidos (NO null, NO undefined, NO vacío)
    if (filters.search?.trim()) {
      params.append('search', filters.search.trim());
    }

    if (filters.category && filters.category !== '') {
      params.append('category', filters.category);
    }

    if (filters.difficulty && filters.difficulty !== '') {
      params.append('difficulty', filters.difficulty);
    }

    // ✅ CRÍTICO: NO enviar isPublic si es null o undefined
    if (typeof filters.isPublic === 'boolean') {
      params.append('isPublic', filters.isPublic);
    }

    if (filters.createdBy) {
      params.append('createdBy', filters.createdBy);
    }

    if (filters.page) {
      params.append('page', filters.page);
    }

    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    if (filters.sortBy && filters.sortBy !== 'createdAt') {
      params.append('sortBy', filters.sortBy);
    }

    const url = `${SIMULATIONS_BASE_URL}/scenarios?${params.toString()}`;
    console.log('🎮 Fetching from:', url);

    const response = await api.get(url);

    console.log('🎮 Full response:', response);
    console.log('🎮 Response.data:', response.data);
    console.log('🎮 Type of response.data:', typeof response.data);
    console.log('🎮 Is array?', Array.isArray(response.data));

    // ✅ EXTRACCIÓN CORRECTA según estructura del backend
    let scenarios = [];
    let pagination = {};

    if (response.data && typeof response.data === 'object') {
      if (response.data.success && Array.isArray(response.data.data)) {
        // Caso: {success: true, data: [...], pagination: {...}}
        scenarios = response.data.data;
        pagination = response.data.pagination;
        console.log('🎮 Case: Backend structure with success');
      } else if (Array.isArray(response.data)) {
        // Caso: Array directo
        scenarios = response.data;
        console.log('🎮 Case: Direct array');
      }
    }

    console.log('🎮 Final extracted scenarios:', scenarios);
    console.log('🎮 Final scenarios count:', scenarios.length);

    return {
      success: true,
      scenarios: scenarios,
      pagination: pagination || {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total: scenarios.length,
        totalPages: Math.ceil(scenarios.length / (filters.limit || 20)),
      },
      filters: response.data?.filters || {},
    };
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

/**
 * Obtener escenarios públicos destacados
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Object>} Escenarios públicos
 */
export const getPublicScenarios = async (limit = 10) => {
  try {
    const response = await api.get(
      `${SIMULATIONS_BASE_URL}/scenarios/public?limit=${limit}`
    );

    console.log('🌟 Public scenarios full response:', response);
    console.log('🌟 Public scenarios response.data:', response.data);
    console.log('🌟 Public scenarios response.data.data:', response.data?.data);

    // ✅ CORRECCIÓN: Para /scenarios/public, los escenarios vienen directamente en response.data.data
    // PERO si response.data es un array, usarlo directamente
    let scenarios = [];

    if (Array.isArray(response.data)) {
      // Caso 1: Response es directamente un array
      scenarios = response.data;
      console.log('🌟 Case 1: Direct array');
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      // Caso 2: Response.data.data es el array
      scenarios = response.data.data;
      console.log('🌟 Case 2: Nested in .data.data');
    } else if (response.data?.success && response.data?.data) {
      // Caso 3: Estructura con success
      scenarios = Array.isArray(response.data.data) ? response.data.data : [];
      console.log('🌟 Case 3: Success structure');
    }

    console.log('🌟 Extracted public scenarios:', scenarios);
    console.log('🌟 Public scenarios count:', scenarios.length);

    return {
      success: true,
      scenarios: scenarios,
    };
  } catch (error) {
    console.error('❌ Error fetching public scenarios:', error);
    throw error;
  }
};

/**
 * Obtener detalles de un escenario
 * @param {string} scenarioId - ID del escenario
 * @returns {Promise<Object>} Detalles del escenario
 */
export const getScenarioById = async (scenarioId) => {
  try {
    const response = await api.get(`${SIMULATIONS_BASE_URL}/scenarios/${scenarioId}`);

    console.log('🎯 Scenario details full response:', response);
    console.log('🎯 Scenario details response.data:', response.data);

    // ✅ CORRECCIÓN: El backend devuelve { success, message, data: {...} }
    // El escenario está en response.data.data
    const scenario = response.data?.data || response.data || null;

    console.log('🎯 Extracted scenario:', scenario);

    return {
      success: true, // ✅ Si llegamos aquí, fue exitoso
      scenario: scenario,
    };
  } catch (error) {
    console.error('❌ Error fetching scenario details:', error);
    console.error('❌ Error response:', error.response?.data);
    throw error;
  }
};



// ============================================
// CREAR Y GESTIONAR ESCENARIOS
// ============================================

/**
 * Crear un nuevo escenario
 * @param {FormData} formData - Datos del escenario con archivos
 * @returns {Promise<Object>} Escenario creado
 */
export const createScenario = async (formData) => {
  try {
    console.log('📤 Creating scenario with FormData...');

    // Log de FormData para debugging
    for (let [key, value] of formData.entries()) {
      if (key === 'model' || key === 'thumbnail') {
        console.log(`  ${key}:`, value.name, value.type, value.size);
      } else {
        console.log(`  ${key}:`, value, `(${typeof value})`);
      }
    }

    const response = await api.post(`${SIMULATIONS_BASE_URL}/scenarios`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Timeout extendido para modelos 3D grandes
      timeout: 300000, // 5 minutos
    });

    console.log('✅ Scenario created response:', response);
    console.log('✅ Response.data:', response.data);

    // ✅ CORRECCIÓN: Normalizar igual que en getScenarioById
    const scenario = response.data?.data || response.data || null;

    console.log('✅ Extracted scenario:', scenario);

    return {
      success: true, // ✅ Si llegamos aquí, fue exitoso
      scenario: scenario,
      message: response.data?.message || 'Scenario created successfully',
    };
  } catch (error) {
    console.error('❌ Error creating scenario:', error);
    console.error('❌ Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Actualizar un escenario existente
 * @param {string} scenarioId - ID del escenario
 * @param {FormData} formData - Datos actualizados del escenario con archivos
 * @returns {Promise<Object>} Escenario actualizado
 */
export const updateScenario = async (scenarioId, formData) => {
  try {
    console.log('📤 Updating scenario with ID:', scenarioId);

    // Log de FormData para debugging
    for (let [key, value] of formData.entries()) {
      if (key === 'model' || key === 'thumbnail') {
        console.log(`  ${key}:`, value.name, value.type, value.size);
      } else {
        console.log(`  ${key}:`, value, `(${typeof value})`);
      }
    }

    // ✅ Usar PUT (ahora que existe en el backend)
    const response = await api.put(
      `${SIMULATIONS_BASE_URL}/scenarios/${scenarioId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000,
      }
    );

    console.log('✅ Scenario updated response:', response);
    console.log('✅ Response.data:', response.data);

    const scenario = response.data?.data || response.data || null;

    console.log('✅ Extracted scenario:', scenario);

    return {
      success: true,
      scenario: scenario,
      message: response.data?.message || 'Scenario updated successfully',
    };
  } catch (error) {
    console.error('❌ Error updating scenario:', error);
    console.error('❌ Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Eliminar un escenario
 * @param {string} scenarioId - ID del escenario
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const deleteScenario = async (scenarioId) => {
  try {
    console.log('🗑️ Deleting scenario:', scenarioId);

    const response = await api.delete(`${SIMULATIONS_BASE_URL}/scenarios/${scenarioId}`);

    console.log('✅ Scenario deleted:', response);

    return {
      success: true,
      message: response.data?.message || 'Scenario deleted successfully',
    };
  } catch (error) {
    console.error('❌ Error deleting scenario:', error);
    throw error;
  }
};

// ============================================
// EJECUTAR SIMULACIONES
// ============================================

/**
 * Ejecutar una simulación
 * @param {string} scenarioId - ID del escenario
 * @param {string} action - Acción ('start', 'pause', 'resume', 'complete')
 * @returns {Promise<Object>} Resultado de la ejecución
 */
export const executeSimulation = async (scenarioId, action = 'start') => {
  try {
    const response = await api.post(`${SIMULATIONS_BASE_URL}/scenarios/${scenarioId}/execute`, {
      action,
    });

    console.log(`🎮 Simulation ${action}:`, response.data);

    return {
      success: response.data?.success || false,
      data: response.data?.data || null,
      message: response.data?.message || `Simulation ${action}ed successfully`,
    };
  } catch (error) {
    console.error(`❌ Error executing simulation (${action}):`, error);
    throw error;
  }
};

/**
 * Registrar métricas de simulación
 * @param {Object} metricsData - Datos de métricas
 * @returns {Promise<Object>} Resultado del registro
 */
export const recordMetrics = async (metricsData) => {
  try {
    console.log('📊 === RECORDING METRICS - FRONTEND ===');
    console.log('📊 Input data:', JSON.stringify(metricsData, null, 2));

    // Validar que todos los campos requeridos estén presentes
    const requiredFields = [
      'scenarioId',
      'sessionId',
      'startedAt',
      'completedAt',
      'stepsCompleted',
      'stepsTotal',
      'accuracy',
      'score',
    ];

    const missingFields = [];
    for (const field of requiredFields) {
      if (metricsData[field] === undefined || metricsData[field] === null) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Formatear los datos correctamente
    const formattedData = {
      scenarioId: String(metricsData.scenarioId),
      sessionId: String(metricsData.sessionId),
      startedAt: new Date(metricsData.startedAt).toISOString(),
      completedAt: new Date(metricsData.completedAt).toISOString(),
      stepsCompleted: Number(metricsData.stepsCompleted),
      stepsTotal: Number(metricsData.stepsTotal),
      accuracy: Number(metricsData.accuracy),
      score: Number(metricsData.score),
      errors: Array.isArray(metricsData.errors) ? metricsData.errors : [],
      vitalSignsData: metricsData.vitalSignsData || null,
    };

    console.log('📊 Formatted data:', JSON.stringify(formattedData, null, 2));
    console.log('📊 Data types:');
    Object.entries(formattedData).forEach(([key, value]) => {
      console.log(`  ${key}: ${typeof value} = ${value}`);
    });

    // Enviar al backend
    const response = await api.post(`${SIMULATIONS_BASE_URL}/metrics`, formattedData);

    console.log('✅ Metrics recorded successfully:', response.data);

    return {
      success: response.data?.success || false,
      data: response.data?.data || null,
      message: response.data?.message || 'Metrics recorded successfully',
    };
  } catch (error) {
    console.error('❌ Error recording metrics:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);

    // ⚠️ IMPORTANTE: No lanzar error, solo retornar fallo
    // Para que la simulación no falle aunque no se guarden las métricas
    return {
      success: false,
      error: error.message,
      details: error.response?.data,
    };
  }
};

/**
 * Obtener historial de métricas del usuario
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Object>} Historial de métricas
 */
export const getUserMetrics = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.scenarioId) {
      params.append('scenarioId', filters.scenarioId);
    }

    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }

    console.log('📊 Fetching user metrics with filters:', filters);

    const response = await api.get(`${SIMULATIONS_BASE_URL}/metrics/my-history?${params}`);

    console.log('📊 User metrics response:', response.data);

    return {
      success: true,
      metrics: response.data?.data || response.data || [],
      summary: response.data?.summary || null,
    };
  } catch (error) {
    console.error('❌ Error fetching user metrics:', error);

    // Si el endpoint no existe todavía, retornar vacío sin error
    if (error.response?.status === 404) {
      console.warn('⚠️ Metrics endpoint not implemented yet, returning empty');
      return {
        success: true,
        metrics: [],
        summary: null,
      };
    }

    throw error;
  }
};


// ============================================
// IOT - DISPOSITIVOS
// ============================================

/**
 * Conectar dispositivo IoT
 * @param {Object} deviceData - Datos del dispositivo
 * @returns {Promise<Object>} Resultado de la conexión
 */
export const connectIoTDevice = async (deviceData) => {
  try {
    console.log('🔌 Connecting IoT device:', deviceData);

    const response = await api.post(`${SIMULATIONS_BASE_URL}/iot/connect`, {
      action: 'connect',
      ...deviceData,
    });

    console.log('✅ IoT device connected:', response.data);

    return {
      success: response.data?.success || false,
      data: response.data?.data || null,
    };
  } catch (error) {
    console.error('❌ Error connecting IoT device:', error);
    throw error;
  }
};

/**
 * Desconectar dispositivo IoT
 * @param {string} deviceId - ID del dispositivo
 * @returns {Promise<Object>} Resultado de la desconexión
 */
export const disconnectIoTDevice = async (deviceId) => {
  try {
    const response = await api.post(`${SIMULATIONS_BASE_URL}/iot/connect`, {
      action: 'disconnect',
      deviceId,
    });

    console.log('🔌 IoT device disconnected:', response.data);

    return {
      success: response.data?.success || false,
      data: response.data?.data || null,
    };
  } catch (error) {
    console.error('❌ Error disconnecting IoT device:', error);
    throw error;
  }
};

/**
 * Obtener estado de dispositivo IoT
 * @param {string} deviceId - ID del dispositivo
 * @returns {Promise<Object>} Estado del dispositivo
 */
export const getIoTDeviceStatus = async (deviceId) => {
  try {
    const response = await api.post(`${SIMULATIONS_BASE_URL}/iot/connect`, {
      action: 'status',
      deviceId,
    });

    return {
      success: response.data?.success || false,
      data: response.data?.data || null,
    };
  } catch (error) {
    console.error('❌ Error getting IoT device status:', error);
    throw error;
  }
};

// ============================================
// HELPERS Y VALIDACIONES
// ============================================

/**
 * Validar archivo de modelo 3D
 * @param {File} file - Archivo a validar
 * @returns {Object} Resultado de validación
 */
export const validateModelFile = (file) => {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'El modelo 3D no puede superar los 50MB',
    };
  }

  // Validar extensión
  const validExtensions = ['.gltf', '.glb'];
  const fileName = file.name.toLowerCase();
  const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

  if (!isValidExtension) {
    return {
      valid: false,
      error: 'Solo se permiten archivos GLTF o GLB',
    };
  }

  return { valid: true };
};

/**
 * Validar archivo de thumbnail
 * @param {File} file - Archivo a validar
 * @returns {Object} Resultado de validación
 */
export const validateThumbnailFile = (file) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'La imagen no puede superar los 5MB',
    };
  }

  // Validar tipo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Solo se permiten imágenes JPG, PNG o WebP',
    };
  }

  return { valid: true };
};

/**
 * Crear FormData para crear escenario
 * @param {Object} scenarioData - Datos del escenario
 * @param {File} modelFile - Archivo del modelo 3D
 * @param {File} thumbnailFile - Archivo del thumbnail (opcional)
 * @returns {FormData}
 */
export const createScenarioFormData = (scenarioData, modelFile, thumbnailFile = null) => {
  const formData = new FormData();

  // ✅ CAMPOS OBLIGATORIOS
  formData.append('title', scenarioData.title);
  formData.append('category', scenarioData.category);
  formData.append('difficulty', scenarioData.difficulty);

  // ✅ ARCHIVOS
  if (modelFile) {
    formData.append('model', modelFile);
  }

  if (thumbnailFile) {
    formData.append('thumbnail', thumbnailFile);
  }

  // ✅ CAMPOS OPCIONALES
  if (scenarioData.description) {
    formData.append('description', scenarioData.description);
  }

  // ✅ STEPS (debe ser JSON string)
  if (scenarioData.steps && scenarioData.steps.length > 0) {
    formData.append('steps', JSON.stringify(scenarioData.steps));
  }

  // ✅ CRITERIA (debe ser JSON string)
  if (scenarioData.criteria && scenarioData.criteria.length > 0) {
    formData.append('criteria', JSON.stringify(scenarioData.criteria));
  }

  // ✅ DURACIÓN (convertir a string)
  if (scenarioData.estimatedDuration) {
    formData.append('estimatedDuration', String(scenarioData.estimatedDuration));
  }

  // ✅ IS PUBLIC (convertir boolean a string explícitamente)
  if (scenarioData.isPublic !== undefined) {
    const isPublicValue = scenarioData.isPublic === true ? 'true' : 'false';
    formData.append('isPublic', isPublicValue);
    console.log('📤 [createScenarioFormData] isPublic:', scenarioData.isPublic, '→', isPublicValue);
  } else {
    // Por defecto es público
    formData.append('isPublic', 'true');
    console.log('📤 [createScenarioFormData] isPublic undefined, using default: true');
  }

  // ✅ LOG: Mostrar todos los valores del FormData
  console.log('📤 [createScenarioFormData] Final FormData entries:');
  for (let [key, value] of formData.entries()) {
    if (key === 'model' || key === 'thumbnail') {
      console.log(`  ${key}:`, value.name, value.type, value.size);
    } else {
      console.log(`  ${key}:`, value, `(${typeof value})`);
    }
  }

  return formData;
};

/**
 * Validar datos de escenario antes de crear FormData
 * @param {Object} scenarioData - Datos del escenario
 * @returns {Object} Resultado de validación
 */
export const validateScenarioData = (scenarioData) => {
  const errors = [];

  // Validar título
  if (!scenarioData.title || scenarioData.title.trim().length < 5) {
    errors.push('El título debe tener al menos 5 caracteres');
  }

  // Validar categoría
  const validCategories = [
    'venopuncion',
    'rcp',
    'cateterismo',
    'curacion',
    'inyeccion',
    'signos_vitales',
    'otros',
  ];
  if (!validCategories.includes(scenarioData.category)) {
    errors.push('Categoría no válida');
  }

  // Validar dificultad
  const validDifficulties = ['beginner', 'intermediate', 'advanced'];
  if (!validDifficulties.includes(scenarioData.difficulty)) {
    errors.push('Dificultad no válida');
  }

  // Validar pasos
  if (!scenarioData.steps || scenarioData.steps.length === 0) {
    errors.push('El escenario debe tener al menos un paso');
  }

  // Validar duración
  if (
    scenarioData.estimatedDuration &&
    (scenarioData.estimatedDuration < 5 || scenarioData.estimatedDuration > 120)
  ) {
    errors.push('La duración debe estar entre 5 y 120 minutos');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Exportar objeto con todas las funciones
const simulationsService = {
  // Obtener
  getScenarios,
  getPublicScenarios,
  getScenarioById,

  // Crear, editar y gestionar
  createScenario,
  updateScenario,
  deleteScenario,

  // Ejecutar
  executeSimulation,
  recordMetrics,
  getUserMetrics,

  // IoT
  connectIoTDevice,
  disconnectIoTDevice,
  getIoTDeviceStatus,

  // Helpers
  validateModelFile,
  validateThumbnailFile,
  createScenarioFormData,
  validateScenarioData,
};

export default simulationsService;
