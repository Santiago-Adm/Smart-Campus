import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor REQUEST: Agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor RESPONSE: Manejar errores y refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Retornar solo data para simplificar
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error NO es 401, rechazar directamente
    if (error.response?.status !== 401) {
      // Mostrar error al usuario
      const message = error.response?.data?.message || 'Error en la solicitud';
      toast.error(message);
      return Promise.reject(error);
    }

    // Si es 401 y ya intentamos refresh, logout
    if (originalRequest._retry) {
      useAuthStore.getState().logout();
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Si ya estamos refrescando, agregar a cola
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Intentar refresh token
    isRefreshing = true;
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      isRefreshing = false;
      useAuthStore.getState().logout();
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(`${API_URL}/auth/refresh-token`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Actualizar tokens en store
      useAuthStore.getState().updateTokens(accessToken, newRefreshToken);

      // Procesar cola de requests fallidos
      processQueue(null, accessToken);

      // Reintentar request original
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
