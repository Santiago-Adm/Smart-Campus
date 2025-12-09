import api from './api';

const dashboardService = {
  // Obtener datos del dashboard
  getDashboardData: async () => {
    const response = await api.get('/analytics/dashboard');
    return response;
  },

  // Obtener datos comparativos (admin only)
  getComparativeData: async () => {
    const response = await api.get('/analytics/comparative');
    return response;
  },

  // Obtener alertas (admin only)
  getAlerts: async () => {
    const response = await api.get('/analytics/alerts');
    return response;
  },
};

export default dashboardService;
