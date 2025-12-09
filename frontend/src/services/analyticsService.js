/**
 * Analytics Service
 * Maneja todas las llamadas API del módulo de analítica
 */

import api from './api';

const ANALYTICS_BASE_URL = '/analytics';

/**
 * Obtener datos del dashboard
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Object>}
 */
export const getDashboardData = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.userRole) params.append('userRole', filters.userRole);

    const url = `${ANALYTICS_BASE_URL}/dashboard?${params.toString()}`;
    console.log('📊 Fetching dashboard data from:', url);

    const response = await api.get(url);

    console.log('✅ Dashboard data received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error getting dashboard data:', error);
    throw error;
  }
};

/**
 * Obtener datos comparativos
 * @param {Object} params - Parámetros de comparación
 * @returns {Promise<Object>}
 */
export const getComparativeData = async (params) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.compareToStartDate) queryParams.append('compareToStartDate', params.compareToStartDate);
    if (params.compareToEndDate) queryParams.append('compareToEndDate', params.compareToEndDate);
    if (params.metric) queryParams.append('metric', params.metric);

    const response = await api.get(`${ANALYTICS_BASE_URL}/comparative?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error getting comparative data:', error);
    throw error;
  }
};

/**
 * Generar reporte
 * @param {Object} reportConfig - Configuración del reporte
 * @returns {Promise<Object>}
 */
export const generateReport = async (reportConfig) => {
  try {
    console.log('📄 Generating report:', reportConfig);

    const response = await api.post(`${ANALYTICS_BASE_URL}/reports/generate`, reportConfig);

    console.log('✅ Report generated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error generating report:', error);
    throw error;
  }
};

/**
 * Listar reportes generados
 * @returns {Promise<Object>}
 */
export const listReports = async () => {
  try {
    const response = await api.get(`${ANALYTICS_BASE_URL}/reports`);
    return response.data;
  } catch (error) {
    console.error('❌ Error listing reports:', error);
    throw error;
  }
};

/**
 * Descargar reporte
 * @param {string} fileName - Nombre del archivo
 */
export const downloadReport = (fileName) => {
  const url = `${api.defaults.baseURL}${ANALYTICS_BASE_URL}/reports/${fileName}/download`;
  window.open(url, '_blank');
};

/**
 * Eliminar reporte
 * @param {string} fileName - Nombre del archivo
 * @returns {Promise<Object>}
 */
export const deleteReport = async (fileName) => {
  try {
    const response = await api.delete(`${ANALYTICS_BASE_URL}/reports/${fileName}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting report:', error);
    throw error;
  }
};

/**
 * Obtener alertas del sistema
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Object>}
 */
export const getAlerts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.severity) params.append('severity', filters.severity);
    if (filters.category) params.append('category', filters.category);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`${ANALYTICS_BASE_URL}/alerts?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error getting alerts:', error);
    throw error;
  }
};

/**
 * Predecir riesgo de deserción
 * @param {Object} params - Parámetros de predicción
 * @returns {Promise<Object>}
 */
export const predictDropoutRisk = async (params = {}) => {
  try {
    const response = await api.post(`${ANALYTICS_BASE_URL}/predictions/dropout-risk`, params);
    return response.data;
  } catch (error) {
    console.error('❌ Error predicting dropout risk:', error);
    throw error;
  }
};

// Exportar objeto con todas las funciones
const analyticsService = {
  getDashboardData,
  getComparativeData,
  generateReport,
  listReports,
  downloadReport,
  deleteReport,
  getAlerts,
  predictDropoutRisk,
};

export default analyticsService;
