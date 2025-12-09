/**
 * Componente: AppointmentCard
 * Card para mostrar resumen de una cita en el listado
 * ✅ CORREGIDO: Overflow de email, estructura flex
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Video, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import {
  formatAppointmentDate,
  formatAppointmentTime,
  getTimeUntilAppointment,
  canStartVideoCall,
  formatDuration,
} from '@/constants/telehealth';
import { useAuthStore } from '@/store/useAuthStore';

const AppointmentCard = ({ appointment }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const canStart = canStartVideoCall(appointment.scheduledAt, appointment.status);
  const isTeacher = user?.roles?.includes('TEACHER');

  // ✅ NUEVO: Obtener persona a mostrar
  const displayPerson = isTeacher ? appointment.student : appointment.teacher;
  const displayName = displayPerson
    ? `${displayPerson.firstName} ${displayPerson.lastName}`
    : 'Usuario desconocido';
  const displayEmail = displayPerson?.email || 'Sin email';

  /**
   * Navegar a detalles
   */
  const handleViewDetails = () => {
    navigate(`/telehealth/appointments/${appointment.id}`);
  };

  /**
   * Iniciar videollamada
   */
  const handleStartCall = (e) => {
    e.stopPropagation();
    navigate(`/telehealth/video/${appointment.id}`);
  };

  return (
    <div
      onClick={handleViewDetails}
      className="
        bg-white rounded-lg shadow-sm border border-gray-200
        hover:shadow-md hover:border-indigo-300
        transition-all cursor-pointer
        p-4
      "
    >
      {/* Header: Estado y persona */}
      <div className="flex items-start justify-between mb-3 gap-2">
        {/* ✅ CORREGIDO: Persona con truncate */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
            <User size={20} className="text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate" title={displayName}>
              {displayName}
            </p>
            <p className="text-sm text-gray-500 truncate" title={displayEmail}>
              {displayEmail}
            </p>
          </div>
        </div>

        {/* ✅ Badge con flex-shrink-0 */}
        <div className="flex-shrink-0">
          <StatusBadge status={appointment.status} />
        </div>
      </div>

      {/* Fecha y Hora */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} className="flex-shrink-0" />
          <span>{formatAppointmentDate(appointment.scheduledAt)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} className="flex-shrink-0" />
          <span>
            {formatAppointmentTime(appointment.scheduledAt)} • {formatDuration(appointment.duration)}
          </span>
        </div>
      </div>

      {/* Motivo (truncado) */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 line-clamp-2" title={appointment.reason}>
          {appointment.reason}
        </p>
      </div>

      {/* Tiempo restante */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
          <Clock size={14} className="text-gray-600 flex-shrink-0" />
          <span className="text-sm text-gray-700">
            {getTimeUntilAppointment(appointment.scheduledAt)}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        {canStart ? (
          <>
            <button
              onClick={handleStartCall}
              className="
                flex-1 flex items-center justify-center gap-2 px-4 py-2
                bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                transition-colors font-medium
              "
            >
              <Video size={18} />
              <span>Iniciar Llamada</span>
            </button>

            <button
              onClick={handleViewDetails}
              className="
                px-4 py-2 border border-gray-300 text-gray-700 rounded-lg
                hover:bg-gray-50 transition-colors
              "
            >
              <ArrowRight size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={handleViewDetails}
            className="
              w-full flex items-center justify-center gap-2 px-4 py-2
              border border-indigo-600 text-indigo-600 rounded-lg
              hover:bg-indigo-50 transition-colors font-medium
            "
          >
            <span>Ver Detalles</span>
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
