/**
 * Página: Upload Resource
 * Formulario completo para subir recursos a la biblioteca
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import ResourceUploadZone from '../../components/library/ResourceUploadZone';
import libraryService from '../../services/libraryService';
import {
  getCategoryOptions,
  getTypeOptions,
  getLanguageOptions,
  RESOURCE_TYPES,
} from '../../constants/library';

const UploadResourcePage = () => {
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    author: '',
    publisher: '',
    publicationDate: '',
    tags: '',
    language: 'es',
    pageCount: '',
    duration: '',
    isPublic: true,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  /**
   * Manejar cambio en inputs
   */
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Limpiar error del campo
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};

    // Campos obligatorios
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (formData.title.length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres';
    }

    if (!formData.category) {
      newErrors.category = 'Debes seleccionar una categoría';
    }

    if (!formData.type) {
      newErrors.type = 'Debes seleccionar un tipo de recurso';
    }

    if (!selectedFile) {
      newErrors.file = 'Debes seleccionar un archivo';
    }

    // Validaciones específicas según tipo
    if (formData.type === RESOURCE_TYPES.VIDEO && formData.duration && isNaN(formData.duration)) {
      newErrors.duration = 'La duración debe ser un número válido (en segundos)';
    }

    if (formData.pageCount && isNaN(formData.pageCount)) {
      newErrors.pageCount = 'El número de páginas debe ser un número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar
    if (!validateForm()) {
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);

      // ✅ LOG 1: Estado del formulario
      console.log('📤 ========================================');
      console.log('📤 STEP 1: Form state before submission');
      console.log('📤 formData.isPublic:', formData.isPublic, typeof formData.isPublic);
      console.log('📤 Full formData:', formData);

      // Preparar datos del recurso
      const resourceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        type: formData.type,
        author: formData.author.trim() || null,
        publisher: formData.publisher.trim() || null,
        publicationDate: formData.publicationDate || null,
        language: formData.language,
        pageCount: formData.pageCount ? parseInt(formData.pageCount, 10) : null,
        duration: formData.duration ? parseInt(formData.duration, 10) : null,
        isPublic: formData.isPublic,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      };

      // ✅ LOG 2: resourceData preparado
      console.log('📤 STEP 2: resourceData prepared');
      console.log('📤 resourceData.isPublic:', resourceData.isPublic, typeof resourceData.isPublic);

      setUploadProgress(30);

      // Crear FormData
      const uploadFormData = libraryService.createResourceFormData(resourceData, selectedFile);

      // ✅ LOG 3: FormData entries
      console.log('📤 STEP 3: FormData created');
      console.log('📤 FormData entries:');
      for (let [key, value] of uploadFormData.entries()) {
        if (key === 'file') {
          console.log(`  ${key}:`, value.name, value.type, value.size);
        } else {
          console.log(`  ${key}:`, value, typeof value);
        }
      }
      console.log('📤 ========================================');

      setUploadProgress(50);

      // Subir recurso
      const response = await libraryService.uploadResource(uploadFormData);

      setUploadProgress(100);

      // ✅ LOG 4: Response
      console.log('📤 Upload response:', response);

      // ✅ CORRECCIÓN: Extraer ID de diferentes estructuras posibles
      let resourceId = null;

      if (response?.data?.id) {
        resourceId = response.data.id;
      } else if (response?.id) {
        resourceId = response.id;
      }

      console.log('📤 Extracted resource ID:', resourceId);

      if (resourceId) {
        setSuccess(true);

        // Mostrar mensaje de éxito por 2 segundos y redirigir
        setTimeout(() => {
          navigate('/library', { state: { refresh: true } });
        }, 2000);
      } else {
        console.error('No se pudo obtener el ID del recurso:', response);
        setSuccess(true);

        setTimeout(() => {
          navigate('/library');
        }, 2000);
      }
    } catch (err) {
      console.error('❌ Error uploading resource:', err);
      setErrors({
        submit: err.response?.data?.message || 'Error al subir el recurso. Intenta nuevamente.',
      });
    } finally {
      if (!success) {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  /**
   * Manejar selección de archivo
   */
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (errors.file) {
      setErrors({
        ...errors,
        file: null,
      });
    }
  };

  /**
   * Volver atrás
   */
  const handleGoBack = () => {
    navigate('/library');
  };

  // Mostrar éxito
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Recurso Subido!</h2>
          <p className="text-gray-600 mb-4">
            Tu recurso ha sido publicado exitosamente en la biblioteca virtual.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
          <p className="text-sm text-gray-500 mt-2">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver a la biblioteca</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Upload size={28} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subir Recurso</h1>
              <p className="text-gray-600">Comparte material educativo con la comunidad</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Información Básica
              </h2>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Anatomía Humana Básica"
                  className={`
                    w-full px-4 py-2.5 border rounded-lg
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    ${errors.title ? 'border-red-500' : 'border-gray-300'}
                  `}
                  disabled={uploading}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe brevemente el contenido del recurso..."
                  rows={4}
                  className="
                    w-full px-4 py-2.5 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    resize-none
                  "
                  disabled={uploading}
                />
              </div>

              {/* Categoría y Tipo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`
                      w-full px-4 py-2.5 border rounded-lg bg-white
                      focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      ${errors.category ? 'border-red-500' : 'border-gray-300'}
                    `}
                    disabled={uploading}
                  >
                    <option value="">Selecciona una categoría</option>
                    {getCategoryOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Recurso <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className={`
                      w-full px-4 py-2.5 border rounded-lg bg-white
                      focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      ${errors.type ? 'border-red-500' : 'border-gray-300'}
                    `}
                    disabled={uploading}
                  >
                    <option value="">Selecciona un tipo</option>
                    {getTypeOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.type}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Información Adicional
              </h2>

              {/* Autor y Editorial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    placeholder="Ej: Dr. Juan Pérez"
                    className="
                      w-full px-4 py-2.5 border border-gray-300 rounded-lg
                      focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    "
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Editorial
                  </label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => handleInputChange('publisher', e.target.value)}
                    placeholder="Ej: Editorial Médica"
                    className="
                      w-full px-4 py-2.5 border border-gray-300 rounded-lg
                      focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    "
                    disabled={uploading}
                  />
                </div>
              </div>

              {/* Fecha de Publicación e Idioma */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Publicación
                  </label>
                  <input
                    type="date"
                    value={formData.publicationDate}
                    onChange={(e) => handleInputChange('publicationDate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="
                      w-full px-4 py-2.5 border border-gray-300 rounded-lg
                      focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    "
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="
                      w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white
                      focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    "
                    disabled={uploading}
                  >
                    {getLanguageOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Campos específicos según tipo */}
              {formData.type === RESOURCE_TYPES.VIDEO ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (en segundos)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="Ej: 3600 (1 hora)"
                    min="1"
                    className={`
                      w-full px-4 py-2.5 border rounded-lg
                      focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      ${errors.duration ? 'border-red-500' : 'border-gray-300'}
                    `}
                    disabled={uploading}
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.duration}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Páginas
                  </label>
                  <input
                    type="number"
                    value={formData.pageCount}
                    onChange={(e) => handleInputChange('pageCount', e.target.value)}
                    placeholder="Ej: 250"
                    min="1"
                    className={`
                      w-full px-4 py-2.5 border rounded-lg
                      focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      ${errors.pageCount ? 'border-red-500' : 'border-gray-300'}
                    `}
                    disabled={uploading}
                  />
                  {errors.pageCount && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.pageCount}
                    </p>
                  )}
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiquetas (separadas por comas)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="Ej: anatomía, básico, enfermería"
                  className="
                    w-full px-4 py-2.5 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  "
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separa las etiquetas con comas para facilitar la búsqueda
                </p>
              </div>

              {/* Visibilidad */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  className="
                    w-4 h-4 text-indigo-600 border-gray-300 rounded
                    focus:ring-2 focus:ring-indigo-500
                  "
                  disabled={uploading}
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  Hacer público este recurso (visible para todos los usuarios)
                </label>
              </div>
            </div>

            {/* Subir Archivo */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Archivo <span className="text-red-500">*</span>
              </h2>

              {formData.type ? (
                <ResourceUploadZone
                  resourceType={formData.type}
                  onFileSelect={handleFileSelect}
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Primero selecciona el <strong>tipo de recurso</strong> para poder subir el
                    archivo
                  </p>
                </div>
              )}

              {errors.file && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.file}
                </p>
              )}
            </div>

            {/* Error general */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error al subir recurso</p>
                  <p className="text-sm text-red-600 mt-1">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Barra de progreso */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subiendo recurso...</span>
                  <span className="font-medium text-indigo-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleGoBack}
                disabled={uploading}
                className="
                  flex-1 px-4 py-2.5 border border-gray-300 rounded-lg
                  hover:bg-gray-50 disabled:opacity-50 transition-colors
                "
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="
                  flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg
                  hover:bg-indigo-700 disabled:opacity-50 transition-colors
                  flex items-center justify-center gap-2 font-medium
                "
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    <span>Publicar Recurso</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadResourcePage;
