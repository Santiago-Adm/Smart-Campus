/**
 * Enumeración de Estados de Citas (Teleenfermería)
 */

const AppointmentStatus = Object.freeze({
  SCHEDULED: 'SCHEDULED', // Agendada
  CONFIRMED: 'CONFIRMED', // Confirmada por ambas partes
  IN_PROGRESS: 'IN_PROGRESS', // En progreso (videollamada activa)
  COMPLETED: 'COMPLETED', // Completada
  CANCELLED: 'CANCELLED', // Cancelada
  NO_SHOW: 'NO_SHOW', // Estudiante no se presentó
});

const isValidStatus = (status) => Object.values(AppointmentStatus).includes(status);

const getAllStatuses = () => Object.values(AppointmentStatus);

const getStatusDescription = (status) => {
  const descriptions = {
    [AppointmentStatus.SCHEDULED]: 'Agendada',
    [AppointmentStatus.CONFIRMED]: 'Confirmada',
    [AppointmentStatus.IN_PROGRESS]: 'En Progreso',
    [AppointmentStatus.COMPLETED]: 'Completada',
    [AppointmentStatus.CANCELLED]: 'Cancelada',
    [AppointmentStatus.NO_SHOW]: 'No se presentó',
  };
  return descriptions[status] || 'Estado desconocido';
};

module.exports = {
  AppointmentStatus,
  isValidStatus,
  getAllStatuses,
  getStatusDescription,
};
