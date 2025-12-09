import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

// Combine class names (útil para Tailwind)
export const cn = (...inputs) => {
  return clsx(inputs);
};

// Format date
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: es });
};

// Format datetime
export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

// Format relative time (hace 2 horas, hace 3 días)
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Truncate text
export const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Validate email
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validate DNI (Perú - 8 dígitos)
export const isValidDNI = (dni) => {
  const regex = /^\d{8}$/;
  return regex.test(dni);
};

// Validate phone (Perú - 9 dígitos)
export const isValidPhone = (phone) => {
  const regex = /^9\d{8}$/;
  return regex.test(phone);
};

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    PENDING: 'warning',
    IN_REVIEW: 'info',
    APPROVED: 'success',
    REJECTED: 'danger',
    SCHEDULED: 'info',
    CONFIRMED: 'success',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'danger',
    NO_SHOW: 'danger',
  };
  return colors[status] || 'info';
};

// Get role display name
export const getRoleDisplayName = (role) => {
  const names = {
    STUDENT: 'Estudiante',
    TEACHER: 'Docente',
    ADMINISTRATIVE: 'Administrativo',
    IT_ADMIN: 'Admin TI',
    DIRECTOR: 'Director',
  };
  return names[role] || role;
};

// Download file
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
