/**
 * Página: Video Call
 * Interfaz de videollamada (MOCKUP - UI placeholder)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Maximize2,
  MessageSquare,
  Activity,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import telehealthService from '../../services/telehealthService';
import { useAuthStore } from '@/store/useAuthStore';
import {
  formatAppointmentTime,
  generateMockVitalSigns,
  APPOINTMENT_STATUS,
} from '@/constants/telehealth';

const VideoCallPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de la llamada
  const [callStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showVitalSigns, setShowVitalSigns] = useState(true);

  // Signos vitales MOCK
  const [vitalSigns, setVitalSigns] = useState(generateMockVitalSigns());

  /**
   * Cargar detalles de la cita
   */
  useEffect(() => {
    const loadAppointment = async () => {
      try {
        setLoading(true);

        const response = await telehealthService.getAppointmentDetails(id);

        if (response && response.success) {
          setAppointment(response.data);

          // Actualizar estado a IN_PROGRESS si está agendada o confirmada
          if (
            response.data.status === APPOINTMENT_STATUS.SCHEDULED ||
            response.data.status === APPOINTMENT_STATUS.CONFIRMED
          ) {
            await telehealthService.updateAppointmentStatus(
              id,
              APPOINTMENT_STATUS.IN_PROGRESS,
              'Videollamada iniciada'
            );
          }
        }
      } catch (error) {
        console.error('Error loading appointment:', error);
        toast.error('Error al cargar la cita');
        navigate('/telehealth');
      } finally {
        setLoading(false);
      }
    };

    loadAppointment();
  }, [id]);

  /**
   * Timer de duración de llamada
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStartTime]);

  /**
   * Actualizar signos vitales MOCK cada 5 segundos
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setVitalSigns(generateMockVitalSigns());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Formatear tiempo transcurrido (MM:SS)
   */
  const formatElapsedTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  /**
   * Finalizar llamada
   */
  const handleEndCall = async () => {
    const confirmEnd = window.confirm(
      '¿Estás seguro de que deseas finalizar la videollamada?'
    );

    if (!confirmEnd) return;

    try {
      // Actualizar estado a COMPLETED
      await telehealthService.updateAppointmentStatus(
        id,
        APPOINTMENT_STATUS.COMPLETED,
        `Videollamada completada. Duración: ${formatElapsedTime(elapsedTime)}`
      );

      toast.success('Videollamada finalizada');

      // Redirigir a detalles de la cita
      setTimeout(() => {
        navigate(`/telehealth/appointments/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Error al finalizar la llamada');
    }
  };

  /**
   * Toggle micrófono
   */
  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    toast.success(isMicOn ? 'Micrófono silenciado' : 'Micrófono activado');
  };

  /**
   * Toggle cámara
   */
  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    toast.success(isCameraOn ? 'Cámara desactivada' : 'Cámara activada');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-white mx-auto mb-4" size={48} />
          <p className="text-white">Conectando a la videollamada...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Cita no encontrada</p>
          <button
            onClick={() => navigate('/telehealth')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Volver a Teleenfermería
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header con info de la cita */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/telehealth/appointments/${id}`)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>

            <div>
              <h2 className="text-white font-semibold">
                Videollamada con{' '}
                {user?.roles?.includes('TEACHER')
                  ? `${appointment.student?.firstName} ${appointment.student?.lastName}`
                  : `${appointment.teacher?.firstName} ${appointment.teacher?.lastName}`}
              </h2>
              <p className="text-gray-400 text-sm">
                Agendada: {formatAppointmentTime(appointment.scheduledAt)} • Duración:{' '}
                {appointment.duration} min
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white font-mono text-lg">{formatElapsedTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {/* Área principal */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Video principal */}
        <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden relative">
          {/* MOCKUP: Placeholder de video */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
            <div className="text-center">
              <Video size={64} className="text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-semibold mb-2">
                Funcionalidad de Video en Desarrollo
              </p>
              <p className="text-gray-500 text-sm">
                Esta es una interfaz de demostración
              </p>
              <p className="text-gray-500 text-sm">
                La videollamada real se implementará con WebRTC o servicio third-party
              </p>
            </div>
          </div>

          {/* Video local (pequeño) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg border-2 border-gray-600 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              {isCameraOn ? (
                <div className="text-center">
                  <Video size={32} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs">Tu cámara</p>
                </div>
              ) : (
                <div className="text-center">
                  <VideoOff size={32} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs">Cámara desactivada</p>
                </div>
              )}
            </div>
          </div>

          {/* Indicador de micrófono */}
          {!isMicOn && (
            <div className="absolute top-4 left-4 bg-red-600 px-3 py-2 rounded-lg flex items-center gap-2">
              <MicOff size={18} className="text-white" />
              <span className="text-white text-sm">Micrófono silenciado</span>
            </div>
          )}

          {/* Botón de pantalla completa */}
          <button
            className="absolute top-4 right-4 p-2 bg-gray-800 bg-opacity-75 hover:bg-opacity-100 rounded-lg transition-colors"
            onClick={() => toast.info('Funcionalidad en desarrollo')}
          >
            <Maximize2 size={20} className="text-white" />
          </button>
        </div>

        {/* Panel lateral: Signos vitales */}
        {showVitalSigns && (
          <div className="w-80 bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Activity size={20} />
                Signos Vitales (MOCK)
              </h3>
              <button
                onClick={() => setShowVitalSigns(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Frecuencia Cardíaca */}
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Frecuencia Cardíaca</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-red-400">
                    {vitalSigns.heartRate.value}
                  </span>
                  <span className="text-gray-400">{vitalSigns.heartRate.unit}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Rango normal: {vitalSigns.heartRate.range}
                </p>
              </div>

              {/* Presión Arterial */}
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Presión Arterial</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-blue-400">
                    {vitalSigns.bloodPressure.systolic}/{vitalSigns.bloodPressure.diastolic}
                  </span>
                  <span className="text-gray-400">{vitalSigns.bloodPressure.unit}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Estado: Normal</p>
              </div>

              {/* Saturación de Oxígeno */}
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Saturación de O₂</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-green-400">
                    {vitalSigns.oxygenSaturation.value}
                  </span>
                  <span className="text-gray-400">{vitalSigns.oxygenSaturation.unit}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Rango normal: {vitalSigns.oxygenSaturation.range}
                </p>
              </div>

              {/* Temperatura */}
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Temperatura</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-yellow-400">
                    {vitalSigns.temperature.value}
                  </span>
                  <span className="text-gray-400">{vitalSigns.temperature.unit}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Rango normal: {vitalSigns.temperature.range}
                </p>
              </div>

              {/* Frecuencia Respiratoria */}
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Frecuencia Respiratoria</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-purple-400">
                    {vitalSigns.respiratoryRate.value}
                  </span>
                  <span className="text-gray-400">{vitalSigns.respiratoryRate.unit}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Rango normal: {vitalSigns.respiratoryRate.range}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-900 bg-opacity-50 rounded-lg">
              <p className="text-blue-300 text-xs">
                💡 Datos simulados. La integración IoT real se implementará en producción.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controles de llamada */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Toggle Micrófono */}
          <button
            onClick={toggleMic}
            className={`
              p-4 rounded-full transition-colors
              ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}
            `}
          >
            {isMicOn ? (
              <Mic size={24} className="text-white" />
            ) : (
              <MicOff size={24} className="text-white" />
            )}
          </button>

          {/* Toggle Cámara */}
          <button
            onClick={toggleCamera}
            className={`
              p-4 rounded-full transition-colors
              ${isCameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}
            `}
          >
            {isCameraOn ? (
              <Video size={24} className="text-white" />
            ) : (
              <VideoOff size={24} className="text-white" />
            )}
          </button>

          {/* Finalizar llamada */}
          <button
            onClick={handleEndCall}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          >
            <PhoneOff size={24} className="text-white" />
          </button>

          {/* Chat */}
          <button
            onClick={() => {
              setShowChat(!showChat);
              toast.info('Funcionalidad de chat en desarrollo');
            }}
            className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
          >
            <MessageSquare size={24} className="text-white" />
          </button>

          {/* Signos vitales */}
          {!showVitalSigns && (
            <button
              onClick={() => setShowVitalSigns(true)}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            >
              <Activity size={24} className="text-white" />
            </button>
          )}
        </div>

        <p className="text-center text-gray-400 text-sm mt-4">
          Controles de videollamada • Mockup UI para demostración
        </p>
      </div>
    </div>
  );
};

export default VideoCallPage;
