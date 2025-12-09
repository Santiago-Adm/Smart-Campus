/**
 * Página: Library
 * Página principal de la biblioteca virtual con listado de recursos y filtros
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, TrendingUp, Loader2 } from 'lucide-react';
import ResourceCard from '../../components/library/ResourceCard';
import ResourceFilters from '../../components/library/ResourceFilters';
import libraryService from '../../services/libraryService';
import { useAuthStore } from '@/store/useAuthStore'; // ✅ AGREGAR ESTE IMPORT

const LibraryPage = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    language: '',
    minRating: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // ✅ CORRECCIÓN: Obtener usuario del store de Zustand
  const { user } = useAuthStore();

  // ✅ Verificar si puede subir recursos
  const canUpload =
    user?.roles?.some((role) =>
      ['TEACHER', 'ADMINISTRATIVE', 'IT_ADMIN'].includes(role)
    ) || false;

  // DEBUG
  console.log('User from store:', user);
  console.log('User roles:', user?.roles);
  console.log('Can upload:', canUpload);

  /**
   * Cargar recursos
   */
  const loadResources = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await libraryService.searchResources({
        ...filters,
        page,
        limit: pagination.limit,
      });

      console.log('📚 Full response from service:', response);
      console.log('📚 Type of response:', typeof response);
      console.log('📚 Is array?', Array.isArray(response));

      // ✅ CORRECCIÓN: El servicio puede devolver:
      // 1. { success, data: [...], pagination } (objeto completo)
      // 2. [...] (array directo) - por algún interceptor o transformación

      let resourcesArray = [];
      let paginationData = null;

      if (Array.isArray(response)) {
        // Caso 1: Response es directamente el array
        console.log('📚 Response is array, using directly');
        resourcesArray = response;
      } else if (response && response.success && Array.isArray(response.data)) {
        // Caso 2: Response es objeto con estructura { success, data, pagination }
        console.log('📚 Response is object with data array');
        resourcesArray = response.data;
        paginationData = response.pagination;
      } else if (response && Array.isArray(response.data)) {
        // Caso 3: Response tiene data pero sin success
        console.log('📚 Response has data without success flag');
        resourcesArray = response.data;
        paginationData = response.pagination;
      } else {
        console.warn('⚠️ Unexpected response structure:', response);
        resourcesArray = [];
      }

      console.log('📚 Final resources array:', resourcesArray);
      console.log('📚 Resources count:', resourcesArray.length);

      setResources(resourcesArray);

      if (paginationData) {
        console.log('📚 Setting pagination from response:', paginationData);
        setPagination(paginationData);
      } else {
        console.log('📚 Creating local pagination');
        setPagination({
          page: 1,
          limit: 20,
          total: resourcesArray.length,
          totalPages: Math.ceil(resourcesArray.length / 20),
        });
      }

    } catch (err) {
      console.error('❌ Error loading resources:', err);
      setError('Error al cargar los recursos.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar recomendaciones
   */
  const loadRecommendations = async () => {
    try {
      setLoadingRecommendations(true);

      const response = await libraryService.getRecommendations({
        limit: 5,
        strategy: 'popular',
      });

      console.log('🌟 Response from getRecommendations:', response);

      // ✅ CORRECCIÓN: Verificar estructura
      if (response && response.success && response.data) {
        // Backend devuelve: { success, data: { recommendations: [...] } }
        setRecommendations(response.data.recommendations || []);
      } else if (response && response.recommendations) {
        // Estructura alternativa
        setRecommendations(response.recommendations);
      } else {
        console.warn('⚠️ No recommendations found');
        setRecommendations([]);
      }
    } catch (err) {
      console.error('❌ Error loading recommendations:', err);
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  /**
   * Efecto: Cargar recursos al montar y cuando cambien filtros
   */
  useEffect(() => {
    loadResources(1);
  }, [filters]);

  /**
   * Efecto: Cargar recomendaciones al montar
   */
  useEffect(() => {
    loadRecommendations();
  }, []);

  /**
   * Manejar cambio de filtros
   */
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  /**
   * Manejar cambio de página
   */
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    loadResources(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Navegar a subir recurso
   */
  const handleUploadClick = () => {
    navigate('/library/upload');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <BookOpen size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Biblioteca Virtual</h1>
                <p className="text-gray-600 mt-1">
                  Accede a recursos educativos de calidad para tu formación
                </p>
              </div>
            </div>

            {/* Botón de subir recurso (solo para roles permitidos) */}
            {canUpload && (
              <button
                onClick={handleUploadClick}
                className="
                  flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white
                  rounded-lg hover:bg-indigo-700 transition-colors
                  shadow-sm hover:shadow-md
                "
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Subir Recurso</span>
              </button>
            )}
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Total de Recursos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {pagination.total?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Categorías Disponibles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">11</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Tipos de Contenido</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">5</p>
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        {recommendations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Recomendados para ti</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {loadingRecommendations ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
              ) : (
                recommendations.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))
              )}
            </div>
          </div>
        )}

        {/* Filtros */}
        <ResourceFilters onFilterChange={handleFilterChange} initialFilters={filters} />

        {/* Contenido principal */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="text-gray-600">Cargando recursos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={() => loadResources(pagination.page)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron recursos
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar los filtros o realizar otra búsqueda
            </p>
            <button
              onClick={() =>
                handleFilterChange({
                  search: '',
                  category: '',
                  type: '',
                  language: '',
                  minRating: '',
                  sortBy: 'createdAt',
                  sortOrder: 'desc',
                })
              }
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <>
            {/* Grid de recursos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="
                    px-4 py-2 border border-gray-300 rounded-lg
                    hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  Anterior
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(pagination.totalPages, 5))].map((_, idx) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = idx + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + idx;
                    } else {
                      pageNum = pagination.page - 2 + idx;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`
                          px-4 py-2 rounded-lg transition-colors
                          ${
                            pagination.page === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="
                    px-4 py-2 border border-gray-300 rounded-lg
                    hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
