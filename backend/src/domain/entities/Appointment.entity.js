/**
 * Entity: Appointment
 * Representa una cita de teleenfermería
 */

const { AppointmentStatus } = require('../enums/AppointmentStatus.enum');

class Appointment {
  constructor({
    id = null,
    studentId,
    teacherId,
    scheduledAt,
    duration = 30,
    status = AppointmentStatus.SCHEDULED,
    reason = null,
    notes = null,
    recordingUrl = null,
    vitalSigns = null,
    createdAt = new Date(),
    updatedAt = new Date(),
    skipValidation = false, // ✅ NUEVO PARÁMETRO
  }) {
    this.id = id;
    this.studentId = this.validateUserId(studentId, 'Student');
    this.teacherId = this.validateUserId(teacherId, 'Teacher');

    // ✅ Solo validar si NO viene de la DB
    this.scheduledAt = skipValidation
      ? new Date(scheduledAt)
      : this.validateScheduledAt(scheduledAt);

    this.duration = this.validateDuration(duration);
    this.status = this.validateStatus(status);
    this.reason = reason;
    this.notes = notes;
    this.recordingUrl = recordingUrl;
    this.vitalSigns = vitalSigns;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  }

  // ============================================
  // VALIDACIONES
  // ============================================

  validateUserId(userId, userType) {
    if (!userId) {
      throw new Error(`${userType} ID is required`);
    }
    return userId;
  }

  validateScheduledAt(scheduledAt) {
    const date = new Date(scheduledAt);
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(date.getTime())) {
      throw new Error('Invalid scheduled date');
    }

    // No puede ser en el pasado (con margen de 5 minutos)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    if (date < fiveMinutesAgo) {
      throw new Error('Scheduled date cannot be in the past');
    }

    return date;
  }

  validateDuration(duration) {
    if (typeof duration !== 'number' || duration < 15 || duration > 120) {
      throw new Error('Duration must be between 15 and 120 minutes');
    }
    return duration;
  }

  validateStatus(status) {
    if (!Object.values(AppointmentStatus).includes(status)) {
      throw new Error(`Invalid appointment status: ${status}`);
    }
    return status;
  }

  // ============================================
  // MÉTODOS DE NEGOCIO
  // ============================================

  /**
   * Confirmar cita
   */
  confirm() {
    if (this.status !== AppointmentStatus.SCHEDULED) {
      throw new Error('Only scheduled appointments can be confirmed');
    }
    this.status = AppointmentStatus.CONFIRMED;
    this.updatedAt = new Date();
  }

  /**
   * Iniciar cita
   */
  start() {
    if (
      this.status !== AppointmentStatus.CONFIRMED &&
      this.status !== AppointmentStatus.SCHEDULED
    ) {
      throw new Error('Only confirmed or scheduled appointments can be started');
    }
    this.status = AppointmentStatus.IN_PROGRESS;
    this.updatedAt = new Date();
  }

  /**
   * Completar cita
   */
  complete(notes = null) {
    if (this.status !== AppointmentStatus.IN_PROGRESS) {
      throw new Error('Only in-progress appointments can be completed');
    }
    this.status = AppointmentStatus.COMPLETED;
    if (notes) this.notes = notes;
    this.updatedAt = new Date();
  }

  /**
   * Cancelar cita
   */
  cancel() {
    if (this.status === AppointmentStatus.COMPLETED) {
      throw new Error('Completed appointments cannot be cancelled');
    }
    this.status = AppointmentStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  /**
   * Marcar como no show
   */
  markAsNoShow() {
    if (
      this.status !== AppointmentStatus.SCHEDULED &&
      this.status !== AppointmentStatus.CONFIRMED
    ) {
      throw new Error('Only scheduled or confirmed appointments can be marked as no-show');
    }
    this.status = AppointmentStatus.NO_SHOW;
    this.updatedAt = new Date();
  }

  /**
   * Agregar URL de grabación
   */
  addRecording(recordingUrl) {
    if (!recordingUrl || typeof recordingUrl !== 'string') {
      throw new Error('Invalid recording URL');
    }
    this.recordingUrl = recordingUrl;
    this.updatedAt = new Date();
  }

  /**
   * Agregar signos vitales
   */
  addVitalSigns(vitalSigns) {
    this.vitalSigns = vitalSigns;
    this.updatedAt = new Date();
  }

  /**
   * Calcular hora de fin
   */
  getEndTime() {
    return new Date(this.scheduledAt.getTime() + this.duration * 60 * 1000);
  }

  /**
   * Verificar si la cita ya pasó
   */
  isPast() {
    return this.getEndTime() < new Date();
  }

  /**
   * Verificar si la cita es hoy
   */
  isToday() {
    const today = new Date();
    return (
      this.scheduledAt.getDate() === today.getDate() &&
      this.scheduledAt.getMonth() === today.getMonth() &&
      this.scheduledAt.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Convertir a objeto plano
   */
  toObject() {
    return {
      id: this.id,
      studentId: this.studentId,
      teacherId: this.teacherId,
      scheduledAt: this.scheduledAt,
      endTime: this.getEndTime(),
      duration: this.duration,
      status: this.status,
      reason: this.reason,
      notes: this.notes,
      recordingUrl: this.recordingUrl,
      vitalSigns: this.vitalSigns,
      isPast: this.isPast(),
      isToday: this.isToday(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Appointment;
