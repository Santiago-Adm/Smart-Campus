// API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Smart Campus Instituto';

// User Roles
export const USER_ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMINISTRATIVE: 'ADMINISTRATIVE',
  IT_ADMIN: 'IT_ADMIN',
  DIRECTOR: 'DIRECTOR',
};

// Document Status
export const DOCUMENT_STATUS = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// Document Types
export const DOCUMENT_TYPES = {
  DNI: 'DNI',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  ACADEMIC_CERTIFICATE: 'ACADEMIC_CERTIFICATE',
  MEDICAL_CERTIFICATE: 'MEDICAL_CERTIFICATE',
  RESIDENCE_PROOF: 'RESIDENCE_PROOF',
  PHOTO: 'PHOTO',
  OTHER: 'OTHER',
};

// Resource Categories
export const RESOURCE_CATEGORIES = {
  ANATOMY: 'ANATOMY',
  PHYSIOLOGY: 'PHYSIOLOGY',
  PHARMACOLOGY: 'PHARMACOLOGY',
  PROCEDURES: 'PROCEDURES',
  ETHICS: 'ETHICS',
  OTHER: 'OTHER',
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Date Formats
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm';

// File Upload
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', ...ALLOWED_IMAGE_TYPES];

// Toast Duration
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 4000,
};
