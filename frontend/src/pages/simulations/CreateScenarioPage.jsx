/**
 * Página: CreateScenario
 * Formulario completo para crear nuevos escenarios AR
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  FileType,
  Save,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  validateModelFile,
  validateThumbnailFile,
  validateScenarioData,
  createScenarioFormData,
} from '../../constants/simulations';
import simulationsService from '../../services/simulationsService';

const CreateScenarioPage = () => {
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    estimatedDuration: 15,
    isPublic: true,
    steps: [{ title: '', description: '' }],
  });

  // Archivos
  const [modelFile, setModelFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [modelPreview, setModelPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);

  /**
   * Manejar cambios en campos del formulario
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Limpiar error del campo
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  /**
   * Manejar cambios en pasos
   */
  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index][field] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  /**
   * Agregar nuevo paso
   */
  const handleAddStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { title: '', description: '' }],
    });
  };

  /**
   * Eliminar paso
   */
  const handleRemoveStep = (index) => {
    if (formData.steps.length === 1) {
      alert('Debe haber al menos un paso');
      return;
    }

    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  /**
   * Manejar upload de modelo 3D
   */
  const handleModelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateModelFile(file);
    if (!validation.valid) {
      setErrors({ ...errors, model: validation.error });
      return;
    }

    setModelFile(file);
    setModelPreview(file.name);
    setErrors({ ...errors, model: null });
  };

  /**
   * Manejar upload de thumbnail
   */
  const handleThumbnailUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateThumbnailFile(file);
    if (!validation.valid) {
      setErrors({ ...errors, thumbnail: validation.error });
      return;
    }

    setThumbnailFile(file);

    // Preview de imagen
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setErrors({ ...errors, thumbnail: null });
  };

  /**
   * Remover modelo
   */
  const handleRemoveModel = () => {
    setModelFile(null);
    setModelPreview(null);
  };

  /**
   * Remover thumbnail
   */
  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};

    // Validar campos obligatorios
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (formData.title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es obligatoria';
    }

    if (!formData.difficulty) {
      newErrors.difficulty = 'La dificultad es obligatoria';
    }

    if (!formData.estimatedDuration || formData.estimatedDuration < 5) {
      newErrors.estimatedDuration = 'La duración debe ser al menos 5 minutos';
    }

    // Validar pasos
    formData.steps.forEach((step, index) => {
      if (!step.title.trim()) {
        newErrors[`step_${index}_title`] = 'El título del paso es obligatorio';
      }
      if (!step.description.trim()) {
        newErrors[`step_${index}_description`] = 'La descripción del paso es obligatoria';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

/**
 * Enviar formulario
 */
const handleSubmit = async (e) => {
  e.preventDefault();

  // Validar
  if (!validateForm()) {
    setSubmitError('Por favor, corrige los errores del formulario');
    toast.error('Hay errores en el formulario');
    return;
  }

  // ✅ Crear toast de loading persistente
  const loadingToast = toast.loading('Creando escenario...', {
    duration: Infinity, // No se cierra automáticamente
  });

  try {
    setLoading(true);
    setSubmitError(null);

    console.log('📤 Creating scenario with data:', formData);

    // Crear FormData
    const formDataToSend = createScenarioFormData(formData, modelFile, thumbnailFile);

    // Enviar al backend
    const response = await simulationsService.createScenario(formDataToSend);

    console.log('✅ Scenario created:', response);

    if (response.success && response.scenario) {
      // ✅ Cerrar loading y mostrar success
      toast.success('¡Escenario creado exitosamente!', {
        id: loadingToast, // Reemplaza el toast de loading
        duration: 2000,
      });

      // ✅ Navegar automáticamente después de 1 segundo
      setTimeout(() => {
        navigate(`/simulations/${response.scenario.id}`);
      }, 1000);
    } else {
      // ❌ Error del backend
      toast.error(response.message || 'Error al crear el escenario', {
        id: loadingToast,
        duration: 4000,
      });
      setSubmitError(response.message || 'Error al crear el escenario');
    }
  } catch (err) {
    console.error('❌ Error creating scenario:', err);

    const errorMessage =
      err.response?.data?.message || 'Error al crear el escenario. Intenta nuevamente.';

    // ❌ Cerrar loading y mostrar error
    toast.error(errorMessage, {
      id: loadingToast,
      duration: 4000,
    });

    setSubmitError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  /**
   * Cancelar y volver
   */
  const handleCancel = () => {
    // Verificar si hay cambios
    const hasChanges =
      formData.title.trim() !== '' ||
      formData.description.trim() !== '' ||
      formData.category !== '' ||
      formData.difficulty !== '' ||
      formData.steps.some(step => step.title.trim() !== '' || step.description.trim() !== '') ||
      modelFile !== null ||
      thumbnailFile !== null;

    if (hasChanges) {
      // ✅ Mostrar modal en vez de window.confirm
      setShowCancelModal(true);
    } else {
      navigate('/simulations');
    }
  };

  /**
   * Confirmar cancelación
   */
  const confirmCancel = () => {
    navigate('/simulations');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Cancelar</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Escenario</h1>
          <p className="text-gray-600 mt-2">
            Completa el formulario para crear un nuevo escenario de simulación AR
          </p>
          {/* Modal de confirmación */}
          <ConfirmModal
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            onConfirm={confirmCancel}
            title="¿Cancelar creación?"
            message="Se perderán todos los cambios que hayas realizado. Esta acción no se puede deshacer."
            confirmText="Sí, cancelar"
            cancelText="No, continuar editando"
            type="warning"
          />
        </div>

        {/* Error global */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-red-800 font-medium">Error al crear escenario</p>
              <p className="text-red-700 text-sm mt-1">{submitError}</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Básica</h2>

            <div className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Escenario *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ej: Venopunción Básica"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe brevemente el escenario..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Categoría y Dificultad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona una categoría</option>
                    {CATEGORY_OPTIONS.filter((opt) => opt.value !== '').map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dificultad *
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.difficulty ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona una dificultad</option>
                    {DIFFICULTY_OPTIONS.filter((opt) => opt.value !== '').map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.difficulty && (
                    <p className="text-red-600 text-sm mt-1">{errors.difficulty}</p>
                  )}
                </div>
              </div>

              {/* Duración estimada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración Estimada (minutos) *
                </label>
                <input
                  type="number"
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleChange}
                  min="5"
                  max="120"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.estimatedDuration ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.estimatedDuration && (
                  <p className="text-red-600 text-sm mt-1">{errors.estimatedDuration}</p>
                )}
              </div>

              {/* Público/Privado */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label className="text-sm text-gray-700">
                  Escenario público (visible para todos los usuarios)
                </label>
              </div>
            </div>
          </div>

          {/* Pasos del procedimiento */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Pasos del Procedimiento</h2>
              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                <Plus size={16} />
                <span>Agregar Paso</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.steps.map((step, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">Paso {index + 1}</span>
                    {formData.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(index)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título del Paso *
                      </label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                        placeholder="Ej: Preparar material"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors[`step_${index}_title`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`step_${index}_title`] && (
                        <p className="text-red-600 text-sm mt-1">{errors[`step_${index}_title`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción del Paso *
                      </label>
                      <textarea
                        value={step.description}
                        onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                        placeholder="Describe qué hacer en este paso..."
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors[`step_${index}_description`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`step_${index}_description`] && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors[`step_${index}_description`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Archivos opcionales */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Archivos (Opcional)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Modelo 3D */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo 3D (.gltf o .glb)
                </label>

                {!modelFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors">
                    <FileType size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click para subir modelo</span>
                    <span className="text-xs text-gray-500 mt-1">Máx. 50MB</span>
                    <input
                      type="file"
                      accept=".gltf,.glb"
                      onChange={handleModelUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileType size={20} className="text-indigo-600" />
                      <span className="text-sm text-indigo-900 truncate">{modelPreview}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveModel}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
                {errors.model && <p className="text-red-600 text-sm mt-1">{errors.model}</p>}
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen de Portada
                </label>

                {!thumbnailFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors">
                    <ImageIcon size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click para subir imagen</span>
                    <span className="text-xs text-gray-500 mt-1">JPG, PNG o WebP - Máx. 5MB</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                {errors.thumbnail && <p className="text-red-600 text-sm mt-1">{errors.thumbnail}</p>}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Crear Escenario</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateScenarioPage;
