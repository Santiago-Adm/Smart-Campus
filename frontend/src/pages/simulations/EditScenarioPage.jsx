/**
 * Página: EditScenario
 * Formulario para editar escenarios AR existentes
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  createScenarioFormData,
} from '../../constants/simulations';
import simulationsService from '../../services/simulationsService';
import { useAuthStore } from '@/store/useAuthStore';

const EditScenarioPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

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

  // URLs existentes (del escenario original)
  const [existingModelUrl, setExistingModelUrl] = useState(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState(null);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Al inicio del componente, después de los estados existentes
  const [scenario, setScenario] = useState(null);

  // ✅ AGREGAR ESTOS NUEVOS ESTADOS
  const [removeExistingModel, setRemoveExistingModel] = useState(false);
  const [removeExistingThumbnail, setRemoveExistingThumbnail] = useState(false);

  /**
   * Cargar datos del escenario
   */
  const loadScenarioData = async () => {
    try {
      setLoading(true);
      console.log('📥 Loading scenario data for ID:', id);

      const response = await simulationsService.getScenarioById(id);

      if (response.success && response.scenario) {
        const scenarioData = response.scenario;
        console.log('✅ Scenario loaded:', scenarioData);

        // ✅ Guardar scenario en estado
        setScenario(scenarioData);

        // Llenar formulario con datos existentes
        setFormData({
          title: scenarioData.title || '',
          description: scenarioData.description || '',
          category: scenarioData.category || '',
          difficulty: scenarioData.difficulty || '',
          estimatedDuration: scenarioData.estimatedDuration || 15,
          isPublic: scenarioData.isPublic !== undefined ? scenarioData.isPublic : true,
          steps: scenarioData.steps && scenarioData.steps.length > 0
            ? scenarioData.steps.map(step => ({
                title: step.title || '',
                description: step.description || '',
              }))
            : [{ title: '', description: '' }],
        });

        // Guardar URLs existentes
        if (scenarioData.modelUrl) {
          setExistingModelUrl(scenarioData.modelUrl);
          setModelPreview(scenarioData.modelUrl.split('/').pop());
        }

        if (scenarioData.thumbnailUrl) {
          setExistingThumbnailUrl(scenarioData.thumbnailUrl);
          setThumbnailPreview(scenarioData.thumbnailUrl);
        }
      } else {
        toast.error('No se pudo cargar el escenario');
        navigate('/simulations');
      }
    } catch (err) {
      console.error('❌ Error loading scenario:', err);
      toast.error('Error al cargar el escenario');
      navigate('/simulations');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Efecto: Cargar datos al montar
   */
  useEffect(() => {
    if (id) {
      loadScenarioData();
    }
  }, [id]);

  /**
   * Verificar permisos
   */
  const canEdit = () => {
    // ✅ Verificar que scenario y user existan
    if (!scenario || !user) {
      console.log('❌ canEdit: No scenario or no user', {
        scenario: !!scenario,
        user: !!user,
      });
      return false;
    }

    // Verificar roles y permisos
    const isOwner = scenario.createdBy === user.id;
    const isAdmin = user.roles?.some(role => ['ADMIN', 'IT_ADMIN'].includes(role));

    console.log('🔍 Permission check:', {
      scenarioCreatedBy: scenario.createdBy,
      userId: user.id,
      isOwner,
      isAdmin,
      canEdit: isOwner || isAdmin,
    });

    return isOwner || isAdmin;
  };

  /**
   * Manejar cambios en campos del formulario
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

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
      toast.error('Debe haber al menos un paso');
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
    setRemoveExistingModel(false); // ✅ Cancelar eliminación si se sube nuevo
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
    setRemoveExistingThumbnail(false); // ✅ Cancelar eliminación si se sube nuevo

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setErrors({ ...errors, thumbnail: null });
  };

  /**
   * Remover modelo (nuevo o existente)
   */
  const handleRemoveModel = () => {
    if (modelFile) {
      // Si hay un archivo nuevo, solo quitarlo
      setModelFile(null);
      // Restaurar preview del existente si lo hay
      if (existingModelUrl && !removeExistingModel) {
        setModelPreview(existingModelUrl.split('/').pop());
      } else {
        setModelPreview(null);
      }
    } else if (existingModelUrl) {
      // Si hay archivo existente, marcarlo para eliminación
      setRemoveExistingModel(true);
      setModelPreview(null);
      toast.success('El modelo existente será eliminado al guardar');
    }
  };

  /**
   * Remover thumbnail (nuevo o existente)
   */
  const handleRemoveThumbnail = () => {
    if (thumbnailFile) {
      // Si hay un archivo nuevo, solo quitarlo
      setThumbnailFile(null);
      // Restaurar preview del existente si lo hay
      if (existingThumbnailUrl && !removeExistingThumbnail) {
        setThumbnailPreview(existingThumbnailUrl);
      } else {
        setThumbnailPreview(null);
      }
    } else if (existingThumbnailUrl) {
      // Si hay archivo existente, marcarlo para eliminación
      setRemoveExistingThumbnail(true);
      setThumbnailPreview(null);
      toast.success('La imagen existente será eliminada al guardar');
    }
  };

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};

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

    if (!validateForm()) {
      setSubmitError('Por favor, corrige los errores del formulario');
      toast.error('Hay errores en el formulario');
      return;
    }

    const loadingToast = toast.loading('Actualizando escenario...', {
      duration: Infinity,
    });

    try {
      setSubmitLoading(true);
      setSubmitError(null);

      console.log('📤 Updating scenario with data:', formData);

      // Crear FormData
      const formDataToSend = createScenarioFormData(formData, modelFile, thumbnailFile);

      // ✅ Agregar flags de eliminación si corresponde
      if (removeExistingModel) {
        formDataToSend.append('removeModel', 'true');
        console.log('🗑️ Marking model for deletion');
      }

      if (removeExistingThumbnail) {
        formDataToSend.append('removeThumbnail', 'true');
        console.log('🗑️ Marking thumbnail for deletion');
      }

      // Enviar al backend
      const response = await simulationsService.updateScenario(id, formDataToSend);

      console.log('✅ Scenario updated:', response);

      if (response.success) {
        toast.success('¡Escenario actualizado exitosamente!', {
          id: loadingToast,
          duration: 2000,
        });

        setTimeout(() => {
          navigate(`/simulations/${id}`);
        }, 1000);
      } else {
        toast.error(response.message || 'Error al actualizar el escenario', {
          id: loadingToast,
          duration: 4000,
        });
        setSubmitError(response.message || 'Error al actualizar el escenario');
      }
    } catch (err) {
      console.error('❌ Error updating scenario:', err);

      const errorMessage =
        err.response?.data?.message || 'Error al actualizar el escenario. Intenta nuevamente.';

      toast.error(errorMessage, {
        id: loadingToast,
        duration: 4000,
      });

      setSubmitError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Cancelar y volver
   */
  const handleCancel = () => {
    // En edición, simplemente volver sin confirmación
    // (Los datos originales no se pierden)
    navigate(`/simulations/${id}`);
  };

  // ============================================
  // ESTADOS DE CARGA
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Cargando datos del escenario...</p>
        </div>
      </div>
    );
  }

  // ✅ NUEVA VERIFICACIÓN: Esperar a que scenario y user estén cargados
  if (!scenario || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // ✅ AHORA SÍ verificar permisos (cuando scenario y user ya existen)
  if (!canEdit()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">No tienes permisos para editar este escenario</p>
          <button
            onClick={() => navigate(`/simulations/${id}`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Volver al detalle
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER PRINCIPAL (igual que CreateScenarioPage)
  // ============================================

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

          <h1 className="text-3xl font-bold text-gray-900">Editar Escenario</h1>
          <p className="text-gray-600 mt-2">
            Modifica los campos que desees actualizar
          </p>
        </div>

        {/* Error global */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-red-800 font-medium">Error al actualizar escenario</p>
              <p className="text-red-700 text-sm mt-1">{submitError}</p>
            </div>
          </div>
        )}

        {/* Formulario - MISMO QUE CreateScenarioPage */}
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

                {!modelFile && !existingModelUrl ? (
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
                ) : removeExistingModel && !modelFile ? (
                  // Mostrando estado "eliminado"
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center text-gray-500">
                      <FileType size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Modelo marcado para eliminación</p>
                      <button
                        type="button"
                        onClick={() => {
                          setRemoveExistingModel(false);
                          if (existingModelUrl) {
                            setModelPreview(existingModelUrl.split('/').pop());
                          }
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-700 mt-2"
                      >
                        Deshacer
                      </button>
                    </div>
                    <label className="block mt-3">
                      <input
                        type="file"
                        accept=".gltf,.glb"
                        onChange={handleModelUpload}
                        className="hidden"
                      />
                      <span className="text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer">
                        O subir uno nuevo →
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileType size={20} className="text-indigo-600" />
                      <span className="text-sm text-indigo-900 truncate">
                        {modelFile ? modelFile.name : modelPreview}
                        {!modelFile && existingModelUrl && (
                          <span className="text-xs text-indigo-600 ml-2">(existente)</span>
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveModel}
                      className="text-red-600 hover:text-red-700"
                      title={modelFile ? 'Quitar archivo nuevo' : 'Eliminar archivo existente'}
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

                {!thumbnailFile && !existingThumbnailUrl ? (
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
                ) : removeExistingThumbnail && !thumbnailFile ? (
                  // Mostrando estado "eliminado"
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex flex-col items-center justify-center">
                    <ImageIcon size={32} className="text-gray-400 mb-2 opacity-50" />
                    <p className="text-sm text-gray-500">Imagen marcada para eliminación</p>
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveExistingThumbnail(false);
                        if (existingThumbnailUrl) {
                          setThumbnailPreview(existingThumbnailUrl);
                        }
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-700 mt-2"
                    >
                      Deshacer
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {!thumbnailFile && existingThumbnailUrl && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-indigo-600 text-white text-xs rounded">
                        Existente
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      title={thumbnailFile ? 'Quitar archivo nuevo' : 'Eliminar archivo existente'}
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
              disabled={submitLoading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Actualizando...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScenarioPage;
