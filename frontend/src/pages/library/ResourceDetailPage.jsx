/**
 * Página: Resource Detail
 * Vista detallada de un recurso con preview, rating, download
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Eye,
  Calendar,
  User,
  FileText,
  Clock,
  Globe,
  Trash2,
  Edit,
  Loader2,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import ResourceCategoryBadge from '../../components/library/ResourceCategoryBadge';
import ResourceRating from '../../components/library/ResourceRating';
import libraryService from '../../services/libraryService';
import { useAuthStore } from '@/store/useAuthStore'; // ✅ IMPORTAR
import toast from 'react-hot-toast'; // ✅ IMPORTAR
import {
  getResourceTypeLabel,
  formatFileSize,
  formatDuration,
  getLanguageLabel,
  TRACK_ACTIONS,
} from '../../constants/library';

const ResourceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ Obtener usuario del store de Zustand
  const { user } = useAuthStore();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [rating, setRating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ✅ Verificar permisos de eliminación
  const canDelete = user?.roles?.some((role) =>
    ['IT_ADMIN', 'ADMINISTRATIVE', 'TEACHER'].includes(role)
  );

  // ✅ Verificar permisos de edición
  const canEdit = user?.roles?.some((role) =>
    ['IT_ADMIN', 'ADMINISTRATIVE', 'TEACHER'].includes(role)
  );

  /**
   * Cargar detalles del recurso
   */
  const loadResourceDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📖 Loading resource with ID:', id);

      const response = await libraryService.getResourceDetails(id);

      console.log('📖 Resource details response:', response);

      // ✅ CORRECCIÓN: Verificar estructura de respuesta
      if (response && response.success && response.data) {
        setResource(response.data);
      } else if (response && response.id) {
        // Estructura alternativa
        setResource(response);
      } else {
        console.error('⚠️ Unexpected response structure:', response);
        setError('No se pudo cargar el recurso');
      }
    } catch (err) {
      console.error('❌ Error loading resource details:', err);
      console.error('❌ Error response:', err.response?.data);
      setError('Error al cargar el recurso. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Efecto: Cargar recurso al montar
   */
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await loadResourceDetails();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  /**
   * Manejar descarga
   */
  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Registrar descarga en el backend
      await libraryService.trackResourceUsage(id, TRACK_ACTIONS.DOWNLOAD);

      // Descargar archivo
      window.open(resource.fileUrl, '_blank');

      // Actualizar contador local
      setResource({
        ...resource,
        downloadCount: resource.downloadCount + 1,
      });

      toast.success('Descarga iniciada');
    } catch (err) {
      console.error('Error downloading resource:', err);
      toast.error('Error al descargar el recurso');
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Manejar calificación
   */
  const handleRate = async (ratingValue) => {
    try {
      setRating(true);

      await libraryService.trackResourceUsage(id, TRACK_ACTIONS.RATE, {
        rating: ratingValue,
      });

      // Recargar recurso para obtener nuevo rating
      await loadResourceDetails();

      toast.success('¡Gracias por tu calificación!');
    } catch (err) {
      console.error('Error rating resource:', err);
      toast.error('Error al calificar el recurso');
    } finally {
      setRating(false);
    }
  };

  /**
   * Manejar eliminación
   */
  const handleDelete = async () => {
    try {
      setDeleting(true);

      await libraryService.deleteResource(id);

      toast.success('Recurso eliminado exitosamente');
      navigate('/library');
    } catch (err) {
      console.error('Error deleting resource:', err);
      toast.error('Error al eliminar el recurso');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  /**
   * Volver atrás
   */
  const handleGoBack = () => {
    navigate('/library');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Cargando recurso...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !resource) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md text-center">
          <p className="text-red-800 font-medium mb-4">{error || 'Recurso no encontrado'}</p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Volver a la biblioteca
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón volver */}
        <button
          onClick={handleGoBack}
          className="
            flex items-center gap-2 text-gray-600 hover:text-indigo-600
            mb-6 transition-colors
          "
        >
          <ArrowLeft size={20} />
          <span>Volver a la biblioteca</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <ResourceCategoryBadge category={resource.category} size="md" />

                {/* ✅ Botones de acción */}
                {(canEdit || canDelete) && (
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <button
                        onClick={() => toast('Función de edición en desarrollo', { icon: 'ℹ️' })}
                        className="
                          flex items-center gap-2 px-3 py-1.5 text-blue-600
                          hover:bg-blue-50 rounded-lg transition-colors
                        "
                      >
                        <Edit size={16} />
                        <span className="text-sm">Editar</span>
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="
                          flex items-center gap-2 px-3 py-1.5 text-red-600
                          hover:bg-red-50 rounded-lg transition-colors
                        "
                      >
                        <Trash2 size={16} />
                        <span className="text-sm">Eliminar</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">{resource.title}</h1>

              {resource.author && (
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <User size={18} />
                  <span>Por {resource.author}</span>
                </div>
              )}

              {/* Rating */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Califica este recurso:</p>
                <ResourceRating
                  rating={resource.averageRating}
                  ratingCount={resource.ratingCount}
                  interactive
                  size="lg"
                  showCount
                  onRate={handleRate}
                />
              </div>

              {/* Descripción */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {resource.description || 'Sin descripción disponible.'}
                </p>
              </div>
            </div>

            {/* Preview del archivo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa</h2>

              {resource.type === 'video' ? (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video controls className="w-full h-full" src={resource.fileUrl}>
                    Tu navegador no soporta la reproducción de videos.
                  </video>
                </div>
              ) : resource.type === 'book' && resource.fileUrl.endsWith('.pdf') ? (
                <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                  <iframe
                    src={`${resource.fileUrl}#view=FitH`}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">
                    Vista previa no disponible para este tipo de archivo
                  </p>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="
                      inline-flex items-center gap-2 px-4 py-2
                      bg-indigo-600 text-white rounded-lg
                      hover:bg-indigo-700 disabled:opacity-50
                      transition-colors
                    "
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Descargando...</span>
                      </>
                    ) : (
                      <>
                        <Download size={20} />
                        <span>Descargar para ver</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Etiquetas</h2>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="
                        px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full
                        text-sm font-medium
                      "
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Acción principal */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="
                  w-full flex items-center justify-center gap-2 px-4 py-3
                  bg-indigo-600 text-white rounded-lg font-medium
                  hover:bg-indigo-700 disabled:opacity-50
                  transition-colors
                "
              >
                {downloading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Descargando...</span>
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    <span>Descargar Recurso</span>
                  </>
                )}
              </button>

              {resource.fileUrl && (
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    w-full flex items-center justify-center gap-2 px-4 py-2
                    text-indigo-600 hover:bg-indigo-50 rounded-lg
                    transition-colors mt-2
                  "
                >
                  <ExternalLink size={18} />
                  <span className="text-sm">Abrir en nueva pestaña</span>
                </a>
              )}
            </div>

            {/* Información del recurso */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>

              <div className="space-y-3 text-sm">
                {/* Tipo */}
                <div className="flex items-start gap-3">
                  <FileText size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600">Tipo</p>
                    <p className="font-medium text-gray-900">
                      {getResourceTypeLabel(resource.type)}
                    </p>
                  </div>
                </div>

                {/* Idioma */}
                <div className="flex items-start gap-3">
                  <Globe size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600">Idioma</p>
                    <p className="font-medium text-gray-900">
                      {getLanguageLabel(resource.language)}
                    </p>
                  </div>
                </div>

                {/* Fecha de publicación */}
                {resource.publicationDate && (
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600">Fecha de Publicación</p>
                      <p className="font-medium text-gray-900">
                        {new Date(resource.publicationDate).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Editor */}
                {resource.publisher && (
                  <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600">Editorial</p>
                      <p className="font-medium text-gray-900">{resource.publisher}</p>
                    </div>
                  </div>
                )}

                {/* Páginas o duración */}
                {resource.type === 'video' && resource.duration ? (
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600">Duración</p>
                      <p className="font-medium text-gray-900">
                        {formatDuration(resource.duration)}
                      </p>
                    </div>
                  </div>
                ) : (
                  resource.pageCount && (
                    <div className="flex items-start gap-3">
                      <FileText size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-600">Páginas</p>
                        <p className="font-medium text-gray-900">{resource.pageCount}</p>
                      </div>
                    </div>
                  )
                )}

                {/* Tamaño de archivo */}
                {resource.fileSize && (
                  <div className="flex items-start gap-3">
                    <Download size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600">Tamaño del Archivo</p>
                      <p className="font-medium text-gray-900">
                        {formatFileSize(resource.fileSize)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye size={18} />
                    <span>Vistas</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {resource.viewCount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Download size={18} />
                    <span>Descargas</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {resource.downloadCount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={18} />
                    <span>Agregado</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {new Date(resource.createdAt).toLocaleDateString('es-PE')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ¿Eliminar este recurso?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. El recurso será eliminado permanentemente.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="
                  flex-1 px-4 py-2 border border-gray-300 rounded-lg
                  hover:bg-gray-50 transition-colors disabled:opacity-50
                "
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="
                  flex-1 px-4 py-2 bg-red-600 text-white rounded-lg
                  hover:bg-red-700 disabled:opacity-50 transition-colors
                  flex items-center justify-center gap-2
                "
              >
                {deleting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    <span>Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDetailPage;
