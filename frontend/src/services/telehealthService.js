/**
 * Telehealth Service
 * Maneja todas las llamadas API del módulo de teleenfermería
 */

import api from './api';

const TELEHEALTH_BASE_URL = '/telehealth';

/**
 * Agendar nueva cita
 * @param {Object} appointmentData - Datos de la cita
 * @returns {Promise<Object>}
 */
export const scheduleAppointment = async (appointmentData) => {
  try {
    console.log('📅 telehealthService - Sending appointment data:', appointmentData);

    // ✅ CRÍTICO: Asegurar que studentId se incluya si está presente
    const payload = {
      teacherId: appointmentData.teacherId,
      scheduledAt: appointmentData.scheduledAt,
      duration: appointmentData.duration,
      reason: appointmentData.reason,
    };

    // ✅ Incluir studentId SOLO si existe (para ADMIN)
    if (appointmentData.studentId) {
      payload.studentId = appointmentData.studentId;
    }

    console.log('📤 telehealthService - Final payload:', payload);

    const response = await api.post('/telehealth/appointments', payload);

    console.log('✅ telehealthService - Appointment scheduled:', response);

    return response.data;
  } catch (error) {
    console.error('❌ telehealthService - Error scheduling appointment:', error);
    throw error;
  }
};

/**
 * Obtener citas del usuario con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Citas paginadas
 */
export const getAppointments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const url = `${TELEHEALTH_BASE_URL}/appointments?${params.toString()}`;
    console.log('📅 Fetching appointments from:', url);

    const response = await api.get(url);

    console.log('📅 Full response:', response);
    return response.data;
  } catch (error) {
    console.error('❌ Error getting appointments:', error);
    throw error;
  }
};

/**
 * Obtener citas próximas (próximas 24 horas)
 * @returns {Promise<Object>} Citas próximas
 */
export const getUpcomingAppointments = async () => {
  try {
    const response = await api.get(`${TELEHEALTH_BASE_URL}/appointments/upcoming`);
    return response.data;
  } catch (error) {
    console.error('Error getting upcoming appointments:', error);
    throw error;
  }
};

/**
 * Obtener detalles de una cita
 * @param {string} appointmentId - ID de la cita
 * @returns {Promise<Object>} Detalles de la cita
 */
export const getAppointmentDetails = async (appointmentId) => {
  try {
    const response = await api.get(`${TELEHEALTH_BASE_URL}/appointments/${appointmentId}`);

    // ✅ Si viene con wrapper, extraer data
    if (response.data?.success && response.data?.data) {
      console.log('📦 Unwrapping response.data.data');
      return response.data.data;
    }

    // ✅ Si viene directo
    console.log('📦 Using response.data directly');
    return response.data;
  } catch (error) {
    console.error('Error getting appointment details:', error);
    throw error;
  }
};

/**
 * Actualizar estado de una cita
 * @param {string} appointmentId - ID de la cita
 * @param {string} status - Nuevo estado
 * @param {string} notes - Notas adicionales
 * @returns {Promise<Object>} Cita actualizada
 */
export const updateAppointmentStatus = async (appointmentId, status, notes = '') => {
  try {
    const response = await api.patch(
      `${TELEHEALTH_BASE_URL}/appointments/${appointmentId}/status`,
      { status, notes }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

/**
 * Cancelar una cita
 * @param {string} appointmentId - ID de la cita
 * @param {string} reason - Razón de cancelación
 * @returns {Promise<Object>} Cita cancelada
 */
export const cancelAppointment = async (appointmentId, reason) => {
  try {
    const response = await api.delete(`${TELEHEALTH_BASE_URL}/appointments/${appointmentId}`, {
      data: { reason },
    });
    return response.data;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

/**
 * Verificar disponibilidad de un docente
 * @param {string} teacherId - ID del docente
 * @param {string} scheduledAt - Fecha/hora propuesta (ISO string)
 * @param {number} duration - Duración en minutos
 * @returns {Promise<Object>} Disponibilidad
 */
export const checkAvailability = async (teacherId, scheduledAt, duration = 30) => {
  try {
    const response = await api.post(`${TELEHEALTH_BASE_URL}/availability/check`, {
      teacherId,
      scheduledAt,
      duration,
    });
    return response.data;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};

/**
 * Subir grabación de sesión
 * @param {string} appointmentId - ID de la cita
 * @param {File} file - Archivo de grabación
 * @returns {Promise<Object>} Resultado del upload
 */
export const uploadRecording = async (appointmentId, file) => {
  try {
    const formData = new FormData();
    formData.append('recording', file);

    const response = await api.post(
      `${TELEHEALTH_BASE_URL}/appointments/${appointmentId}/recording`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutos
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading recording:', error);
    throw error;
  }
};

/**
 * Helpers
 */

/**
 * Validar datos de cita antes de enviar
 */
export const validateAppointmentData = (data) => {
  const errors = {};

  if (!data.teacherId) {
    errors.teacherId = 'Debe seleccionar un docente';
  }

  if (!data.scheduledAt) {
    errors.scheduledAt = 'Debe seleccionar fecha y hora';
  }

  if (!data.duration || data.duration < 15) {
    errors.duration = 'La duración mínima es 15 minutos';
  }

  if (!data.reason || data.reason.trim().length < 10) {
    errors.reason = 'El motivo debe tener al menos 10 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Verificar si se puede cancelar una cita
 */
export const canCancelAppointment = (appointment) => {
  if (!appointment) return false;

  const status = appointment.status;
  if (status === 'COMPLETED' || status === 'CANCELLED') {
    return false;
  }

  const now = new Date();
  const scheduledAt = new Date(appointment.scheduledAt);
  const diffHours = (scheduledAt - now) / (1000 * 60 * 60);

  return diffHours >= 2; // Al menos 2 horas de anticipación
};

/**
 * Verificar si se puede iniciar videollamada
 */
export const canStartVideoCall = (appointment) => {
  if (!appointment) return false;

  const status = appointment.status;
  if (status !== 'SCHEDULED' && status !== 'CONFIRMED') {
    return false;
  }

  const now = new Date();
  const scheduledAt = new Date(appointment.scheduledAt);
  const diffMinutes = (scheduledAt - now) / (1000 * 60);

  // 15 minutos antes hasta 15 minutos después
  return diffMinutes <= 15 && diffMinutes >= -15;
};

// Exportar objeto con todas las funciones
const telehealthService = {
  scheduleAppointment,
  getAppointments,
  getUpcomingAppointments,
  getAppointmentDetails,
  updateAppointmentStatus,
  cancelAppointment,
  checkAvailability,
  uploadRecording,
  validateAppointmentData,
  canCancelAppointment,
  canStartVideoCall,
};

export default telehealthService;
