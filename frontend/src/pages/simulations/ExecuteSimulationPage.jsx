/**
 * Página: ExecuteSimulation
 * Ejecutar simulaciones AR paso a paso con tracking de métricas
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  Award,
  X,
} from 'lucide-react';
import simulationsService from '../../services/simulationsService';
import { useAuthStore } from '@/store/useAuthStore';
import {
  getScenarioCategoryEmoji,
  getScenarioDifficultyStars,
  formatDuration,
  getScoreColor,
} from '../../constants/simulations';

const ExecuteSimulationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Estados principales
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de simulación
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [stepAttempts, setStepAttempts] = useState({}); // Intentos por paso

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const timerRef = useRef(null);

  // Métricas
  const [sessionId] = useState(`sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Estados de finalización
  const [showResults, setShowResults] = useState(false);
  const [finalMetrics, setFinalMetrics] = useState(null);

  /**
   * Cargar datos del escenario
   */
  useEffect(() => {
    const loadScenario = async () => {
      try {
        setLoading(true);
        console.log('📥 Loading scenario for execution:', id);

        const response = await simulationsService.getScenarioById(id);

        if (response.success && response.scenario) {
          setScenario(response.scenario);
          console.log('✅ Scenario loaded for execution');
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

    if (id) {
      loadScenario();
    }

    // Cleanup: detener timer al desmontar
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id, navigate]);

  /**
   * Iniciar simulación
   */
  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(new Date());

    // Iniciar timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    toast.success('¡Simulación iniciada!');
  };

  /**
   * Pausar/Reanudar simulación
   */
  const handlePauseResume = () => {
    if (isPaused) {
      // Reanudar
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      toast('Simulación reanudada', { icon: '▶️' });
    } else {
      // Pausar
      setIsPaused(true);
      clearInterval(timerRef.current);
      toast('Simulación pausada', { icon: '⏸️' });
    }
  };

  /**
   * Navegar al paso anterior
   */
  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  /**
   * Navegar al paso siguiente
   */
  const handleNextStep = () => {
    if (currentStepIndex < scenario.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  /**
   * Marcar paso actual como completado
   */
  const handleCompleteStep = () => {
    const stepNumber = currentStepIndex + 1;

    if (completedSteps.includes(stepNumber)) {
      // Desmarcar
      setCompletedSteps(completedSteps.filter((s) => s !== stepNumber));
      toast('Paso desmarcado', { icon: '↩️' });
    } else {
      // Marcar como completado
      setCompletedSteps([...completedSteps, stepNumber]);

      // Registrar intento
      setStepAttempts({
        ...stepAttempts,
        [stepNumber]: (stepAttempts[stepNumber] || 0) + 1,
      });

      toast.success(`¡Paso ${stepNumber} completado!`);

      // Auto-avanzar al siguiente paso si no es el último
      if (currentStepIndex < scenario.steps.length - 1) {
        setTimeout(() => {
          setCurrentStepIndex(currentStepIndex + 1);
        }, 500);
      }
    }
  };

  /**
   * Calcular métricas finales
   */
  const calculateMetrics = () => {
    const totalSteps = scenario.steps.length;
    const stepsCompleted = completedSteps.length;
    const accuracy = (stepsCompleted / totalSteps) * 100;

    // Calcular score basado en:
    // - Completitud (60%)
    // - Tiempo (20%)
    // - Intentos (20%)
    const completionScore = (stepsCompleted / totalSteps) * 60;

    const estimatedSeconds = (scenario.estimatedDuration || 15) * 60;
    const timeRatio = Math.min(estimatedSeconds / elapsedSeconds, 1);
    const timeScore = timeRatio * 20;

    const avgAttempts =
      Object.values(stepAttempts).reduce((sum, val) => sum + val, 0) / stepsCompleted || 1;
    const attemptsScore = Math.max(0, 20 - (avgAttempts - 1) * 5);

    const finalScore = Math.round(completionScore + timeScore + attemptsScore);

    return {
      totalSteps,
      stepsCompleted,
      accuracy: Math.round(accuracy),
      score: Math.min(100, Math.max(0, finalScore)),
      elapsedSeconds,
      attempts: stepAttempts,
    };
  };

  /**
   * Finalizar simulación
   */
  const handleFinish = async () => {
    // Confirmar
    const allCompleted = completedSteps.length === scenario.steps.length;

    if (!allCompleted) {
      const confirmed = window.confirm(
        `Has completado ${completedSteps.length} de ${scenario.steps.length} pasos. ¿Seguro que deseas finalizar?`
      );
      if (!confirmed) return;
    }

    // Detener timer
    clearInterval(timerRef.current);
    setIsRunning(false);

    // Calcular métricas
    const metrics = calculateMetrics();
    setFinalMetrics(metrics);

    console.log('📊 Final metrics:', metrics);

    // Guardar métricas en backend
    try {
      const metricsData = {
        scenarioId: scenario.id,
        sessionId,
        startedAt: startTime.toISOString(),
        completedAt: new Date().toISOString(),
        stepsCompleted: metrics.stepsCompleted,
        stepsTotal: metrics.totalSteps,
        accuracy: metrics.accuracy,
        score: metrics.score,
        errors: [], // TODO: registrar errores específicos
        vitalSignsData: null, // TODO: integrar IoT
      };

      console.log('💾 Saving metrics:', metricsData);

      await simulationsService.recordMetrics(metricsData);

      toast.success('¡Métricas guardadas exitosamente!');
    } catch (err) {
      console.error('❌ Error saving metrics:', err);
      toast.error('No se pudieron guardar las métricas');
    }

    // Mostrar resultados
    setShowResults(true);
  };

  /**
   * Salir sin guardar (con confirmación)
   */
  const handleExit = () => {
    if (isRunning) {
      const confirmed = window.confirm(
        '¿Seguro que deseas salir? Se perderá el progreso de esta simulación.'
      );
      if (!confirmed) return;
    }

    clearInterval(timerRef.current);
    navigate(`/simulations/${id}`);
  };

  /**
   * Formatear tiempo
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Obtener feedback según score
   */
  const getFeedback = (score) => {
    if (score >= 90) return { text: '¡Excelente trabajo!', emoji: '🏆', color: 'text-green-600' };
    if (score >= 75) return { text: '¡Muy bien!', emoji: '🎉', color: 'text-blue-600' };
    if (score >= 60) return { text: 'Buen intento', emoji: '👍', color: 'text-yellow-600' };
    if (score >= 50) return { text: 'Puede mejorar', emoji: '💪', color: 'text-orange-600' };
    return { text: 'Sigue practicando', emoji: '📚', color: 'text-red-600' };
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando simulación...</p>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600">No se pudo cargar el escenario</p>
        </div>
      </div>
    );
  }

  const currentStep = scenario.steps[currentStepIndex];
  const progress = (completedSteps.length / scenario.steps.length) * 100;
  const isStepCompleted = completedSteps.includes(currentStepIndex + 1);

  // ============================================
  // MODAL DE RESULTADOS
  // ============================================

  if (showResults && finalMetrics) {
    const feedback = getFeedback(finalMetrics.score);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8 max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{feedback.emoji}</div>
            <h2 className={`text-3xl font-bold ${feedback.color} mb-2`}>{feedback.text}</h2>
            <p className="text-gray-600">Has completado la simulación</p>
          </div>

          {/* Score Principal */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white text-center mb-6">
            <p className="text-sm font-medium mb-2">Score Final</p>
            <p className="text-6xl font-bold">{finalMetrics.score}%</p>
          </div>

          {/* Métricas Detalladas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Clock className="mx-auto mb-2 text-blue-600" size={24} />
              <p className="text-2xl font-bold text-gray-900">{formatTime(finalMetrics.elapsedSeconds)}</p>
              <p className="text-sm text-gray-600">Tiempo Total</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Target className="mx-auto mb-2 text-green-600" size={24} />
              <p className="text-2xl font-bold text-gray-900">
                {finalMetrics.stepsCompleted}/{finalMetrics.totalSteps}
              </p>
              <p className="text-sm text-gray-600">Pasos Completados</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <TrendingUp className="mx-auto mb-2 text-purple-600" size={24} />
              <p className="text-2xl font-bold text-gray-900">{finalMetrics.accuracy}%</p>
              <p className="text-sm text-gray-600">Precisión</p>
            </div>
          </div>

          {/* Feedback Adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>💡 Consejo:</strong>{' '}
              {finalMetrics.score >= 90
                ? '¡Excelente dominio del procedimiento! Considera intentar escenarios más avanzados.'
                : finalMetrics.score >= 75
                ? 'Muy buen desempeño. Intenta mejorar la velocidad manteniendo la precisión.'
                : finalMetrics.score >= 60
                ? 'Buen progreso. Practica los pasos que te tomaron más tiempo.'
                : 'Revisa las instrucciones de cada paso y practica nuevamente. ¡No te rindas!'}
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowResults(false);
                setIsRunning(false);
                setCurrentStepIndex(0);
                setCompletedSteps([]);
                setStepAttempts({});
                setElapsedSeconds(0);
                setFinalMetrics(null);
              }}
              className="flex-1 px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
            >
              Practicar de Nuevo
            </button>

            <button
              onClick={() => {
                // ✅ Usar replace para forzar recarga completa
                window.location.href = `/simulations/${id}`;
              }}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Ver Detalles
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // PANTALLA INICIAL (MEJORADA)
  // ============================================

  if (!isRunning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-3xl w-full">
          {/* Header */}
          <button
            onClick={handleExit}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 -mt-2"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Volver</span>
          </button>

          {/* Información del Escenario */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{getScenarioCategoryEmoji(scenario.category)}</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{scenario.title}</h1>
            {scenario.description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {scenario.description}
              </p>
            )}
          </div>

          {/* Badges de Información */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
              <Clock size={20} className="text-indigo-600" />
              <div className="text-left">
                <p className="text-xs text-indigo-600 font-medium">Duración</p>
                <p className="text-sm font-bold text-indigo-900">{formatDuration(scenario.estimatedDuration)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
              <Target size={20} className="text-purple-600" />
              <div className="text-left">
                <p className="text-xs text-purple-600 font-medium">Pasos</p>
                <p className="text-sm font-bold text-purple-900">{scenario.steps.length} pasos</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
              <TrendingUp size={20} className="text-yellow-600" />
              <div className="text-left">
                <p className="text-xs text-yellow-600 font-medium">Dificultad</p>
                <p className="text-sm font-bold text-yellow-900">
                  {'⭐'.repeat(getScenarioDifficultyStars(scenario.difficulty))}
                </p>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 my-6" />

          {/* Lista de Pasos - Versión Compacta */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-indigo-600 rounded-full" />
              Pasos del Procedimiento
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {scenario.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-indigo-300 transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
                    {index + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Antes de comenzar:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• El cronómetro iniciará al presionar "Comenzar"</li>
                  <li>• Puedes pausar la simulación en cualquier momento</li>
                  <li>• Marca cada paso al completarlo para mejor evaluación</li>
                  <li>• Tu desempeño se guardará automáticamente al finalizar</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botón de Inicio - Grande y Llamativo */}
          <button
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all font-bold text-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play size={28} className="drop-shadow" />
            <span>Comenzar Simulación</span>
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Asegúrate de estar listo antes de iniciar el cronómetro
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // PANTALLA DE EJECUCIÓN
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header Fijo Mejorado */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            {/* Título */}
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getScenarioCategoryEmoji(scenario.category)}</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{scenario.title}</h1>
                <p className="text-sm text-gray-600">
                  Paso {currentStepIndex + 1} de {scenario.steps.length}
                </p>
              </div>
            </div>

            {/* Timer y Controles */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isPaused ? 'bg-yellow-100 text-yellow-700' : 'bg-indigo-100 text-indigo-700'
              }`}>
                <Clock size={20} />
                <span className="font-mono text-xl font-bold">{formatTime(elapsedSeconds)}</span>
              </div>

              <button
                onClick={handlePauseResume}
                className={`p-2 rounded-lg transition-all ${
                  isPaused
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title={isPaused ? 'Reanudar' : 'Pausar'}
              >
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
              </button>

              <button
                onClick={handleExit}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Salir"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Barra de Progreso Mejorada */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Progreso General</span>
              <span className="font-semibold text-indigo-600">
                {completedSteps.length}/{scenario.steps.length} ({Math.round(progress)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-indigo-500 to-purple-500 transition-all duration-500 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${progress}%` }}
              >
                {progress > 10 && (
                  <span className="text-xs text-white font-bold">{Math.round(progress)}%</span>
                )}
              </div>
            </div>

            {/* Mini Steps Indicators */}
            <div className="flex gap-1 mt-3">
              {scenario.steps.map((_, index) => {
                const stepNumber = index + 1;
                const isCompleted = completedSteps.includes(stepNumber);
                const isCurrent = index === currentStepIndex;

                return (
                  <div
                    key={index}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      isCompleted
                        ? 'bg-green-500'
                        : isCurrent
                        ? 'bg-indigo-600 animate-pulse'
                        : 'bg-gray-200'
                    }`}
                    title={`Paso ${stepNumber}: ${scenario.steps[index].title}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Card del Paso Actual */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          {/* Número del Paso con Gradiente */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium uppercase tracking-wide">
                Paso {currentStepIndex + 1} de {scenario.steps.length}
              </span>
              {isStepCompleted && (
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <Check size={16} />
                  <span className="text-sm font-medium">Completado</span>
                </div>
              )}
            </div>
          </div>

          {/* Contenido del Paso */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold mb-6 ${
                isStepCompleted
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
              }`}>
                {isStepCompleted ? <Check size={32} /> : currentStepIndex + 1}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentStep.title}</h2>

              {/* NUEVO: Mostrar imagen/video si existe */}
              {currentStep.media && currentStep.media.type !== 'none' && (
                <div className="mb-6 rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 max-w-2xl mx-auto">
                  {currentStep.media.type === 'image' ? (
                    <img
                      src={currentStep.media.url}
                      alt={currentStep.title}
                      className="w-full h-auto object-cover"
                    />
                  ) : (
                    <video
                      src={currentStep.media.url}
                      poster={currentStep.media.thumbnail}
                      controls
                      className="w-full"
                    >
                      Tu navegador no soporta video HTML5.
                    </video>
                  )}
                </div>
              )}

              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                {currentStep.description}
              </p>
            </div>

            {/* Checkbox Grande y Visible */}
            <div className="flex justify-center">
              <label className={`flex items-center gap-4 px-8 py-4 rounded-xl border-2 cursor-pointer transition-all ${
                isStepCompleted
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-gray-50 border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
              } ${isPaused ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="checkbox"
                  checked={isStepCompleted}
                  onChange={handleCompleteStep}
                  disabled={isPaused}
                  className="w-7 h-7 text-indigo-600 border-gray-300 rounded-lg focus:ring-indigo-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-xl font-semibold">
                  {isStepCompleted ? '✓ Paso completado' : 'Marcar como completado'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Navegación Grande */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={handlePreviousStep}
            disabled={currentStepIndex === 0 || isPaused}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-indigo-500 transition-all font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
          >
            <ChevronLeft size={24} />
            <span>Anterior</span>
          </button>

          {currentStepIndex === scenario.steps.length - 1 ? (
            <button
              onClick={handleFinish}
              disabled={isPaused}
              className="col-span-2 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Award size={24} />
              <span>Finalizar Simulación</span>
            </button>
          ) : (
            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === scenario.steps.length - 1 || isPaused}
              className="col-span-2 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Siguiente Paso</span>
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* Ayuda/Hint */}
        {isPaused && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 font-medium">
              ⏸️ Simulación pausada. Presiona ▶️ para continuar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecuteSimulationPage;
