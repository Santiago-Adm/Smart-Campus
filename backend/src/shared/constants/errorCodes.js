/**
 * Event Types
 * Define todos los tipos de eventos del sistema
 */

module.exports = {
  // ============================================
  // AUTH EVENTS
  // ============================================
  USER_CREATED: 'user.created',
  USER_LOGGED_IN: 'user.logged_in',
  PASSWORD_RESET_REQUESTED: 'password.reset.requested',
  PASSWORD_RESET_COMPLETED: 'password.reset.completed',

  // ============================================
  // DOCUMENT EVENTS
  // ============================================
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_VALIDATED: 'document.validated',
  DOCUMENT_APPROVED: 'document.approved',
  DOCUMENT_REJECTED: 'document.rejected',

  // ============================================
  // LIBRARY EVENTS
  // ============================================
  RESOURCE_ACCESSED: 'resource.accessed',
  RESOURCE_RECOMMENDED: 'resource.recommended',
  RESOURCE_UPLOADED: 'resource.uploaded',

  // ============================================
  // SIMULATION EVENTS
  // ============================================
  SIMULATION_STARTED: 'simulation.started',
  SIMULATION_COMPLETED: 'simulation.completed',
  SCENARIO_CREATED: 'scenario.created',
  IOT_DEVICE_CONNECTED: 'iot.device.connected',

  // ============================================
  // TELEHEALTH EVENTS
  // ============================================
  APPOINTMENT_SCHEDULED: 'appointment.scheduled',
  APPOINTMENT_STARTED: 'appointment.started',
  APPOINTMENT_COMPLETED: 'appointment.completed',
  APPOINTMENT_CANCELLED: 'appointment.cancelled',
  SESSION_RECORDED: 'session.recorded',

  // ============================================
  // ANALYTICS EVENTS
  // ============================================
  REPORT_GENERATED: 'report.generated',
  ALERT_TRIGGERED: 'alert.triggered',
  PREDICTION_CALCULATED: 'prediction.calculated',

  // ============================================
  // CHATBOT EVENTS
  // ============================================
  MESSAGE_PROCESSED: 'message.processed',
  CONVERSATION_STARTED: 'conversation.started',
  CONVERSATION_ESCALATED: 'conversation.escalated',
  CONVERSATION_CLOSED: 'conversation.closed',
};
