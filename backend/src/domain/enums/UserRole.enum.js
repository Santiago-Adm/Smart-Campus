/**
 * Enumeración de Roles de Usuario
 * Define los 5 roles del sistema según la matriz RBAC
 */

const UserRole = Object.freeze({
  STUDENT: 'STUDENT', // Estudiante
  TEACHER: 'TEACHER', // Docente
  ADMINISTRATIVE: 'ADMINISTRATIVE', // Administrativo (Secretaría/Matrícula)
  IT_ADMIN: 'IT_ADMIN', // Administrador TI / Soporte
  DIRECTOR: 'DIRECTOR', // Director Académico / Dirección
});

/**
 * Validar si un rol es válido
 */
const isValidRole = (role) => Object.values(UserRole).includes(role);

/**
 * Obtener todos los roles
 */
const getAllRoles = () => Object.values(UserRole);

/**
 * Obtener descripción del rol en español
 */
const getRoleDescription = (role) => {
  const descriptions = {
    [UserRole.STUDENT]: 'Estudiante',
    [UserRole.TEACHER]: 'Docente',
    [UserRole.ADMINISTRATIVE]: 'Administrativo',
    [UserRole.IT_ADMIN]: 'Administrador TI',
    [UserRole.DIRECTOR]: 'Director',
  };
  return descriptions[role] || 'Rol desconocido';
};

module.exports = {
  UserRole,
  isValidRole,
  getAllRoles,
  getRoleDescription,
};
