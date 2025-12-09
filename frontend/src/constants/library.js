/**
 * Constantes y helpers para el módulo de Biblioteca Virtual
 */

// ============================================
// CATEGORÍAS DE RECURSOS
// ============================================
export const RESOURCE_CATEGORIES = {
  ANATOMY: 'ANATOMY',
  PHYSIOLOGY: 'PHYSIOLOGY',
  PHARMACOLOGY: 'PHARMACOLOGY',
  PROCEDURES: 'PROCEDURES',
  ETHICS: 'ETHICS',
  EMERGENCY: 'EMERGENCY',
  PEDIATRICS: 'PEDIATRICS',
  GERIATRICS: 'GERIATRICS',
  MENTAL_HEALTH: 'MENTAL_HEALTH',
  COMMUNITY: 'COMMUNITY',
  OTHER: 'OTHER',
};

// Descripciones de categorías (español)
export const CATEGORY_LABELS = {
  [RESOURCE_CATEGORIES.ANATOMY]: 'Anatomía',
  [RESOURCE_CATEGORIES.PHYSIOLOGY]: 'Fisiología',
  [RESOURCE_CATEGORIES.PHARMACOLOGY]: 'Farmacología',
  [RESOURCE_CATEGORIES.PROCEDURES]: 'Procedimientos',
  [RESOURCE_CATEGORIES.ETHICS]: 'Ética',
  [RESOURCE_CATEGORIES.EMERGENCY]: 'Emergencias',
  [RESOURCE_CATEGORIES.PEDIATRICS]: 'Pediatría',
  [RESOURCE_CATEGORIES.GERIATRICS]: 'Geriatría',
  [RESOURCE_CATEGORIES.MENTAL_HEALTH]: 'Salud Mental',
  [RESOURCE_CATEGORIES.COMMUNITY]: 'Enfermería Comunitaria',
  [RESOURCE_CATEGORIES.OTHER]: 'Otros',
};

// Colores para badges de categorías
export const CATEGORY_COLORS = {
  [RESOURCE_CATEGORIES.ANATOMY]: 'bg-red-100 text-red-800',
  [RESOURCE_CATEGORIES.PHYSIOLOGY]: 'bg-blue-100 text-blue-800',
  [RESOURCE_CATEGORIES.PHARMACOLOGY]: 'bg-green-100 text-green-800',
  [RESOURCE_CATEGORIES.PROCEDURES]: 'bg-yellow-100 text-yellow-800',
  [RESOURCE_CATEGORIES.ETHICS]: 'bg-purple-100 text-purple-800',
  [RESOURCE_CATEGORIES.EMERGENCY]: 'bg-red-100 text-red-800',
  [RESOURCE_CATEGORIES.PEDIATRICS]: 'bg-pink-100 text-pink-800',
  [RESOURCE_CATEGORIES.GERIATRICS]: 'bg-indigo-100 text-indigo-800',
  [RESOURCE_CATEGORIES.MENTAL_HEALTH]: 'bg-teal-100 text-teal-800',
  [RESOURCE_CATEGORIES.COMMUNITY]: 'bg-cyan-100 text-cyan-800',
  [RESOURCE_CATEGORIES.OTHER]: 'bg-gray-100 text-gray-800',
};

// ============================================
// TIPOS DE RECURSOS
// ============================================
export const RESOURCE_TYPES = {
  BOOK: 'book',
  ARTICLE: 'article',
  VIDEO: 'video',
  GUIDE: 'guide',
  CASE_STUDY: 'case_study',
};

export const RESOURCE_TYPE_LABELS = {
  [RESOURCE_TYPES.BOOK]: 'Libro',
  [RESOURCE_TYPES.ARTICLE]: 'Artículo',
  [RESOURCE_TYPES.VIDEO]: 'Video',
  [RESOURCE_TYPES.GUIDE]: 'Guía',
  [RESOURCE_TYPES.CASE_STUDY]: 'Caso de Estudio',
};

export const RESOURCE_TYPE_ICONS = {
  [RESOURCE_TYPES.BOOK]: '📚',
  [RESOURCE_TYPES.ARTICLE]: '📄',
  [RESOURCE_TYPES.VIDEO]: '🎥',
  [RESOURCE_TYPES.GUIDE]: '📖',
  [RESOURCE_TYPES.CASE_STUDY]: '📋',
};

// ============================================
// IDIOMAS
// ============================================
export const LANGUAGES = {
  ES: 'es',
  EN: 'en',
  PT: 'pt',
  QU: 'qu',
};

export const LANGUAGE_LABELS = {
  [LANGUAGES.ES]: 'Español',
  [LANGUAGES.EN]: 'Inglés',
  [LANGUAGES.PT]: 'Portugués',
  [LANGUAGES.QU]: 'Quechua',
};

// ============================================
// ESTRATEGIAS DE RECOMENDACIÓN
// ============================================
export const RECOMMENDATION_STRATEGIES = {
  POPULAR: 'popular',
  RATING: 'rating',
  PERSONALIZED: 'personalized',
};

export const RECOMMENDATION_STRATEGY_LABELS = {
  [RECOMMENDATION_STRATEGIES.POPULAR]: 'Más Populares',
  [RECOMMENDATION_STRATEGIES.RATING]: 'Mejor Valorados',
  [RECOMMENDATION_STRATEGIES.PERSONALIZED]: 'Personalizadas',
};

// ============================================
// ACCIONES DE TRACKING
// ============================================
export const TRACK_ACTIONS = {
  VIEW: 'view',
  DOWNLOAD: 'download',
  RATE: 'rate',
};

// ============================================
// OPCIONES DE ORDENAMIENTO
// ============================================
export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Más Recientes' },
  { value: 'popular', label: 'Más Populares' },
  { value: 'rating', label: 'Mejor Valorados' },
  { value: 'title', label: 'Título (A-Z)' },
  { value: 'viewCount', label: 'Más Vistos' },
  { value: 'downloadCount', label: 'Más Descargados' },
];

// ============================================
// HELPERS
// ============================================

/**
 * Obtener label de categoría
 */
export const getCategoryLabel = (category) => {
  return CATEGORY_LABELS[category] || 'Desconocida';
};

/**
 * Obtener color de categoría
 */
export const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800';
};

/**
 * Obtener label de tipo de recurso
 */
export const getResourceTypeLabel = (type) => {
  return RESOURCE_TYPE_LABELS[type] || 'Desconocido';
};

/**
 * Obtener icono de tipo de recurso
 */
export const getResourceTypeIcon = (type) => {
  return RESOURCE_TYPE_ICONS[type] || '📄';
};

/**
 * Obtener label de idioma
 */
export const getLanguageLabel = (language) => {
  return LANGUAGE_LABELS[language] || 'Desconocido';
};

/**
 * Formatear tamaño de archivo
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formatear duración de video (segundos a mm:ss)
 */
export const formatDuration = (seconds) => {
  if (!seconds) return 'N/A';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

/**
 * Formatear rating (mostrar estrellas)
 */
export const formatRating = (rating) => {
  if (!rating) return '0.0';
  return rating.toFixed(1);
};

/**
 * Obtener array de categorías para select
 */
export const getCategoryOptions = () => {
  return Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
};

/**
 * Obtener array de tipos para select
 */
export const getTypeOptions = () => {
  return Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
};

/**
 * Obtener array de idiomas para select
 */
export const getLanguageOptions = () => {
  return Object.entries(LANGUAGE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
};

/**
 * Verificar si un archivo es válido
 */
export const isValidFileType = (mimeType, resourceType) => {
  const allowedTypes = {
    [RESOURCE_TYPES.BOOK]: ['application/pdf'],
    [RESOURCE_TYPES.ARTICLE]: ['application/pdf'],
    [RESOURCE_TYPES.VIDEO]: ['video/mp4', 'video/webm', 'video/ogg'],
    [RESOURCE_TYPES.GUIDE]: ['application/pdf'],
    [RESOURCE_TYPES.CASE_STUDY]: ['application/pdf'],
  };

  const allowed = allowedTypes[resourceType] || [];
  return allowed.includes(mimeType);
};

/**
 * Obtener tipos de archivo permitidos por tipo de recurso
 */
export const getAllowedFileTypes = (resourceType) => {
  const allowedTypes = {
    [RESOURCE_TYPES.BOOK]: ['.pdf'],
    [RESOURCE_TYPES.ARTICLE]: ['.pdf'],
    [RESOURCE_TYPES.VIDEO]: ['.mp4', '.webm', '.ogg'],
    [RESOURCE_TYPES.GUIDE]: ['.pdf'],
    [RESOURCE_TYPES.CASE_STUDY]: ['.pdf'],
  };

  return allowedTypes[resourceType] || [];
};
