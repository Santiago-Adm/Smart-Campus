/**
 * Constantes y helpers para el módulo de Teleenfermería
 */

// ============================================
// ESTADOS DE CITAS
// ============================================
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
};

// Labels de estados (español)
export const STATUS_LABELS = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'Agendada',
  [APPOINTMENT_STATUS.CONFIRMED]: 'Confirmada',
  [APPOINTMENT_STATUS.IN_PROGRESS]: 'En Progreso',
  [APPOINTMENT_STATUS.COMPLETED]: 'Completada',
  [APPOINTMENT_STATUS.CANCELLED]: 'Cancelada',
  [APPOINTMENT_STATUS.NO_SHOW]: 'No Asistió',
};

// Colores para badges de estados
export const STATUS_COLORS = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [APPOINTMENT_STATUS.CONFIRMED]: 'bg-green-100 text-green-800 border-green-200',
  [APPOINTMENT_STATUS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [APPOINTMENT_STATUS.COMPLETED]: 'bg-gray-100 text-gray-800 border-gray-200',
  [APPOINTMENT_STATUS.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
  [APPOINTMENT_STATUS.NO_SHOW]: 'bg-orange-100 text-orange-800 border-orange-200',
};

// Iconos para estados
export const STATUS_ICONS = {
  [APPOINTMENT_STATUS.SCHEDULED]: '📅',
  [APPOINTMENT_STATUS.CONFIRMED]: '✅',
  [APPOINTMENT_STATUS.IN_PROGRESS]: '🎥',
  [APPOINTMENT_STATUS.COMPLETED]: '✔️',
  [APPOINTMENT_STATUS.CANCELLED]: '❌',
  [APPOINTMENT_STATUS.NO_SHOW]: '⚠️',
};

// ============================================
// DURACIONES DE CITAS (en minutos)
// ============================================
export const DURATION_OPTIONS = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1 hora 30 min' },
  { value: 120, label: '2 horas' },
];

// ============================================
// TIPOS DE CONSULTA
// ============================================
export const CONSULTATION_TYPES = {
  ROUTINE: 'ROUTINE',
  FOLLOW_UP: 'FOLLOW_UP',
  URGENT: 'URGENT',
  SIMULATION_REVIEW: 'SIMULATION_REVIEW',
  PROCEDURE_GUIDANCE: 'PROCEDURE_GUIDANCE',
};

export const CONSULTATION_TYPE_LABELS = {
  [CONSULTATION_TYPES.ROUTINE]: 'Consulta de Rutina',
  [CONSULTATION_TYPES.FOLLOW_UP]: 'Seguimiento',
  [CONSULTATION_TYPES.URGENT]: 'Urgente',
  [CONSULTATION_TYPES.SIMULATION_REVIEW]: 'Revisión de Simulación',
  [CONSULTATION_TYPES.PROCEDURE_GUIDANCE]: 'Orientación de Procedimiento',
};

// ============================================
// SIGNOS VITALES (MOCK DATA)
// ============================================
export const MOCK_VITAL_SIGNS = {
  heartRate: { value: 72, unit: 'bpm', range: '60-100', status: 'normal' },
  bloodPressure: { systolic: 120, diastolic: 80, unit: 'mmHg', status: 'normal' },
  oxygenSaturation: { value: 98, unit: '%', range: '>95', status: 'normal' },
  temperature: { value: 36.5, unit: '°C', range: '36-37', status: 'normal' },
  respiratoryRate: { value: 16, unit: 'rpm', range: '12-20', status: 'normal' },
};

// ============================================
// HORARIOS DE DISPONIBILIDAD
// ============================================
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

// ============================================
// HELPERS
// ============================================

/**
 * Obtener label de estado
 */
export const getStatusLabel = (status) => {
  return STATUS_LABELS[status] || 'Desconocido';
};

/**
 * Obtener color de estado
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Obtener icono de estado
 */
export const getStatusIcon = (status) => {
  return STATUS_ICONS[status] || '📋';
};

/**
 * Formatear fecha de cita (ejemplo: "Lunes 25 de Enero, 2025")
 */
export const formatAppointmentDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';

  const date = new Date(dateString);
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return date.toLocaleDateString('es-PE', options);
};

/**
 * Formatear hora de cita (ejemplo: "10:30 AM")
 */
export const formatAppointmentTime = (dateString) => {
  if (!dateString) return 'Hora no disponible';

  const date = new Date(dateString);
  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formatear fecha y hora completa (ejemplo: "25 Ene 2025, 10:30 AM")
 */
export const formatAppointmentDateTime = (dateString) => {
  if (!dateString) return 'No disponible';

  const date = new Date(dateString);
  const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

  const datePart = date.toLocaleDateString('es-PE', dateOptions);
  const timePart = date.toLocaleTimeString('es-PE', timeOptions);

  return `${datePart}, ${timePart}`;
};

/**
 * Calcular tiempo restante hasta la cita
 */
export const getTimeUntilAppointment = (scheduledAt) => {
  const now = new Date();
  const appointment = new Date(scheduledAt);
  const diff = appointment - now;

  if (diff < 0) return 'Ya pasó';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `En ${days} día${days > 1 ? 's' : ''}`;
  }

  if (hours > 0) {
    return `En ${hours}h ${minutes}min`;
  }

  return `En ${minutes} minutos`;
};

/**
 * Verificar si la cita está próxima (dentro de 24 horas)
 */
export const isAppointmentUpcoming = (scheduledAt) => {
  const now = new Date();
  const appointment = new Date(scheduledAt);
  const diff = appointment - now;

  return diff > 0 && diff < 24 * 60 * 60 * 1000;
};

/**
 * Verificar si se puede cancelar la cita
 * (al menos 2 horas antes)
 */
export const canCancelAppointment = (scheduledAt, status) => {
  if (status === APPOINTMENT_STATUS.COMPLETED || status === APPOINTMENT_STATUS.CANCELLED) {
    return false;
  }

  const now = new Date();
  const appointment = new Date(scheduledAt);
  const diff = appointment - now;

  return diff > 2 * 60 * 60 * 1000; // 2 horas en milisegundos
};

/**
 * Verificar si se puede iniciar la videollamada
 * (15 minutos antes hasta 15 minutos después)
 */
export const canStartVideoCall = (scheduledAt, status) => {
  if (status !== APPOINTMENT_STATUS.SCHEDULED && status !== APPOINTMENT_STATUS.CONFIRMED) {
    return false;
  }

  const now = new Date();
  const appointment = new Date(scheduledAt);
  const diff = appointment - now;

  const fifteenMinutes = 15 * 60 * 1000;

  return diff <= fifteenMinutes && diff >= -fifteenMinutes;
};

/**
 * Calcular hora de finalización
 */
export const calculateEndTime = (scheduledAt, duration) => {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + duration * 60 * 1000);
  return end;
};

/**
 * Formatear duración (minutos a formato legible)
 */
export const formatDuration = (minutes) => {
  if (!minutes) return 'N/A';

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;
};

/**
 * Obtener opciones de duración para select
 */
export const getDurationOptions = () => {
  return DURATION_OPTIONS;
};

/**
 * Validar datos de cita antes de agendar
 */
export const validateAppointmentData = (data) => {
  const errors = {};

  if (!data.teacherId) {
    errors.teacherId = 'Debe seleccionar un docente';
  }

  if (!data.scheduledAt) {
    errors.scheduledAt = 'Debe seleccionar fecha y hora';
  } else {
    const appointmentDate = new Date(data.scheduledAt);
    const now = new Date();

    if (appointmentDate <= now) {
      errors.scheduledAt = 'La fecha debe ser futura';
    }
  }

  if (!data.duration || data.duration < 15 || data.duration > 120) {
    errors.duration = 'Duración inválida (15-120 minutos)';
  }

  // ✅ NUEVA VALIDACIÓN MÁS FLEXIBLE
  if (!data.reason || data.reason.trim().length === 0) {
    errors.reason = 'El motivo es obligatorio';
  } else if (data.reason.trim().length < 10) {
    errors.reason = 'El motivo debe tener al menos 10 caracteres';
  } else if (data.reason.trim().length > 500) {
    errors.reason = 'El motivo no puede exceder 500 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Generar signos vitales aleatorios (MOCK)
 */
export const generateMockVitalSigns = () => {
  return {
    heartRate: {
      value: Math.floor(Math.random() * (100 - 60 + 1)) + 60,
      unit: 'bpm',
      range: '60-100',
      status: 'normal',
    },
    bloodPressure: {
      systolic: Math.floor(Math.random() * (130 - 110 + 1)) + 110,
      diastolic: Math.floor(Math.random() * (85 - 70 + 1)) + 70,
      unit: 'mmHg',
      status: 'normal',
    },
    oxygenSaturation: {
      value: Math.floor(Math.random() * (100 - 95 + 1)) + 95,
      unit: '%',
      range: '>95',
      status: 'normal',
    },
    temperature: {
      value: (Math.random() * (37.2 - 36.1) + 36.1).toFixed(1),
      unit: '°C',
      range: '36-37',
      status: 'normal',
    },
    respiratoryRate: {
      value: Math.floor(Math.random() * (20 - 12 + 1)) + 12,
      unit: 'rpm',
      range: '12-20',
      status: 'normal',
    },
  };
};

/**
 * Obtener estado de signo vital (normal, advertencia, crítico)
 */
export const getVitalSignStatus = (type, value) => {
  const ranges = {
    heartRate: { min: 60, max: 100 },
    oxygenSaturation: { min: 95, max: 100 },
    temperature: { min: 36, max: 37.5 },
    respiratoryRate: { min: 12, max: 20 },
  };

  const range = ranges[type];
  if (!range) return 'normal';

  if (value < range.min || value > range.max) {
    return 'warning';
  }

  return 'normal';
};
