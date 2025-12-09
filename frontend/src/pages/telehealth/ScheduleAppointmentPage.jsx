/**
 * Página: Schedule Appointment
 * Formulario para agendar nueva cita - DIFERENCIADO POR ROL
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, FileText, Loader2, ArrowLeft, CheckCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import telehealthService from '../../services/telehealthService';
import userService from '../../services/userService';
import { useAuthStore } from '@/store/useAuthStore';
import {
  DURATION_OPTIONS,
  validateAppointmentData,
  formatAppointmentDateTime,
} from '@/constants/telehealth';

const ScheduleAppointmentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // ✅ NUEVO: Determinar rol del usuario
  const isStudent = user?.roles?.includes('STUDENT');
  const isTeacher = user?.roles?.includes('TEACHER');
  const isAdmin = user?.roles?.some(role => ['ADMINISTRATIVE', 'IT_ADMIN', 'DIRECTOR'].includes(role));

  const [formData, setFormData] = useState({
    studentId: '',
    teacherId: '',
    scheduledAt: '',
    duration: '',
    reason: '',
  });

  const [errors, setErrors] = useState({});
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  // AGREGAR: useEffect para pre-rellenar studentId si es STUDENT
  useEffect(() => {
    if (isStudent && user?.id) {
      setFormData(prev => ({
        ...prev,
        studentId: user.id,
      }));
    }
  }, [isStudent, user]);

  /**
   * Cargar docentes
   */
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoadingTeachers(true);

        // ✅ USAR userService (sin 's')
        const teachersList = await userService.getTeachers();

        console.log('👨‍🏫 Teachers loaded:', teachersList);
        setTeachers(teachersList);

        if (teachersList.length === 0) {
          toast.error('No hay docentes disponibles');
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
        toast.error('Error al cargar docentes');
      } finally {
        setLoadingTeachers(false);
      }
    };

    loadTeachers();
  }, []);

  /**
   * Cargar estudiantes (solo para ADMIN)
   */
  useEffect(() => {
    // Si no es admin, no cargar y marcar como completado
    if (!isAdmin) {
      setLoadingStudents(false);
      return;
    }

    const loadStudents = async () => {
      try {
        setLoadingStudents(true);

        const studentsList = await userService.getStudents();

        console.log('👨‍🎓 Students loaded:', studentsList);
        setStudents(studentsList);

        if (studentsList.length === 0) {
          console.warn('⚠️ No students found in system');
        }
      } catch (error) {
        console.error('❌ Error loading students:', error);
        toast.error('Error al cargar estudiantes');
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [isAdmin]);

  /**
   * Manejar cambios en el formulario
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ AGREGAR ESTE DEBUG
    console.log(`📝 FRONTEND - handleChange: ${name} = ${value}`);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo modificado
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    console.log('📝 Form data after change:', { ...formData, [name]: value }); // ✅ Y ESTE
  };

  /**
   * Verificar disponibilidad del docente
   */
  const handleCheckAvailability = async () => {
    if (!formData.teacherId || !formData.date || !formData.time) {
      toast.error('Por favor, selecciona docente, fecha y hora primero');
      return;
    }

    try {
      setCheckingAvailability(true);
      setAvailabilityMessage('');

      // Construir fecha en formato ISO
      const localDateTimeString = `${formData.date}T${formData.time}:00`;
      const localDate = new Date(localDateTimeString);

      // Ajustar a zona horaria de Perú (UTC-5)
      const peruOffset = -5 * 60;
      const localOffset = localDate.getTimezoneOffset();
      const peruTime = new Date(localDate.getTime() - (peruOffset - localOffset) * 60 * 1000);

      console.log('🔍 Checking availability:', {
        teacherId: formData.teacherId,
        scheduledAt: peruTime.toISOString(),
        duration: formData.duration,
      });

      const result = await telehealthService.checkAvailability({
        teacherId: formData.teacherId,
        scheduledAt: peruTime.toISOString(),
        duration: parseInt(formData.duration, 10),
      });

      console.log('✅ Availability result:', result);

      if (result.data?.isAvailable) {
        setAvailabilityMessage('✅ El docente está disponible en este horario');
        toast.success('Docente disponible');
      } else {
        setAvailabilityMessage('❌ El docente no está disponible. Por favor, elige otro horario.');
        toast.error('Docente no disponible en este horario');
      }
    } catch (error) {
      console.error('❌ Error checking availability:', error);
      const errorMessage = error.response?.data?.message || 'Error al verificar disponibilidad';
      toast.error(errorMessage);
      setAvailabilityMessage('');
    } finally {
      setCheckingAvailability(false);
    }
  };

  /**
   * Manejar envío del formulario
   * ✅ CORREGIDO: Usar scheduledAt del datetime-local
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar errores previos
    setErrors({});
    setAvailabilityMessage('');

    console.log('📝 Form data before validation:', formData);

    // Validaciones básicas
    if (!formData.teacherId) {
      toast.error('Por favor selecciona un docente');
      return;
    }

    if (!formData.scheduledAt) {
      toast.error('Por favor selecciona fecha y hora');
      return;
    }

    if (!formData.duration) {
      toast.error('Por favor selecciona la duración');
      return;
    }

    if (!formData.reason || formData.reason.trim().length < 10) {
      toast.error('El motivo debe tener al menos 10 caracteres');
      return;
    }

    // Validación adicional para ADMIN
    if (isAdmin && !formData.studentId) {
      toast.error('Debe seleccionar un estudiante');
      return;
    }

    try {
      setLoading(true);

      // ✅ SIMPLIFICADO: El datetime-local ya está en hora local
      // Solo agregamos ":00" para los segundos y convertimos a Date
      const localDateTimeString = formData.scheduledAt.includes(':00:00')
        ? formData.scheduledAt
        : `${formData.scheduledAt}:00`;

      const localDate = new Date(localDateTimeString);

      console.log('📅 Scheduling appointment:');
      console.log('  Input:', formData.scheduledAt);
      console.log('  Local Date:', localDate);
      console.log('  Local String:', localDate.toLocaleString('es-PE', { timeZone: 'America/Lima' }));
      console.log('  UTC (ISO):', localDate.toISOString());

      const appointmentData = {
        teacherId: formData.teacherId,
        scheduledAt: localDate.toISOString(),  // ✅ Conversión directa a UTC
        duration: parseInt(formData.duration, 10),
        reason: formData.reason.trim(),
      };

      // Si es ADMIN, incluir studentId
      if (isAdmin && formData.studentId) {
        appointmentData.studentId = formData.studentId;
      }

      console.log('📤 Final appointment data:', appointmentData);

      // Llamar al servicio
      const response = await telehealthService.scheduleAppointment(appointmentData);

      console.log('✅ Appointment scheduled successfully:', response);

      // Mostrar toast de éxito
      toast.success('¡Cita agendada exitosamente!');

      // Redirigir después de 1 segundo
      setTimeout(() => {
        navigate('/telehealth');
      }, 1000);

    } catch (error) {
      console.error('❌ Error scheduling appointment:', error);
      console.error('❌ Error response:', error.response?.data);

      // Extraer mensaje de error
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error?.message ||
                          'Error al agendar la cita';

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener fecha/hora mínima (ahora + 1 hora)
   */
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  // ✅ BLOQUEO PARA DOCENTES (opcional)
  if (isTeacher && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/telehealth')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver a Teleenfermería</span>
          </button>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Los estudiantes agendan citas contigo
            </h2>
            <p className="text-gray-600 mb-6">
              Como docente, recibirás solicitudes de citas de estudiantes. Puedes verlas y gestionarlas
              desde el dashboard de Teleenfermería.
            </p>
            <button
              onClick={() => navigate('/telehealth')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Ver Mis Citas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/telehealth')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver a Teleenfermería</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Calendar size={28} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isAdmin ? 'Agendar Cita (Admin)' : 'Agendar Cita'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isAdmin
                  ? 'Agenda una cita entre un estudiante y un docente'
                  : 'Reserva una consulta virtual con un docente'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ✅ NUEVO: Selector de Estudiante (solo ADMIN) */}
            {isAdmin && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={18} />
                  Estudiante
                </label>

                {loadingStudents ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Cargando estudiantes...</span>
                  </div>
                ) : (
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`
                      w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500
                      focus:border-transparent transition-colors
                      ${errors.studentId ? 'border-red-500' : 'border-gray-300'}
                    `}
                    required
                  >
                    <option value="">Selecciona un estudiante</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} - {student.email}
                      </option>
                    ))}
                  </select>
                )}

                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
                )}
              </div>
            )}

            {/* Seleccionar Docente */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User size={18} />
                Docente
              </label>

              {loadingTeachers ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="animate-spin" size={18} />
                  <span>Cargando docentes...</span>
                </div>
              ) : (
                <select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500
                    focus:border-transparent transition-colors
                    ${errors.teacherId ? 'border-red-500' : 'border-gray-300'}
                  `}
                  required
                >
                  <option value="">Selecciona un docente</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName} - {teacher.email}
                    </option>
                  ))}
                </select>
              )}

              {errors.teacherId && (
                <p className="mt-1 text-sm text-red-600">{errors.teacherId}</p>
              )}
            </div>

            {/* Resto del formulario igual... */}
            {/* (Fecha, Duración, Verificar Disponibilidad, Motivo, Botones) */}
            {/* ... código anterior sin cambios ... */}

            {/* Fecha y Hora */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar size={18} />
                Fecha y Hora
              </label>

              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleChange}
                min={getMinDateTime()}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500
                  focus:border-transparent transition-colors
                  ${errors.scheduledAt ? 'border-red-500' : 'border-gray-300'}
                `}
                required
              />

              {errors.scheduledAt && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduledAt}</p>
              )}

              {formData.scheduledAt && (
                <p className="mt-2 text-sm text-gray-600">
                  📅 {formatAppointmentDateTime(formData.scheduledAt)}
                </p>
              )}
            </div>

            {/* Duración */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock size={18} />
                Duración
              </label>

              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500
                  focus:border-transparent transition-colors
                  ${errors.duration ? 'border-red-500' : 'border-gray-300'}
                `}
                required
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
              )}
            </div>

            {/* Verificar Disponibilidad */}
            {formData.teacherId && formData.scheduledAt && (
              <div>
                <button
                  type="button"
                  onClick={handleCheckAvailability}
                  disabled={checkingAvailability}
                  className="
                    w-full flex items-center justify-center gap-2 px-4 py-2
                    border-2 border-indigo-600 text-indigo-600
                    rounded-lg hover:bg-indigo-50 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {checkingAvailability ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>Verificar Disponibilidad</span>
                    </>
                  )}
                </button>

                {availabilityMessage && (
                  <p
                    className={`
                    mt-2 text-sm font-medium
                    ${availabilityMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}
                  `}
                  >
                    {availabilityMessage}
                  </p>
                )}
              </div>
            )}

            {/* Motivo */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText size={18} />
                Motivo de la Consulta
              </label>

              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Describe brevemente el motivo de tu consulta"
                rows={5}
                maxLength={500}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500
                  focus:border-transparent transition-colors resize-none
                  ${errors.reason ? 'border-red-500' : 'border-gray-300'}
                `}
                required
              />

              <div className="flex items-center justify-between mt-1">
                {errors.reason && <p className="text-sm text-red-600">{errors.reason}</p>}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.reason.length} / 500 caracteres
                  {formData.reason.length >= 10 && (
                    <span className="text-green-600 ml-2">✓</span>
                  )}
                </p>
              </div>

              {/* Ayuda adicional */}
              <p className="text-xs text-gray-500 mt-2">
                💡 Mínimo 10 caracteres, máximo 500. Sé breve y claro.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/telehealth')}
                className="
                  flex-1 px-4 py-2 border border-gray-300 text-gray-700
                  rounded-lg hover:bg-gray-50 transition-colors
                "
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="
                  flex-1 flex items-center justify-center gap-2 px-4 py-2
                  bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Agendando...</span>
                  </>
                ) : (
                  <>
                    <Calendar size={18} />
                    <span>Agendar Cita</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info adicional */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Información importante:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            {isAdmin ? (
              <>
                <li>• Como administrador, puedes agendar citas entre cualquier estudiante y docente</li>
                <li>• Las citas deben agendarse con al menos 1 hora de anticipación</li>
                <li>• El estudiante y docente recibirán notificaciones por email</li>
              </>
            ) : (
              <>
                <li>• Las citas deben agendarse con al menos 1 hora de anticipación</li>
                <li>• Puedes cancelar hasta 2 horas antes sin penalización</li>
                <li>• Recibirás un recordatorio 24 horas antes de la cita</li>
                <li>• Asegúrate de tener una conexión estable de internet</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScheduleAppointmentPage;
