import api from './api';

const authService = {
  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    console.log('🔍 authService - Login response:', response); // ⭐ DEBUG
    return response;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response;
  },

  // Recover password
  recoverPassword: async (email) => {
    const response = await api.post('/auth/recover-password', { email });
    return response;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response;
  },
};

export default authService;
