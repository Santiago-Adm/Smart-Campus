/**
 * Enumeración de Categorías de Recursos (Biblioteca Virtual)
 */

const ResourceCategory = Object.freeze({
  ANATOMY: 'ANATOMY', // Anatomía
  PHYSIOLOGY: 'PHYSIOLOGY', // Fisiología
  PHARMACOLOGY: 'PHARMACOLOGY', // Farmacología
  PROCEDURES: 'PROCEDURES', // Procedimientos
  ETHICS: 'ETHICS', // Ética
  EMERGENCY: 'EMERGENCY', // Emergencias
  PEDIATRICS: 'PEDIATRICS', // Pediatría
  GERIATRICS: 'GERIATRICS', // Geriatría
  MENTAL_HEALTH: 'MENTAL_HEALTH', // Salud Mental
  COMMUNITY: 'COMMUNITY', // Enfermería Comunitaria
  OTHER: 'OTHER', // Otros
});

const isValidCategory = (category) => Object.values(ResourceCategory).includes(category);

const getAllCategories = () => Object.values(ResourceCategory);

const getCategoryDescription = (category) => {
  const descriptions = {
    [ResourceCategory.ANATOMY]: 'Anatomía',
    [ResourceCategory.PHYSIOLOGY]: 'Fisiología',
    [ResourceCategory.PHARMACOLOGY]: 'Farmacología',
    [ResourceCategory.PROCEDURES]: 'Procedimientos',
    [ResourceCategory.ETHICS]: 'Ética',
    [ResourceCategory.EMERGENCY]: 'Emergencias',
    [ResourceCategory.PEDIATRICS]: 'Pediatría',
    [ResourceCategory.GERIATRICS]: 'Geriatría',
    [ResourceCategory.MENTAL_HEALTH]: 'Salud Mental',
    [ResourceCategory.COMMUNITY]: 'Enfermería Comunitaria',
    [ResourceCategory.OTHER]: 'Otros',
  };
  return descriptions[category] || 'Categoría desconocida';
};

module.exports = {
  ResourceCategory,
  isValidCategory,
  getAllCategories,
  getCategoryDescription,
};
