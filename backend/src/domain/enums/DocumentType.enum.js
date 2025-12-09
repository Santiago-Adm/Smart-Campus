/**
 * Enumeración de Tipos de Documentos
 * Define los tipos de documentos que se pueden subir
 */

const DocumentType = Object.freeze({
  DNI: 'DNI', // Documento Nacional de Identidad
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE', // Partida de Nacimiento
  ACADEMIC_CERTIFICATE: 'ACADEMIC_CERTIFICATE', // Certificado de Estudios
  MEDICAL_CERTIFICATE: 'MEDICAL_CERTIFICATE', // Certificado Médico
  RESIDENCE_PROOF: 'RESIDENCE_PROOF', // Constancia de Domicilio
  PHOTO: 'PHOTO', // Fotografía
  TRANSCRIPT: 'TRANSCRIPT', // Notas / Boleta
  DIPLOMA: 'DIPLOMA', // Diploma / Título
  OTHER: 'OTHER', // Otros documentos
});

/**
 * Validar si un tipo es válido
 */
const isValidType = (type) => Object.values(DocumentType).includes(type);

/**
 * Obtener todos los tipos
 */
const getAllTypes = () => Object.values(DocumentType);

/**
 * Obtener descripción del tipo en español
 */
const getTypeDescription = (type) => {
  const descriptions = {
    [DocumentType.DNI]: 'DNI',
    [DocumentType.BIRTH_CERTIFICATE]: 'Partida de Nacimiento',
    [DocumentType.ACADEMIC_CERTIFICATE]: 'Certificado de Estudios',
    [DocumentType.MEDICAL_CERTIFICATE]: 'Certificado Médico',
    [DocumentType.RESIDENCE_PROOF]: 'Constancia de Domicilio',
    [DocumentType.PHOTO]: 'Fotografía',
    [DocumentType.TRANSCRIPT]: 'Boleta de Notas',
    [DocumentType.DIPLOMA]: 'Diploma',
    [DocumentType.OTHER]: 'Otro',
  };
  return descriptions[type] || 'Tipo desconocido';
};

/**
 * Verificar si un tipo de documento es requerido para matrícula
 */
const isRequiredForEnrollment = (type) => {
  const requiredTypes = [
    DocumentType.DNI,
    DocumentType.BIRTH_CERTIFICATE,
    DocumentType.ACADEMIC_CERTIFICATE,
    DocumentType.MEDICAL_CERTIFICATE,
    DocumentType.PHOTO,
  ];
  return requiredTypes.includes(type);
};

module.exports = {
  DocumentType,
  isValidType,
  getAllTypes,
  getTypeDescription,
  isRequiredForEnrollment,
};
