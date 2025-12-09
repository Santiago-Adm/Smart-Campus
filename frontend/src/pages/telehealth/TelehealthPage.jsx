/**
 * Página: Telehealth
 * Página principal de teleenfermería con listado de citas y filtros
 * ✅ CORREGIDO: Bucle infinito, validación de roles, manejo de tabs
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Stethoscope, Calendar, Clock, Loader2, AlertCircle, Users } from 'lucide-react';
import AppointmentCard from '../../components/telehealth/AppointmentCard';
import AppointmentFilters from '../../components/telehealth/AppointmentFilters';
import telehealthService from '../../services/telehealthService';
import { useAuthStore } from '@/store/useAuthStore';

const TelehealthPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, all, past

  // ✅ NUEVO: Determinar rol del usuario
  const userRoles = user?.roles || [];
  const isTeacher = userRoles.includes('TEACHER');
  const isStudent = userRoles.includes('STUDENT');
  const isAdmin =
    userRoles.includes('ADMINISTRATIVE') ||
    userRoles.includes('IT_ADMIN') ||
    userRoles.includes('DIRECTOR');

  /**
   * Cargar citas próximas
   * ✅ DEBUGGING: Logs detallados
   */
  const loadUpcomingAppointments = async () => {
    try {
      console.log('🔵 ========================================');
      console.log('🔵 loadUpcomingAppointments CALLED');
      console.log('🔵 ========================================');

      setLoadingUpcoming(true);

      console.log('🔍 Loading upcoming appointments...');
      console.log('🔍 Current user:', user);
      console.log('🔍 User ID:', user?.userId);
      console.log('🔍 User roles:', user?.roles);

      const result = await telehealthService.getUpcomingAppointments();

      console.log('📅 Raw result from service:', result);
      console.log('📅 Result type:', typeof result);
      console.log('📅 Result keys:', result ? Object.keys(result) : 'null');

      let upcomingData = [];

      // Caso 1: Objeto con success
      if (result && result.success && result.data) {
        console.log('✅ Case 1: Object with success property');
        console.log('📊 result.data:', result.data);
        console.log('📊 result.data type:', typeof result.data);
        console.log('📊 result.data is array?', Array.isArray(result.data));

        upcomingData = Array.isArray(result.data) ? result.data : [];

        console.log('📊 Final upcomingData:', upcomingData);
        console.log('📊 Final upcomingData length:', upcomingData.length);
      }
      // Caso 2: Array directo
      else if (Array.isArray(result)) {
        console.log('✅ Case 2: Direct array');
        upcomingData = result;
      }
      // Caso 3: Estructura inesperada
      else {
        console.warn('⚠️ Unexpected response structure:', result);
      }

      console.log('🔵 About to setUpcomingAppointments with:', upcomingData.length, 'appointments');
      setUpcomingAppointments(upcomingData);
      console.log('🔵 setUpcomingAppointments called');
      console.log('🔵 ========================================');

    } catch (err) {
      console.error('❌ ========================================');
      console.error('❌ Error loading upcoming appointments');
      console.error('❌ Error:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ ========================================');
      setUpcomingAppointments([]);
    } finally {
      setLoadingUpcoming(false);
    }
  };

  /**
   * Cargar todas las citas con filtros
   * CORREGIDO: Maneja múltiples formatos de respuesta
   */
  const loadAppointments = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Starting loadAppointments...');
      console.log('  filters:', filters);
      console.log('  page:', page);

      const result = await telehealthService.getAppointments({
        ...filters,
        page,
        limit: pagination.limit,
      });

      console.log('📅 Raw result from service:', result);
      console.log('📊 Type of result:', typeof result);
      console.log('📊 Is array?', Array.isArray(result));

      // ✅ MANEJO FLEXIBLE: Detectar estructura de respuesta
      let appointmentsData = [];
      let paginationData = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };

      // Caso 1: Backend retorna { success, data, pagination }
      if (result && typeof result === 'object' && !Array.isArray(result) && result.success) {
        console.log('✅ Case 1: Object with success property');
        appointmentsData = result.data || [];
        paginationData = result.pagination || {
          page: 1,
          limit: 20,
          total: appointmentsData.length,
          totalPages: Math.ceil(appointmentsData.length / 20),
        };
      }
      // Caso 2: Backend retorna directamente el array de citas
      else if (Array.isArray(result)) {
        console.log('✅ Case 2: Direct array of appointments');
        appointmentsData = result;
        paginationData = {
          page,
          limit: pagination.limit,
          total: appointmentsData.length,
          totalPages: Math.ceil(appointmentsData.length / pagination.limit),
        };
      }
      // Caso 3: Estructura inesperada
      else {
        console.warn('⚠️ Unexpected response structure:', result);
        appointmentsData = [];
      }

      console.log('📊 Processed appointments:', appointmentsData.length);
      console.log('📊 First appointment:', appointmentsData[0]);
      console.log('📊 Has student?', appointmentsData[0]?.student);
      console.log('📊 Has teacher?', appointmentsData[0]?.teacher);

      // ✅ Actualizar estados
      setAppointments(appointmentsData);
      setPagination(paginationData);

      console.log('✅ State updated successfully');

    } catch (err) {
      console.error('❌ Error loading appointments:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError('Error al cargar las citas.');
      setAppointments([]);
    } finally {
      console.log('🏁 loadAppointments finished');
      setLoading(false);
    }
  };

  /**
   * Efecto: Cargar citas próximas al montar el componente
   * ✅ CRÍTICO: Este useEffect faltaba completamente
   */
  useEffect(() => {
    console.log('🔵 useEffect MOUNT - Calling loadUpcomingAppointments');
    loadUpcomingAppointments();
  }, []); // ✅ Array vacío = solo se ejecuta al montar

  /**
   * ✅ CORREGIDO: Efecto consolidado para manejar cambio de tabs Y filtros
   * Esto previene el bucle infinito
   */
  useEffect(() => {
    console.log('🔄 useEffect triggered - activeTab:', activeTab);
    console.log('🔄 Current filters:', filters);

    if (activeTab === 'upcoming') {
      // No hacer nada, las próximas 24h se cargan aparte
      console.log('⭐️ Tab "upcoming" - skipping loadAppointments');
      return;
    }

    if (activeTab === 'all') {
      console.log('✅ Loading ALL appointments');
      // ✅ Para "Todas", limpiar filtro de estado
      if (filters.status !== '') {
        console.log('🔄 Clearing status filter for "all" tab');
        setFilters((prev) => ({ ...prev, status: '' }));
        return; // ✅ IMPORTANTE: return aquí para que el siguiente useEffect se encargue
      }
      loadAppointments(1);
    } else if (activeTab === 'past') {
      console.log('✅ Loading PAST appointments');
      // ✅ Para "Pasadas", aplicar filtro de estado
      if (filters.status !== 'COMPLETED,CANCELLED') {
        console.log('🔄 Setting status filter for "past" tab');
        setFilters((prev) => ({ ...prev, status: 'COMPLETED,CANCELLED' }));
        return; // ✅ IMPORTANTE: return aquí para que el siguiente useEffect se encargue
      }
      loadAppointments(1);
    }
  }, [activeTab, filters]); // ✅ Escuchar AMBOS: activeTab y filters

  /**
   * ✅ CORREGIDO: Efecto consolidado para manejar cambio de tabs Y filtros
   * Esto previene el bucle infinito
   */
  useEffect(() => {
    console.log('🔄 useEffect triggered - activeTab:', activeTab);
    console.log('🔄 Current filters:', filters);

    if (activeTab === 'upcoming') {
      // No hacer nada, las próximas 24h se cargan aparte
      console.log('⏭️ Tab "upcoming" - skipping loadAppointments');
      return;
    }

    if (activeTab === 'all') {
      console.log('✅ Loading ALL appointments');
      // ✅ Para "Todas", limpiar filtro de estado
      if (filters.status !== '') {
        console.log('🔄 Clearing status filter for "all" tab');
        setFilters((prev) => ({ ...prev, status: '' }));
        return; // ✅ IMPORTANTE: return aquí para que el siguiente useEffect se encargue
      }
      loadAppointments(1);
    } else if (activeTab === 'past') {
      console.log('✅ Loading PAST appointments');
      // ✅ Para "Pasadas", aplicar filtro de estado
      if (filters.status !== 'COMPLETED,CANCELLED') {
        console.log('🔄 Setting status filter for "past" tab');
        setFilters((prev) => ({ ...prev, status: 'COMPLETED,CANCELLED' }));
        return; // ✅ IMPORTANTE: return aquí para que el siguiente useEffect se encargue
      }
      loadAppointments(1);
    }
  }, [activeTab, filters]); // ✅ Escuchar AMBOS: activeTab y filters

  /**
   * Manejar cambio de filtros (desde el componente AppointmentFilters)
   */
  const handleFilterChange = (newFilters) => {
    console.log('🔧 handleFilterChange called with:', newFilters);
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  /**
   * Manejar cambio de página
   */
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    loadAppointments(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Navegar a agendar cita
   */
  const handleScheduleClick = () => {
    navigate('/telehealth/schedule');
  };

  /**
   * Renderizar contenido según tab activa
   */
  const renderContent = () => {
    // ✅ AGREGAR ESTOS LOGS AL INICIO
    console.log('🖼️ DEBUG renderContent:');
    console.log('  activeTab:', activeTab);
    console.log('  appointments.length:', appointments.length);
    console.log('  appointments:', appointments);
    console.log('  upcomingAppointments.length:', upcomingAppointments.length);
    console.log('  loading:', loading);
    console.log('  error:', error);

    // Tab: Próximas
    if (activeTab === 'upcoming') {
      if (loadingUpcoming) {
        return (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="text-gray-600">Cargando citas próximas...</p>
          </div>
        );
      }

      if (upcomingAppointments.length === 0) {
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes citas próximas
            </h3>
            <p className="text-gray-600 mb-6">
              Las citas agendadas para las próximas 24 horas aparecerán aquí
            </p>
            {/* ✅ CORREGIDO: Solo mostrar botón si NO es TEACHER */}
            {!isTeacher && (
              <button
                onClick={handleScheduleClick}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Agendar Nueva Cita
              </button>
            )}
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      );
    }

    // Tab: Todas / Pasadas
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
          <p className="text-gray-600">Cargando citas...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle size={48} className="mx-auto text-red-600 mb-4" />
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={() => loadAppointments(pagination.page)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Stethoscope size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron citas</h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'past'
              ? 'No tienes citas completadas o canceladas'
              : 'Intenta ajustar los filtros o agenda una nueva cita'}
          </p>
          {/* ✅ CORREGIDO: Solo mostrar botón si NO es TEACHER y NO es tab "past" */}
          {activeTab !== 'past' && !isTeacher && (
            <button
              onClick={handleScheduleClick}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Agendar Nueva Cita
            </button>
          )}
        </div>
      );
    }

    return (
      <>
        {/* Grid de citas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
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
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Stethoscope size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Teleenfermería</h1>
                <p className="text-gray-600 mt-1">
                  Gestiona tus consultas virtuales con docentes
                </p>
              </div>
            </div>

            {/* ✅ CORREGIDO: Botón de agendar cita SOLO para STUDENT y ADMIN */}
            {(isStudent || isAdmin) && (
              <button
                onClick={handleScheduleClick}
                className="
                  flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white
                  rounded-lg hover:bg-indigo-700 transition-colors
                  shadow-sm hover:shadow-md
                "
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Agendar Cita</span>
              </button>
            )}

            {/* ✅ NUEVO: Mensaje informativo para TEACHER */}
            {isTeacher && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                <Users size={20} />
                <span className="text-sm font-medium">
                  Los estudiantes agendan citas contigo
                </span>
              </div>
            )}
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <Calendar className="text-indigo-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Citas Próximas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {upcomingAppointments.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <Clock className="text-green-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Total de Citas</p>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <Stethoscope className="text-blue-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">
                    {isTeacher ? 'Citas Agendadas' : 'Docentes Disponibles'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isTeacher ? appointments.length : '8'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'upcoming'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Próximas 24h ({upcomingAppointments.length})
              </button>

              <button
                onClick={() => setActiveTab('all')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'all'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Todas
              </button>

              <button
                onClick={() => setActiveTab('past')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'past'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Pasadas
              </button>
            </nav>
          </div>
        </div>

        {/* Filtros (solo en tabs "Todas" y "Pasadas") */}
        {(activeTab === 'all' || activeTab === 'past') && (
          <AppointmentFilters onFilterChange={handleFilterChange} initialFilters={filters} />
        )}

        {/* Contenido */}
        {renderContent()}
      </div>
    </div>
  );
};

export default TelehealthPage;
