/**
 * Constantes para el módulo de Analytics
 */

// Tipos de reportes disponibles
export const REPORT_TYPES = {
  ENROLLMENT: {
    id: 'enrollment',
    name: 'Matrícula',
    description: 'Reporte de estudiantes matriculados y estadísticas',
    icon: '👥',
  },
  ACADEMIC_PERFORMANCE: {
    id: 'academic_performance',
    name: 'Desempeño Académico',
    description: 'Métricas de simulaciones y rendimiento',
    icon: '📊',
  },
  LIBRARY_USAGE: {
    id: 'library_usage',
    name: 'Uso de Biblioteca',
    description: 'Estadísticas de recursos consultados',
    icon: '📚',
  },
  APPOINTMENTS: {
    id: 'appointments',
    name: 'Citas de Teleenfermería',
    description: 'Análisis de consultas y supervisiones',
    icon: '🏥',
  },
  SIMULATIONS: {
    id: 'simulations',
    name: 'Simulaciones AR',
    description: 'Métricas de experiencias inmersivas',
    icon: '🥽',
  },
  GENERAL: {
    id: 'general',
    name: 'Reporte General',
    description: 'Vista global del sistema',
    icon: '📈',
  },
};

// Formatos de exportación
export const REPORT_FORMATS = {
  PDF: { id: 'PDF', name: 'PDF', icon: '📄' },
  EXCEL: { id: 'EXCEL', name: 'Excel', icon: '📊' },
};

// Severidades de alertas
export const ALERT_SEVERITY = {
  CRITICAL: { color: 'red', label: 'Crítico', icon: '🔴' },
  HIGH: { color: 'orange', label: 'Alto', icon: '🟠' },
  MEDIUM: { color: 'yellow', label: 'Medio', icon: '🟡' },
  LOW: { color: 'blue', label: 'Bajo', icon: '🔵' },
};

// Categorías de alertas
export const ALERT_CATEGORIES = {
  USERS: { label: 'Usuarios', icon: '👤' },
  DOCUMENTS: { label: 'Documentos', icon: '📄' },
  APPOINTMENTS: { label: 'Citas', icon: '📅' },
  ACADEMIC: { label: 'Académico', icon: '🎓' },
};

// Colores para gráficos (paleta consistente)
export const CHART_COLORS = {
  primary: '#6366f1',     // Indigo
  secondary: '#8b5cf6',   // Purple
  success: '#10b981',     // Green
  warning: '#f59e0b',     // Amber
  danger: '#ef4444',      // Red
  info: '#3b82f6',        // Blue
  gray: '#6b7280',        // Gray
};

// Rangos de fechas predefinidos
export const DATE_RANGES = {
  TODAY: { label: 'Hoy', days: 0 },
  LAST_7_DAYS: { label: 'Últimos 7 días', days: 7 },
  LAST_30_DAYS: { label: 'Últimos 30 días', days: 30 },
  LAST_90_DAYS: { label: 'Últimos 90 días', days: 90 },
  THIS_MONTH: { label: 'Este mes', type: 'month' },
  LAST_MONTH: { label: 'Mes pasado', type: 'month', offset: -1 },
  THIS_YEAR: { label: 'Este año', type: 'year' },
  CUSTOM: { label: 'Personalizado', type: 'custom' },
};

// Helpers para formatear valores
export const formatNumber = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

export const formatPercentage = (value) => {
  return `${parseFloat(value).toFixed(1)}%`;
};

export const formatDuration = (minutes) => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  return `${minutes}m`;
};
