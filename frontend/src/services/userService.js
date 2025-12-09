/**
 * User Service
 * Maneja todas las llamadas API relacionadas con usuarios
 */

import api from './api';

const userService = {
  /**
   * Obtener lista de usuarios con filtros
   */
  getAll: async (params = {}) => {
    try {
      const {
        role = null,
        search = null,
        isActive = true,
        page = 1,
        limit = 50,
      } = params;

      const queryParams = new URLSearchParams();

      if (role) queryParams.append('role', role);
      if (search) queryParams.append('search', search);
      queryParams.append('isActive', isActive.toString());
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      const response = await api.get(`/users?${queryParams}`);

      console.log('👥 Users response:', response);

      return response;
    } catch (error) {
      console.error('❌ Error in userService.getAll:', error);
      throw error;
    }
  },

  /**
   * Obtener usuarios por rol específico (helper)
   */
  getByRole: async (role, limit = 100) => {
    try {
      const response = await userService.getAll({ role, limit });

      console.log(`👥 Users with role ${role} (full response):`, response);

      // ✅ CORRECCIÓN: Verificar estructura de respuesta
      if (response && response.data) {
        // Si response.data tiene la estructura { success, data, pagination }
        if (response.data.success && Array.isArray(response.data.data)) {
          console.log(`✅ Extracted ${response.data.data.length} users with role ${role}`);
          return response.data.data;
        }

        // Si response.data ya es el array directamente
        if (Array.isArray(response.data)) {
          console.log(`✅ Extracted ${response.data.length} users with role ${role}`);
          return response.data;
        }
      }

      console.warn(`⚠️ Unexpected response structure for role ${role}:`, response);
      return [];
    } catch (error) {
      console.error(`❌ Error getting users with role ${role}:`, error);

      // Si hay error 403 (permisos), devolver array vacío
      if (error.response?.status === 403) {
        console.warn('⚠️ User does not have permission to load users');
        return [];
      }

      throw error;
    }
  },

  /**
   * Obtener todos los docentes (TEACHER)
   */
  getTeachers: async () => {
    return userService.getByRole('TEACHER');
  },

  /**
   * Obtener todos los estudiantes (STUDENT)
   */
  getStudents: async () => {
    return userService.getByRole('STUDENT');
  },

  /**
   * Obtener usuario por ID
   */
  getById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);

      console.log('👤 User by ID:', response);

      return response.data;
    } catch (error) {
      console.error(`❌ Error getting user ${userId}:`, error);
      throw error;
    }
  },
};

export default userService;
