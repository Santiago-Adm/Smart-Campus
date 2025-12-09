/**
 * Interface: INotificationService
 * Contrato para servicios de notificaciones (Email, SMS, Push)
 */

class INotificationService {
  /**
   * Enviar email
   * @param {Object} _options - { to, subject, html, text }
   * @returns {Promise<boolean>}
   */
  async sendEmail(_options) {
    throw new Error('Method sendEmail() must be implemented');
  }

  /**
   * Enviar email de bienvenida
   * @param {string} _email
   * @param {string} _userName
   * @returns {Promise<boolean>}
   */
  async sendWelcomeEmail(_email, _userName) {
    throw new Error('Method sendWelcomeEmail() must be implemented');
  }

  /**
   * Enviar email de recuperación de contraseña
   * @param {string} _email
   * @param {string} _resetToken
   * @returns {Promise<boolean>}
   */
  async sendPasswordResetEmail(_email, _resetToken) {
    throw new Error('Method sendPasswordResetEmail() must be implemented');
  }

  /**
   * Enviar notificación de cambio de estado de documento
   * @param {string} _email
   * @param {Object} _documentInfo
   * @returns {Promise<boolean>}
   */
  async sendDocumentStatusEmail(_email, _documentInfo) {
    throw new Error('Method sendDocumentStatusEmail() must be implemented');
  }

  /**
   * Enviar recordatorio de cita
   * @param {string} _email
   * @param {Object} _appointmentInfo
   * @returns {Promise<boolean>}
   */
  async sendAppointmentReminderEmail(_email, _appointmentInfo) {
    throw new Error('Method sendAppointmentReminderEmail() must be implemented');
  }

  /**
   * Enviar SMS (opcional)
   * @param {string} _phone
   * @param {string} _message
   * @returns {Promise<boolean>}
   */
  async sendSMS(_phone, _message) {
    throw new Error('Method sendSMS() must be implemented');
  }
}

module.exports = INotificationService;
