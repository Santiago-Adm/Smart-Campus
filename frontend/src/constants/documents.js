/**
 * Estados de documentos
 */
export const DOCUMENT_STATUS = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

/**
 * Descripciones de estados en español
 */
export const DOCUMENT_STATUS_LABELS = {
  [DOCUMENT_STATUS.PENDING]: 'Pendiente',
  [DOCUMENT_STATUS.IN_REVIEW]: 'En Revisión',
  [DOCUMENT_STATUS.APPROVED]: 'Aprobado',
  [DOCUMENT_STATUS.REJECTED]: 'Rechazado',
};

/**
 * Colores de estados (para badges)
 */
export const DOCUMENT_STATUS_COLORS = {
  [DOCUMENT_STATUS.PENDING]: 'warning',
  [DOCUMENT_STATUS.IN_REVIEW]: 'info',
  [DOCUMENT_STATUS.APPROVED]: 'success',
  [DOCUMENT_STATUS.REJECTED]: 'danger',
};

/**
 * Tipos de documentos
 */
export const DOCUMENT_TYPES = {
  DNI: 'DNI',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  ACADEMIC_CERTIFICATE: 'ACADEMIC_CERTIFICATE',
  MEDICAL_CERTIFICATE: 'MEDICAL_CERTIFICATE',
  RESIDENCE_PROOF: 'RESIDENCE_PROOF',
  PHOTO: 'PHOTO',
  TRANSCRIPT: 'TRANSCRIPT',
  DIPLOMA: 'DIPLOMA',
  OTHER: 'OTHER',
};

/**
 * Descripciones de tipos en español
 */
export const DOCUMENT_TYPE_LABELS = {
  [DOCUMENT_TYPES.DNI]: 'DNI',
  [DOCUMENT_TYPES.BIRTH_CERTIFICATE]: 'Partida de Nacimiento',
  [DOCUMENT_TYPES.ACADEMIC_CERTIFICATE]: 'Certificado de Estudios',
  [DOCUMENT_TYPES.MEDICAL_CERTIFICATE]: 'Certificado Médico',
  [DOCUMENT_TYPES.RESIDENCE_PROOF]: 'Constancia de Domicilio',
  [DOCUMENT_TYPES.PHOTO]: 'Fotografía',
  [DOCUMENT_TYPES.TRANSCRIPT]: 'Boleta de Notas',
  [DOCUMENT_TYPES.DIPLOMA]: 'Diploma',
  [DOCUMENT_TYPES.OTHER]: 'Otro',
};

/**
 * Tipos de archivo permitidos
 */
export const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

/**
 * Tamaño máximo de archivo (50MB)
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Obtener extensiones permitidas como string
 */
export const getAllowedExtensions = () => {
  return Object.values(ALLOWED_FILE_TYPES).flat().join(', ');
};

/**
 * Validar tipo de archivo
 */
export const isValidFileType = (mimeType) => {
  return Object.keys(ALLOWED_FILE_TYPES).includes(mimeType);
};

/**
 * Validar tamaño de archivo
 */
export const isValidFileSize = (size) => {
  return size <= MAX_FILE_SIZE;
};

/**
 * Formatear tamaño de archivo
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
