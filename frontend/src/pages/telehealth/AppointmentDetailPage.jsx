/**
 * Página: Appointment Detail
 * Detalles completos de una cita de teleenfermería
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Video,
  XCircle,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import telehealthService from '../../services/telehealthService';
import { useAuthStore } from '@/store/useAuthStore';
import StatusBadge from '../../components/telehealth/StatusBadge';
import {
  formatAppointmentDate,
  formatAppointmentTime,
  getTimeUntilAppointment,
  canCancelAppointment,
  canStartVideoCall,
  formatDuration,
  APPOINTMENT_STATUS,
} from '@/constants/telehealth';

const AppointmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  /**
   * Cargar detalles de la cita
   */
  const loadAppointmentDetails = async () => {
    try {
      setLoading(true);

      console.log('🔄 Loading appointment details for ID:', id);

      const response = await telehealthService.getAppointmentDetails(id);

      console.log('📋 Raw response:', response);
      console.log('📋 Response type:', typeof response);
      console.log('📋 Response.success:', response?.success);
      console.log('📋 Response.data:', response?.data);
      console.log('📋 Response.id:', response?.id);

      // ✅ Determinar estructura de la respuesta
      let appointmentData = null;

      if (response?.success && response?.data) {
        // Caso 1: { success: true, data: {...} }
        console.log('✅ Estructura: { success, data }');
        appointmentData = response.data;
      } else if (response?.id) {
        // Caso 2: Appointment directo
        console.log('✅ Estructura: Appointment directo');
        appointmentData = response;
      } else {
        // Caso 3: Respuesta inválida
        console.error('❌ Respuesta no reconocida');
        toast.error('Error: Respuesta inválida del servidor');
        navigate('/telehealth');
        return;
      }

      // ✅ Verificar que tenemos datos válidos
      if (!appointmentData?.id) {
        console.error('❌ appointmentData no tiene ID:', appointmentData);
        toast.error('Error: Datos de cita inválidos');
        navigate('/telehealth');
        return;
      }

      console.log('✅ Setting appointment state:', {
        id: appointmentData.id,
        status: appointmentData.status,
        scheduledAt: appointmentData.scheduledAt,
      });

      setAppointment(appointmentData);

    } catch (error) {
      console.error('❌ Error loading appointment details:', error);

      const errorMessage = error.response?.data?.message || 'Error al cargar los detalles de la cita';
      toast.error(errorMessage);

      setTimeout(() => navigate('/telehealth'), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointmentDetails();
  }, [id]);

  /**
   * Cancelar cita
   */
  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      toast.error('Por favor, indica el motivo de cancelación');
      return;
    }

    try {
      setCancelling(true);

      console.log('🚫 Cancelling appointment:', { id, reason: cancelReason });

      const response = await telehealthService.cancelAppointment(id, cancelReason);

      console.log('✅ Cancel response:', response);

      if (response?.success || response?.id) {
        toast.success('Cita cancelada exitosamente');

        setShowCancelModal(false);
        setCancelReason('');

        console.log('🔄 Reloading appointment after cancel...');
        await loadAppointmentDetails();
        console.log('✅ Appointment reloaded after cancel');
      } else {
        toast.error('No se pudo cancelar la cita');
      }
    } catch (error) {
      console.error('❌ Error cancelling appointment:', error);
      const errorMessage = error.response?.data?.message || 'Error al cancelar la cita';
      toast.error(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  /**
   * Iniciar videollamada
   */
  const handleStartVideoCall = () => {
    if (!canStartVideoCall(appointment.scheduledAt, appointment.status)) {
      toast.error('Solo puedes iniciar la llamada 15 minutos antes de la hora agendada');
      return;
    }

    navigate(`/telehealth/video/${id}`);
  };

  /**
   * Confirmar asistencia
   */
  const handleConfirmAppointment = async () => {
    try {
      setLoading(true);

      console.log('✅ Confirming appointment:', id);

      const response = await telehealthService.updateAppointmentStatus(
        id,
        APPOINTMENT_STATUS.CONFIRMED,
        'Confirmado por el usuario'
      );

      console.log('✅ Confirm response:', response);

      if (response?.success || response?.id) {
        toast.success('Cita confirmada');

        console.log('🔄 Reloading appointment after confirm...');
        await loadAppointmentDetails();
        console.log('✅ Appointment reloaded after confirm');
      } else {
        toast.error('No se pudo confirmar la cita');
      }
    } catch (error) {
      console.error('❌ Error confirming appointment:', error);
      const errorMessage = error.response?.data?.message || 'Error al confirmar la cita';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Cargando detalles de la cita...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
          <p className="text-gray-900 font-semibold mb-2">Cita no encontrada</p>
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

  const canCancel = canCancelAppointment(appointment.scheduledAt, appointment.status);
  const canStart = canStartVideoCall(appointment.scheduledAt, appointment.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/telehealth')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver a Teleenfermería</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Detalles de la Cita</h1>
              <p className="text-gray-600 mt-1">
                {getTimeUntilAppointment(appointment.scheduledAt)}
              </p>
            </div>

            <StatusBadge status={appointment.status} />
          </div>
        </div>

        {/* Información principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="text-indigo-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatAppointmentDate(appointment.scheduledAt)}
                </p>
              </div>
            </div>

            {/* Hora */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hora</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatAppointmentTime(appointment.scheduledAt)}
                </p>
                <p className="text-sm text-gray-500">
                  Duración: {formatDuration(appointment.duration)}
                </p>
              </div>
            </div>

            {/* Docente */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Docente</p>
                <p className="text-lg font-semibold text-gray-900">
                  {appointment.teacher?.firstName} {appointment.teacher?.lastName}
                </p>
                <p className="text-sm text-gray-500">{appointment.teacher?.email}</p>
              </div>
            </div>

            {/* Estudiante (si el usuario es docente) */}
            {user?.roles?.includes('TEACHER') && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estudiante</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {appointment.student?.firstName} {appointment.student?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{appointment.student?.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Motivo */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="text-yellow-600" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Motivo de la Consulta</p>
                <p className="text-gray-900">{appointment.reason}</p>
              </div>
            </div>
          </div>

          {/* Notas (si existen) */}
          {appointment.notes && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Notas:</p>
              <p className="text-gray-600">{appointment.notes}</p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Confirmar cita */}
            {appointment.status === APPOINTMENT_STATUS.SCHEDULED && (
              <button
                onClick={handleConfirmAppointment}
                className="
                  flex items-center justify-center gap-2 px-4 py-3
                  bg-green-600 text-white rounded-lg hover:bg-green-700
                  transition-colors
                "
              >
                <CheckCircle size={20} />
                <span>Confirmar Asistencia</span>
              </button>
            )}

            {/* Iniciar videollamada */}
            {canStart && (
              <button
                onClick={handleStartVideoCall}
                className="
                  flex items-center justify-center gap-2 px-4 py-3
                  bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                  transition-colors
                "
              >
                <Video size={20} />
                <span>Iniciar Videollamada</span>
              </button>
            )}

            {/* Cancelar cita */}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="
                  flex items-center justify-center gap-2 px-4 py-3
                  bg-red-600 text-white rounded-lg hover:bg-red-700
                  transition-colors
                "
              >
                <XCircle size={20} />
                <span>Cancelar Cita</span>
              </button>
            )}
          </div>

          {/* Mensaje de información */}
          {!canStart &&
            appointment.status !== APPOINTMENT_STATUS.COMPLETED &&
            appointment.status !== APPOINTMENT_STATUS.CANCELLED && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Podrás iniciar la videollamada 15 minutos antes de la hora agendada
                </p>
              </div>
            )}
        </div>

        {/* Modal de cancelación */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cancelar Cita</h3>

              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que deseas cancelar esta cita? Por favor, indica el motivo:
              </p>

              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Motivo de cancelación..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={cancelling}
                >
                  Volver
                </button>

                <button
                  onClick={handleCancelAppointment}
                  disabled={cancelling || !cancelReason.trim()}
                  className="
                    flex-1 flex items-center justify-center gap-2 px-4 py-2
                    bg-red-600 text-white rounded-lg hover:bg-red-700
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Cancelando...</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={18} />
                      <span>Confirmar Cancelación</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetailPage;
