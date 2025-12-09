/**
 * Enumeración de Estados de Documentos
 * Define el ciclo de vida de un documento en el sistema
 */

const DocumentStatus = Object.freeze({
  PENDING: 'PENDING', // Pendiente de revisión
  IN_REVIEW: 'IN_REVIEW', // En revisión por administrativo
  APPROVED: 'APPROVED', // Aprobado
  REJECTED: 'REJECTED', // Rechazado (con motivo)
});

/**
 * Validar si un estado es válido
 */
const isValidStatus = (status) => Object.values(DocumentStatus).includes(status);

/**
 * Obtener todos los estados
 */
const getAllStatuses = () => Object.values(DocumentStatus);

/**
 * Obtener descripción del estado en español
 */
const getStatusDescription = (status) => {
  const descriptions = {
    [DocumentStatus.PENDING]: 'Pendiente',
    [DocumentStatus.IN_REVIEW]: 'En Revisión',
    [DocumentStatus.APPROVED]: 'Aprobado',
    [DocumentStatus.REJECTED]: 'Rechazado',
  };
  return descriptions[status] || 'Estado desconocido';
};

/**
 * Verificar si se puede transicionar de un estado a otro
 */
const canTransition = (fromStatus, toStatus) => {
  const validTransitions = {
    [DocumentStatus.PENDING]: [DocumentStatus.IN_REVIEW, DocumentStatus.REJECTED],
    [DocumentStatus.IN_REVIEW]: [DocumentStatus.APPROVED, DocumentStatus.REJECTED],
    [DocumentStatus.APPROVED]: [], // Estado final
    [DocumentStatus.REJECTED]: [DocumentStatus.PENDING], // Puede volver a subir
  };

  return validTransitions[fromStatus]?.includes(toStatus) || false;
};

module.exports = {
  DocumentStatus,
  isValidStatus,
  getAllStatuses,
  getStatusDescription,
  canTransition,
};
