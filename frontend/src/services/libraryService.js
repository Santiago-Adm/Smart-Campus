/**
 * Library Service
 * Maneja todas las llamadas API del módulo de biblioteca virtual
 */

import api from './api';

const LIBRARY_BASE_URL = '/library';

/**
 * Buscar recursos con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Recursos paginados
 */
  export const searchResources = async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      // Agregar filtros solo si tienen valor
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }
      if (filters.language) params.append('language', filters.language);
      if (filters.isPublic !== undefined) params.append('isPublic', filters.isPublic);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const url = `${LIBRARY_BASE_URL}/resources?${params.toString()}`;
      console.log('🔍 Fetching resources from:', url);

      const response = await api.get(url);

      console.log('🔍 Full Axios response:', response);
      console.log('🔍 Response.data (from backend):', response.data);

      // ✅ CORRECCIÓN: response.data = { success, message, data: [...], pagination, filters }
      // NO devolver response.data.data, devolver response.data completo
      return response.data;  // { success, message, data: [...], pagination, filters }

    } catch (error) {
      console.error('❌ Error searching resources:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  };

/**
 * Obtener detalles de un recurso
 * @param {string} resourceId - ID del recurso
 * @returns {Promise<Object>} Detalles del recurso
 */
export const getResourceDetails = async (resourceId) => {
  try {
    const response = await api.get(`${LIBRARY_BASE_URL}/resources/${resourceId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting resource details:', error);
    throw error;
  }
};

/**
 * Subir un nuevo recurso
 * @param {FormData} formData - Datos del recurso con archivo
 * @returns {Promise<Object>} Recurso creado
 */
export const uploadResource = async (formData) => {
  try {
    const response = await api.post(`${LIBRARY_BASE_URL}/resources/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Timeout extendido para archivos grandes
      timeout: 300000, // 5 minutos
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading resource:', error);
    throw error;
  }
};

/**
 * Obtener recomendaciones personalizadas
 * @param {Object} params - Parámetros de recomendación
 * @returns {Promise<Object>} Recursos recomendados
 */
export const getRecommendations = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.limit) queryParams.append('limit', params.limit);
    if (params.strategy) queryParams.append('strategy', params.strategy);

    const response = await api.get(
      `${LIBRARY_BASE_URL}/recommendations?${queryParams.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
};

/**
 * Registrar interacción con un recurso
 * @param {string} resourceId - ID del recurso
 * @param {string} action - Acción (view, download, rate)
 * @param {Object} data - Datos adicionales (ej: rating)
 * @returns {Promise<Object>} Resultado del tracking
 */
export const trackResourceUsage = async (resourceId, action, data = {}) => {
  try {
    const response = await api.post(`${LIBRARY_BASE_URL}/resources/${resourceId}/track`, {
      action,
      ...data,
    });
    return response.data;
  } catch (error) {
    console.error('Error tracking resource usage:', error);
    throw error;
  }
};

/**
 * Obtener recursos más populares
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Object>} Recursos populares
 */
export const getMostPopular = async (limit = 10) => {
  try {
    const response = await api.get(`${LIBRARY_BASE_URL}/popular?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error getting most popular resources:', error);
    throw error;
  }
};

/**
 * Eliminar un recurso
 * @param {string} resourceId - ID del recurso
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export const deleteResource = async (resourceId) => {
  try {
    const response = await api.delete(`${LIBRARY_BASE_URL}/resources/${resourceId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
};

/**
 * Descargar un recurso
 * @param {string} fileUrl - URL del archivo
 * @param {string} fileName - Nombre del archivo
 */
export const downloadResource = async (fileUrl, fileName) => {
  try {
    // Abrir en nueva pestaña para descargar
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading resource:', error);
    throw error;
  }
};

/**
 * Validar archivo antes de subir
 * @param {File} file - Archivo a validar
 * @param {string} resourceType - Tipo de recurso
 * @returns {Object} Resultado de validación
 */
export const validateFile = (file, resourceType) => {
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'El archivo no puede superar los 100MB',
    };
  }

  // Validar tipo de archivo según tipo de recurso
  const allowedTypes = {
    book: ['application/pdf'],
    article: ['application/pdf'],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
    guide: ['application/pdf'],
    case_study: ['application/pdf'],
  };

  const allowed = allowedTypes[resourceType] || [];

  if (!allowed.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no válido. Tipos permitidos: ${allowed.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Crear FormData para subir recurso
 * @param {Object} resourceData - Datos del recurso
 * @param {File} file - Archivo a subir
 * @returns {FormData}
 */
export const createResourceFormData = (resourceData, file) => {
  const formData = new FormData();

  // Agregar archivo
  formData.append('file', file);

  // Agregar campos obligatorios
  formData.append('title', resourceData.title);
  formData.append('category', resourceData.category);
  formData.append('type', resourceData.type);

  // Agregar campos opcionales solo si tienen valor
  if (resourceData.description) formData.append('description', resourceData.description);
  if (resourceData.author) formData.append('author', resourceData.author);
  if (resourceData.publisher) formData.append('publisher', resourceData.publisher);
  if (resourceData.publicationDate)
    formData.append('publicationDate', resourceData.publicationDate);
  if (resourceData.language) formData.append('language', resourceData.language);
  if (resourceData.pageCount) formData.append('pageCount', resourceData.pageCount);
  if (resourceData.duration) formData.append('duration', resourceData.duration);

  // ✅ CORRECCIÓN CRÍTICA: isPublic siempre debe enviarse como string
  if (resourceData.isPublic !== undefined) {
    const isPublicValue = resourceData.isPublic === true ? 'true' : 'false';
    formData.append('isPublic', isPublicValue);
    console.log('📤 [createResourceFormData] isPublic:', resourceData.isPublic, '→', isPublicValue);
  } else {
    // Si no está definido, por defecto es true
    formData.append('isPublic', 'true');
    console.log('📤 [createResourceFormData] isPublic undefined, using default: true');
  }

  // Agregar tags
  if (resourceData.tags && resourceData.tags.length > 0) {
    formData.append('tags', resourceData.tags.join(','));
  }

  // ✅ LOG: Mostrar todos los valores del FormData
  console.log('📤 [createResourceFormData] Final FormData entries:');
  for (let [key, value] of formData.entries()) {
    if (key === 'file') {
      console.log(`  ${key}:`, value.name, value.type);
    } else {
      console.log(`  ${key}:`, value, `(${typeof value})`);
    }
  }

  return formData;
};

// Exportar objeto con todas las funciones
const libraryService = {
  searchResources,
  getResourceDetails,
  uploadResource,
  getRecommendations,
  trackResourceUsage,
  getMostPopular,
  deleteResource,
  downloadResource,
  validateFile,
  createResourceFormData,
};

export default libraryService;
