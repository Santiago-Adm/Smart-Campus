/**
 * Página: ScenarioDetail
 * Muestra todos los detalles de un escenario específico
 */

import React, { useState, useEffect } from 'react';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';  // ← AGREGADO
import {
  ArrowLeft,
  Play,
  Clock,
  BarChart3,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Target,
  Award,
} from 'lucide-react';
import ScenarioCategoryBadge from '../../components/simulations/ScenarioCategoryBadge';
import ScenarioDifficultyBadge from '../../components/simulations/ScenarioDifficultyBadge';
import simulationsService from '../../services/simulationsService';
import { useAuthStore } from '@/store/useAuthStore';
import {
  formatDuration,
  formatCompletionCount,
  formatScore,
  formatTime,
  getScoreColor,
  getScoreEmoji,
  getScoreFeedback,
} from '../../constants/simulations';

const ScenarioDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ✅ NUEVOS ESTADOS
  const [userMetrics, setUserMetrics] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // ✅ Estado para permisos de edición
  const [canEdit, setCanEdit] = useState(false);

  // ✅ Calcular permisos cuando scenario o user cambien
  useEffect(() => {
    // Validación 1: Verificar que existan scenario y user
    if (!scenario || !user) {
      console.log('❌ canEdit: No scenario or no user');
      console.log('  - scenario:', !!scenario);
      console.log('  - user:', !!user);
      setCanEdit(false);
      return;
    }

    // Validación 2: Verificar que user.roles sea un array válido
    if (!Array.isArray(user.roles) || user.roles.length === 0) {
      console.log('❌ canEdit: Invalid roles');
      console.log('  - user.roles:', user.roles);
      console.log('  - isArray:', Array.isArray(user.roles));
      setCanEdit(false);
      return;
    }

    // Validación 3: Convertir roles a strings (por si acaso)
    const userRoles = user.roles.map(role => String(role).toUpperCase());

    // Validación 4: Verificar si tiene rol permitido
    const allowedRoles = ['TEACHER', 'ADMIN', 'IT_ADMIN', 'ADMINISTRATIVE'];
    const hasPermissionRole = userRoles.some(role => allowedRoles.includes(role));

    if (!hasPermissionRole) {
      console.log('❌ canEdit: No permission role');
      console.log('  - User roles:', userRoles);
      console.log('  - Allowed roles:', allowedRoles);
      setCanEdit(false);
      return;
    }

    // Validación 5: Verificar si es admin
    const isAdmin = userRoles.includes('ADMIN') ||
                    userRoles.includes('IT_ADMIN') ||
                    userRoles.includes('ADMINISTRATIVE');

    // Validación 6: Verificar si es el creador (comparar como strings)
    const userId = String(user.id || '');
    const scenarioCreatorId = String(scenario.createdBy || '');
    const isOwner = userId && scenarioCreatorId && userId === scenarioCreatorId;

    // DEBUG COMPLETO
    console.log('=== PERMISSION CHECK (DETAILED) ===');
    console.log('👤 User ID:', userId);
    console.log('👤 User roles (original):', user.roles);
    console.log('👤 User roles (normalized):', userRoles);
    console.log('📝 Scenario ID:', scenario.id);
    console.log('📝 Scenario creator:', scenarioCreatorId);
    console.log('✅ Has permission role?', hasPermissionRole);
    console.log('✅ Is admin?', isAdmin);
    console.log('✅ Is owner?', isOwner);
    console.log('✅ Final result:', isOwner || isAdmin);
    console.log('====================================');

    // ✅ ACTUALIZAR EL ESTADO
    setCanEdit(isOwner || isAdmin);
  }, [scenario, user]); // ← Dependencias del useEffect


  /**
   * Cargar detalles del escenario
   */
  const loadScenarioDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎯 Loading scenario details for ID:', id);

      const response = await simulationsService.getScenarioById(id);

      console.log('🎯 Scenario details response:', response);

      if (response.success && response.scenario) {
        setScenario(response.scenario);

        // ✅ DEBUG TEMPORAL
        console.log('🔍 SCENARIO LOADED:');
        console.log('  - ID:', response.scenario.id);
        console.log('  - Title:', response.scenario.title);
        console.log('  - CreatedBy:', response.scenario.createdBy);
        console.log('  - Full scenario:', response.scenario);
      } else {
        setError('No se pudo cargar el escenario');
      }
    } catch (err) {
      console.error('❌ Error loading scenario details:', err);
      setError('Error al cargar los detalles del escenario');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar historial de métricas del usuario para este escenario
   */
  const loadUserMetrics = async (scenarioId) => {
    try {
      setLoadingMetrics(true);
      console.log('📊 Loading user metrics for scenario:', scenarioId);

      const response = await simulationsService.getUserMetrics({
        scenarioId: scenarioId,
        limit: 5,
        sortBy: '-completedAt', // Más recientes primero
      });

      if (response.success && response.metrics) {
        setUserMetrics(response.metrics);
        console.log('✅ User metrics loaded:', response.metrics.length);
      }
    } catch (err) {
      console.warn('⚠️ Could not load metrics:', err.message);
      // No mostrar error al usuario, solo log
    } finally {
      setLoadingMetrics(false);
    }
  };

  /**
   * Efecto: Cargar detalles al montar
   */
  useEffect(() => {
    if (id) {
      loadScenarioDetails();
      loadUserMetrics(id); // ← Cargar métricas del usuario para este escenario
    }
  }, [id]);

  /**
   * Navegar atrás
   */
  const handleBack = () => {
    navigate('/simulations');
  };

  /**
   * Iniciar simulación
   */
  const handleStart = () => {
    console.log('▶️ Starting simulation:', id);
    navigate(`/simulations/${id}/execute`);
  };

  /**
   * Editar escenario
   */
  const handleEdit = () => {
    console.log('✏️ Editing scenario:', id);
    navigate(`/simulations/${id}/edit`);
  };

  /**
   * Abrir modal de confirmación de eliminación
   */
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  /**
   * Confirmar y ejecutar eliminación
   */
  const handleDelete = async () => {
    try {
      setDeleting(true);
      setShowDeleteModal(false);

      const loadingToast = toast.loading('Eliminando escenario...', {
        duration: Infinity,
      });

      console.log('🗑️ Deleting scenario:', id);

      await simulationsService.deleteScenario(id);

      toast.success('¡Escenario eliminado exitosamente!', {
        id: loadingToast,
        duration: 2000,
      });

      setTimeout(() => {
        navigate('/simulations');
      }, 1000);
    } catch (err) {
      console.error('❌ Error deleting scenario:', err);

      const errorMessage =
        err.response?.data?.message ||
        'Error al eliminar el escenario. Por favor, intenta nuevamente.';

      toast.error(errorMessage, {
        duration: 4000,
      });

      setDeleting(false);
    }
  };

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // ============================================
  // ESTADOS DE CARGA Y ERROR
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Cargando detalles del escenario...</p>
        </div>
      </div>
    );
  }

  if (error || !scenario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Escenario no encontrado'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  /**
   * ScenarioDetailPage.jsx - SOLO LA SECCIÓN DE RENDER
   * REEMPLAZAR desde "return (" hasta el final del componente
   */

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ============================================ */}
        {/* BREADCRUMB Y ACCIONES */}
        {/* ============================================ */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver al listado</span>
          </button>

          {/* Botones de acción (solo si tiene permisos) */}
          {canEdit && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit size={18} />
                <span>Editar</span>
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Trash2 size={18} />
                )}
                <span>Eliminar</span>
              </button>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* HEADER CON THUMBNAIL */}
        {/* ============================================ */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Thumbnail */}
          <div className="relative h-64 bg-gradient-to-br from-indigo-50 to-purple-50">
            {scenario.thumbnailUrl ? (
              <img
                src={scenario.thumbnailUrl}
                alt={scenario.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-8xl opacity-20">🎯</div>
              </div>
            )}

            <div className="absolute top-4 left-4">
              <ScenarioCategoryBadge category={scenario.category} />
            </div>

            <div className="absolute top-4 right-4">
              <ScenarioDifficultyBadge difficulty={scenario.difficulty} />
            </div>
          </div>

          {/* Información principal */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{scenario.title}</h1>

            <p className="text-gray-600 text-lg mb-6">
              {scenario.description || 'Sin descripción disponible'}
            </p>

            {/* Métricas rápidas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Clock size={24} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duración</p>
                  <p className="font-semibold text-gray-900">
                    {formatDuration(scenario.estimatedDuration)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pasos</p>
                  <p className="font-semibold text-gray-900">{scenario.stepCount} pasos</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completaciones</p>
                  <p className="font-semibold text-gray-900">
                    {formatCompletionCount(scenario.completionCount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Score Promedio</p>
                  <p className={`font-semibold ${getScoreColor(scenario.averageScore)}`}>
                    {formatScore(scenario.averageScore)}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg shadow-sm hover:shadow-md"
            >
              <Play size={24} />
              <span>Iniciar Simulación</span>
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* PASOS DEL PROCEDIMIENTO */}
        {/* ============================================ */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 size={28} className="text-indigo-600" />
            Pasos del Procedimiento
          </h2>

          {scenario.steps && scenario.steps.length > 0 ? (
            <div className="space-y-4">
              {scenario.steps.map((step, index) => (
                <div
                  key={step._id || index}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No hay pasos definidos para este escenario.</p>
          )}
        </div>

        {/* ============================================ */}
        {/* INFORMACIÓN ADICIONAL */}
        {/* ============================================ */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Información Adicional</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Fecha de creación</p>
                <p className="font-medium text-gray-900">{formatDate(scenario.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Última actualización</p>
                <p className="font-medium text-gray-900">{formatDate(scenario.updatedAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="font-medium text-gray-900">
                  {scenario.isPublic ? 'Público' : 'Privado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BarChart3 size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Versión</p>
                <p className="font-medium text-gray-900">v{scenario.version || 1}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* 📊 TUS SIMULACIONES ANTERIORES (MOVIDA AQUÍ) */}
        {/* ============================================ */}
        {userMetrics.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-md border border-indigo-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <TrendingUp size={24} className="text-white" />
              </div>
              Tus Simulaciones Anteriores
            </h2>
            <p className="text-gray-600 mb-6">
              Revisa tu historial de práctica y observa tu progreso en el tiempo
            </p>

            <div className="space-y-3">
              {userMetrics.map((metric, index) => {
                const date = new Date(metric.completedAt);
                const timeFormatted = formatTime(metric.duration || 0);
                const scoreColor = getScoreColor(metric.score);
                const scoreEmoji = getScoreEmoji(metric.score);
                const scoreFeedback = getScoreFeedback(metric.score);

                return (
                  <div
                    key={metric._id || index}
                    className="flex items-center justify-between p-5 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    {/* Info Básica */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-indigo-600 text-white text-sm font-bold rounded-full">
                          Intento #{userMetrics.length - index}
                        </span>
                        <span className="text-sm text-gray-500">
                          {date.toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          •{' '}
                          {date.toLocaleTimeString('es-PE', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Métricas en línea */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                          <Clock size={16} className="text-blue-600" />
                          <span className="font-medium text-gray-900">{timeFormatted}</span>
                        </div>

                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
                          <Target size={16} className="text-green-600" />
                          <span className="font-medium text-gray-900">
                            {metric.stepsCompleted}/{metric.stepsTotal} pasos
                          </span>
                        </div>

                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                          <Award size={16} className="text-purple-600" />
                          <span className="font-medium text-gray-900">
                            {Math.round(metric.accuracy)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score con Emoji */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-3xl font-bold ${scoreColor}`}>{metric.score}%</p>
                        <p className="text-xs font-medium text-gray-600">{scoreFeedback}</p>
                      </div>
                      <div className="text-5xl">{scoreEmoji}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Loading state */}
            {loadingMetrics && (
              <div className="text-center py-6">
                <Loader2 className="animate-spin text-indigo-600 mx-auto" size={32} />
                <p className="text-sm text-gray-600 mt-2">Cargando historial...</p>
              </div>
            )}

            {/* Estadísticas Resumen */}
            {userMetrics.length > 0 && !loadingMetrics && (
              <div className="mt-6 pt-6 border-t border-indigo-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  📊 Resumen de tu rendimiento
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-3xl font-bold text-indigo-600 mb-1">
                      {userMetrics.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      {userMetrics.length === 1 ? 'Intento' : 'Intentos'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-3xl font-bold text-green-600 mb-1">
                      {Math.round(
                        userMetrics.reduce((sum, m) => sum + m.score, 0) / userMetrics.length
                      )}
                      %
                    </p>
                    <p className="text-sm text-gray-600">Score Promedio</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-3xl font-bold text-purple-600 mb-1">
                      {Math.max(...userMetrics.map((m) => m.score))}%
                    </p>
                    <p className="text-sm text-gray-600">Mejor Score</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botón Ver Más (si hay 5 o más) */}
            {userMetrics.length >= 5 && (
              <div className="mt-6 text-center">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  Ver todas tus simulaciones →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="¿Eliminar escenario?"
        message={`Estás a punto de eliminar "${scenario?.title}". Esta acción no se puede deshacer y se perderán todos los datos asociados.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default ScenarioDetailPage;
