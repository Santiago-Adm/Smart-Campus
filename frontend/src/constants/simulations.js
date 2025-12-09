/**
 * Constants y Helpers para Simulations Module
 * Valores centralizados para categorías, dificultades, iconos y formatters
 */

import {
  Syringe,
  Heart,
  Droplet,
  Cross,
  Stethoscope,
  Activity,
  Settings,
} from 'lucide-react';

// ============================================
// CATEGORÍAS DE ESCENARIOS
// ============================================

export const SCENARIO_CATEGORIES = {
  VENOPUNCION: 'venopuncion',
  RCP: 'rcp',
  CATETERISMO: 'cateterismo',
  CURACION: 'curacion',
  INYECCION: 'inyeccion',
  SIGNOS_VITALES: 'signos_vitales',
  OTROS: 'otros',
};

/**
 * Obtener label legible de categoría
 */
export const getScenarioCategoryLabel = (category) => {
  const labels = {
    venopuncion: 'Venopunción',
    rcp: 'RCP (Reanimación)',
    cateterismo: 'Cateterismo',
    curacion: 'Curación de Heridas',
    inyeccion: 'Inyección',
    signos_vitales: 'Signos Vitales',
    otros: 'Otros',
  };

  return labels[category] || category;
};

/**
 * Obtener ícono por categoría
 */
export const getScenarioCategoryIcon = (category) => {
  const icons = {
    venopuncion: Syringe,
    rcp: Heart,
    cateterismo: Droplet,
    curacion: Cross,
    inyeccion: Syringe,
    signos_vitales: Activity,
    otros: Settings,
  };

  return icons[category] || Settings;
};

/**
 * Obtener emoji por categoría
 */
export const getScenarioCategoryEmoji = (category) => {
  const emojis = {
    venopuncion: '💉',
    rcp: '❤️',
    cateterismo: '💧',
    curacion: '🩹',
    inyeccion: '💉',
    signos_vitales: '📊',
    otros: '⚙️',
  };

  return emojis[category] || '⚙️';
};

/**
 * Obtener color de categoría
 */
export const getScenarioCategoryColor = (category) => {
  const colors = {
    venopuncion: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      hover: 'hover:bg-red-200',
    },
    rcp: {
      bg: 'bg-pink-100',
      text: 'text-pink-700',
      border: 'border-pink-300',
      hover: 'hover:bg-pink-200',
    },
    cateterismo: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-300',
      hover: 'hover:bg-blue-200',
    },
    curacion: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
      hover: 'hover:bg-green-200',
    },
    inyeccion: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-300',
      hover: 'hover:bg-orange-200',
    },
    signos_vitales: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-300',
      hover: 'hover:bg-purple-200',
    },
    otros: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
      hover: 'hover:bg-gray-200',
    },
  };

  return colors[category] || colors.otros;
};

// ============================================
// NIVELES DE DIFICULTAD
// ============================================

export const SCENARIO_DIFFICULTIES = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

/**
 * Obtener label legible de dificultad
 */
export const getScenarioDifficultyLabel = (difficulty) => {
  const labels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };

  return labels[difficulty] || difficulty;
};

/**
 * Obtener color de dificultad
 */
export const getScenarioDifficultyColor = (difficulty) => {
  const colors = {
    beginner: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
      dot: 'bg-green-500',
    },
    intermediate: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300',
      dot: 'bg-yellow-500',
    },
    advanced: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      dot: 'bg-red-500',
    },
  };

  return colors[difficulty] || colors.beginner;
};

/**
 * Obtener número de estrellas por dificultad
 */
export const getScenarioDifficultyStars = (difficulty) => {
  const stars = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
  };

  return stars[difficulty] || 1;
};

// ============================================
// FORMATTERS
// ============================================

/**
 * Formatear duración en minutos
 * @param {number} minutes - Duración en minutos
 * @returns {string} Duración formateada
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '0 min';

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Formatear score (0-100)
 * @param {number} score - Score del 0 al 100
 * @returns {string} Score formateado
 */
export const formatScore = (score) => {
  if (score === null || score === undefined) return 'N/A';
  return `${Math.round(score)}%`;
};

/**
 * Obtener color según score
 * @param {number} score - Score del 0 al 100
 * @returns {string} Clase CSS de color
 */
export const getScoreColor = (score) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 50) return 'text-orange-600';
  return 'text-red-600';
};

/**
 * Obtener color de barra según score
 * @param {number} score - Score del 0 al 100
 * @returns {string} Clase CSS de color de barra
 */
export const getScoreBarColor = (score) => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 75) return 'bg-blue-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 50) return 'bg-orange-500';
  return 'bg-red-500';
};

/**
 * Formatear número de completaciones
 * @param {number} count - Número de completaciones
 * @returns {string} Completaciones formateadas
 */
export const formatCompletionCount = (count) => {
  if (!count || count === 0) return '0 veces';
  if (count === 1) return '1 vez';
  if (count < 1000) return `${count} veces`;

  return `${(count / 1000).toFixed(1)}k veces`;
};

/**
 * Formatear número de pasos
 * @param {number} stepCount - Número de pasos
 * @returns {string} Pasos formateados
 */
export const formatStepCount = (stepCount) => {
  if (!stepCount || stepCount === 0) return '0 pasos';
  if (stepCount === 1) return '1 paso';
  return `${stepCount} pasos`;
};

// ============================================
// OPCIONES PARA FILTROS
// ============================================

/**
 * Opciones de categoría para filtros
 */
export const CATEGORY_OPTIONS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'venopuncion', label: 'Venopunción' },
  { value: 'rcp', label: 'RCP (Reanimación)' },
  { value: 'cateterismo', label: 'Cateterismo' },
  { value: 'curacion', label: 'Curación de Heridas' },
  { value: 'inyeccion', label: 'Inyección' },
  { value: 'signos_vitales', label: 'Signos Vitales' },
  { value: 'otros', label: 'Otros' },
];

/**
 * Opciones de dificultad para filtros
 */
export const DIFFICULTY_OPTIONS = [
  { value: '', label: 'Todas las dificultades' },
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

/**
 * Opciones de ordenamiento
 */
export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Más Recientes' },
  { value: 'title', label: 'Nombre (A-Z)' },
  { value: 'difficulty', label: 'Dificultad' },
  { value: 'popular', label: 'Más Populares' },
  { value: 'averageScore', label: 'Mejor Calificados' },
];

// ============================================
// ESTADOS DE SIMULACIÓN
// ============================================

export const SIMULATION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

/**
 * Obtener label de estado de simulación
 */
export const getSimulationStatusLabel = (status) => {
  const labels = {
    not_started: 'No iniciado',
    in_progress: 'En progreso',
    paused: 'Pausado',
    completed: 'Completado',
    failed: 'Fallido',
  };

  return labels[status] || status;
};

/**
 * Obtener color de estado de simulación
 */
export const getSimulationStatusColor = (status) => {
  const colors = {
    not_started: 'text-gray-600 bg-gray-100',
    in_progress: 'text-blue-600 bg-blue-100',
    paused: 'text-yellow-600 bg-yellow-100',
    completed: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
  };

  return colors[status] || colors.not_started;
};

// ============================================
// VALIDACIONES
// ============================================

/**
 * Validar categoría
 */
export const isValidCategory = (category) => {
  return Object.values(SCENARIO_CATEGORIES).includes(category);
};

/**
 * Validar dificultad
 */
export const isValidDifficulty = (difficulty) => {
  return Object.values(SCENARIO_DIFFICULTIES).includes(difficulty);
};

/**
 * Validar duración
 */
export const isValidDuration = (duration) => {
  return duration >= 5 && duration <= 120;
};

/**
 * Validar archivo de modelo 3D
 */
export const validateModelFile = (file) => {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'El modelo 3D no puede superar los 50MB',
    };
  }

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
 */
export const validateThumbnailFile = (file) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'La imagen no puede superar los 5MB',
    };
  }

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
 */
export const createScenarioFormData = (scenarioData, modelFile, thumbnailFile = null) => {
  const formData = new FormData();

  // Campos obligatorios
  formData.append('title', scenarioData.title);
  formData.append('category', scenarioData.category);
  formData.append('difficulty', scenarioData.difficulty);

  // Archivos
  if (modelFile) {
    formData.append('model', modelFile);
  }

  if (thumbnailFile) {
    formData.append('thumbnail', thumbnailFile);
  }

  // Campos opcionales
  if (scenarioData.description) {
    formData.append('description', scenarioData.description);
  }

  // Steps (JSON string)
  if (scenarioData.steps && scenarioData.steps.length > 0) {
    formData.append('steps', JSON.stringify(scenarioData.steps));
  }

  // Criteria (JSON string)
  if (scenarioData.criteria && scenarioData.criteria.length > 0) {
    formData.append('criteria', JSON.stringify(scenarioData.criteria));
  }

  // Duración
  if (scenarioData.estimatedDuration) {
    formData.append('estimatedDuration', String(scenarioData.estimatedDuration));
  }

  // isPublic
  if (scenarioData.isPublic !== undefined) {
    const isPublicValue = scenarioData.isPublic === true ? 'true' : 'false';
    formData.append('isPublic', isPublicValue);
  } else {
    formData.append('isPublic', 'true');
  }

  return formData;
};

/**
 * Formatear tiempo en formato legible
 * @param {number} seconds - Segundos totales
 * @returns {string} Tiempo formateado (ej: "5:23", "1h 15m")
 */
export const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Obtener emoji según score
 * @param {number} score - Score de 0 a 100
 * @returns {string} Emoji
 */
export const getScoreEmoji = (score) => {
  if (score >= 90) return '🏆';
  if (score >= 75) return '🎉';
  if (score >= 60) return '👍';
  if (score >= 50) return '💪';
  return '📚';
};

/**
 * Obtener texto de feedback según score
 * @param {number} score - Score de 0 a 100
 * @returns {string} Texto de feedback
 */
export const getScoreFeedback = (score) => {
  if (score >= 90) return 'Excelente';
  if (score >= 75) return 'Muy bien';
  if (score >= 60) return 'Buen intento';
  if (score >= 50) return 'Puede mejorar';
  return 'Sigue practicando';
};

/**
 * Validar datos de escenario
 */
export const validateScenarioData = (scenarioData) => {
  const errors = [];

  if (!scenarioData.title || scenarioData.title.trim().length < 5) {
    errors.push('El título debe tener al menos 5 caracteres');
  }

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

  const validDifficulties = ['beginner', 'intermediate', 'advanced'];
  if (!validDifficulties.includes(scenarioData.difficulty)) {
    errors.push('Dificultad no válida');
  }

  if (!scenarioData.steps || scenarioData.steps.length === 0) {
    errors.push('El escenario debe tener al menos un paso');
  }

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

// ============================================
// DEFAULTS
// ============================================

export const DEFAULT_FILTERS = {
  search: '',
  category: '',
  difficulty: '',
  isPublic: null,
  sortBy: 'createdAt',
  page: 1,
  limit: 20,
};

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

// ============================================
// EXPORT DEFAULT
// ============================================

const simulationsConstants = {
  // Categorías
  SCENARIO_CATEGORIES,
  getScenarioCategoryLabel,
  getScenarioCategoryIcon,
  getScenarioCategoryEmoji,
  getScenarioCategoryColor,

  // Dificultades
  SCENARIO_DIFFICULTIES,
  getScenarioDifficultyLabel,
  getScenarioDifficultyColor,
  getScenarioDifficultyStars,

  // Formatters
  formatDuration,
  formatScore,
  getScoreColor,
  getScoreBarColor,
  formatCompletionCount,
  formatStepCount,

  // Opciones
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  SORT_OPTIONS,

  // Estados
  SIMULATION_STATUS,
  getSimulationStatusLabel,
  getSimulationStatusColor,

  // Validaciones
  isValidCategory,
  isValidDifficulty,
  isValidDuration,

  // Defaults
  DEFAULT_FILTERS,
  DEFAULT_PAGINATION,

  // ✅ AGREGAR ESTAS LÍNEAS:
  validateModelFile,
  validateThumbnailFile,
  validateScenarioData,
  createScenarioFormData,
};

export default simulationsConstants;
