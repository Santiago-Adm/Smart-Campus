/**
 * Página: Simulations
 * Página principal de simulaciones AR con listado y filtros
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Gamepad2, TrendingUp, Loader2 } from 'lucide-react';
import ScenarioCard from '../../components/simulations/ScenarioCard';
import ScenarioFilters from '../../components/simulations/ScenarioFilters';
import simulationsService from '../../services/simulationsService';
import { useAuthStore } from '@/store/useAuthStore';
import { DEFAULT_FILTERS } from '../../constants/simulations';

const SimulationsPage = () => {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [featuredScenarios, setFeaturedScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // ✅ Obtener usuario del store de Zustand
  const { user } = useAuthStore();

  // ✅ Verificar si puede crear escenarios
  const canCreateScenario =
    user?.roles?.some((role) => ['TEACHER', 'ADMIN', 'IT_ADMIN'].includes(role)) || false;

  // DEBUG
  console.log('👤 User from store:', user);
  console.log('👤 User roles:', user?.roles);
  console.log('👤 Can create scenario:', canCreateScenario);

  /**
   * Cargar escenarios con filtros
   */
  const loadScenarios = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎮 Loading scenarios with filters:', { ...filters, page });

      // ✅ LOG: Ver qué filtros se están enviando
      const filtersToSend = {
        ...filters,
        page,
        limit: pagination.limit,
      };

      console.log('🔍 FILTERS BEING SENT:', JSON.stringify(filtersToSend, null, 2));

      const response = await simulationsService.getScenarios({
        ...filters,
        page,
        limit: pagination.limit,
      });

      console.log('🎮 Response from service:', response);

      // ✅ NORMALIZACIÓN: El servicio ya devuelve { success, scenarios, pagination, filters }
      if (response.success) {
        setScenarios(response.scenarios || []);
        setPagination(response.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        });
      } else {
        console.warn('⚠️ Response not successful');
        setScenarios([]);
      }
    } catch (err) {
      console.error('❌ Error loading scenarios:', err);
      setError('Error al cargar los escenarios. Por favor, intenta nuevamente.');
      setScenarios([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar escenarios destacados (públicos)
   */
  const loadFeaturedScenarios = async () => {
    try {
      setLoadingFeatured(true);

      console.log('🌟 Loading featured scenarios...');

      // ✅ Cambiado de 6 a 4 (o el número que prefieras)
      const response = await simulationsService.getPublicScenarios(4);

      console.log('🌟 Featured response:', response);

      if (response.success) {
        setFeaturedScenarios(response.scenarios || []);
      } else {
        console.warn('⚠️ No featured scenarios found');
        setFeaturedScenarios([]);
      }
    } catch (err) {
      console.error('❌ Error loading featured scenarios:', err);
      setFeaturedScenarios([]);
    } finally {
      setLoadingFeatured(false);
    }
  };

  /**
   * Efecto: Cargar escenarios al montar y cuando cambien filtros
   */
  useEffect(() => {
    loadScenarios(1);
  }, [filters]);

  /**
   * Efecto: Cargar escenarios destacados al montar
   */
  useEffect(() => {
    loadFeaturedScenarios();
  }, []);

  /**
   * Manejar cambio de filtros
   */
  const handleFilterChange = (newFilters) => {
    console.log('🔄 Filters changed:', newFilters);
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  /**
   * Manejar cambio de página
   */
  const handlePageChange = (newPage) => {
    console.log('📄 Page changed to:', newPage);
    setPagination({ ...pagination, page: newPage });
    loadScenarios(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Navegar a crear escenario
   */
  const handleCreateClick = () => {
    navigate('/simulations/create');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Gamepad2 size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Simulaciones AR</h1>
                <p className="text-gray-600 mt-1">
                  Practica procedimientos clínicos en un entorno seguro y controlado
                </p>
              </div>
            </div>

            {/* Botón de crear escenario (solo para roles permitidos) */}
            {canCreateScenario && (
              <button
                onClick={handleCreateClick}
                className="
                  flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white
                  rounded-lg hover:bg-indigo-700 transition-colors
                  shadow-sm hover:shadow-md
                "
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Crear Escenario</span>
              </button>
            )}
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Total de Escenarios</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {pagination.total?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Categorías Disponibles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">7</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Niveles de Dificultad</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
            </div>
          </div>
        </div>

        {/* Escenarios Destacados */}
        {featuredScenarios.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Escenarios Destacados</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingFeatured ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
              ) : (
                featuredScenarios.map((scenario) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} />
                ))
              )}
            </div>
          </div>
        )}

        {/* Filtros */}
        <ScenarioFilters
          onFilterChange={handleFilterChange}
          initialFilters={filters}
          showMyScenarios={canCreateScenario}  // ← AGREGAR: Solo mostrar a TEACHER/ADMIN
          userId={user?.id}                     // ← AGREGAR: Pasar el ID del usuario
        />

        {/* Contenido principal */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="text-gray-600">Cargando escenarios...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={() => loadScenarios(pagination.page)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : scenarios.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Gamepad2 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron escenarios
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar los filtros o realizar otra búsqueda
            </p>
            <button
              onClick={() => handleFilterChange(DEFAULT_FILTERS)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <>
            {/* Grid de escenarios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {scenarios.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} />
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

export default SimulationsPage;
