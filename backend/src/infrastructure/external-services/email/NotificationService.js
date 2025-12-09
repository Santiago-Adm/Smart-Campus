/**
 * NotificationService Implementation
 * Implementa INotificationService usando SendGrid/NodeMailer
 */

const nodemailer = require('nodemailer');
const INotificationService = require('../../../domain/interfaces/services/INotificationService');
const config = require('../../config/env.config');

class NotificationService extends INotificationService {
  constructor() {
    super();
    this._initializeTransporter();
  }

  /**
   * Inicializar transporter de email
   */
  _initializeTransporter() {
    // Si tienes SendGrid API Key, usa esto:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Por ahora usamos nodemailer con configuración de prueba
    // En producción, configura con tu servidor SMTP real
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'test@example.com',
        pass: process.env.SMTP_PASS || 'password',
      },
    });
  }

  /**
   * Enviar email genérico
   */
  async sendEmail(options) {
    try {
      const { to, subject, html, text } = options;

      if (!to || !subject) {
        throw new Error('Email recipient and subject are required');
      }

      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'Smart Campus'} <${
          process.env.EMAIL_FROM || 'noreply@smartcampus.edu.pe'
        }>`,
        to,
        subject,
        html: html || text,
        text: text || '',
      };

      // En desarrollo, solo log (no enviar realmente)
      if (config.env === 'development') {
        console.log('📧 Email (DEV MODE - Not sent):');
        console.log('   To:', to);
        console.log('   Subject:', subject);
        console.log('   Preview:', `${(html || text).substring(0, 100)}...`);
        return true;
      }

      // En producción, enviar realmente
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);

      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error.message);
      return false;
    }
  }

  /**
   * Enviar email de bienvenida
   */
  async sendWelcomeEmail(email, userName) {
    const subject = '¡Bienvenido a Smart Campus Instituto!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">¡Bienvenido a Smart Campus, ${userName}!</h2>
        <p>Tu cuenta ha sido creada exitosamente.</p>
        <p>Ya puedes acceder a la plataforma y comenzar a utilizar todos nuestros servicios:</p>
        <ul>
          <li>Gestión de documentos</li>
          <li>Biblioteca virtual</li>
          <li>Simulaciones AR</li>
          <li>Teleenfermería</li>
          <li>Y mucho más...</li>
        </ul>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p>¡Éxitos en tu formación!</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Instituto Superior Técnico de Enfermería "María Parado de Bellido"<br>
          Ayacucho, Perú
        </p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${config.baseUrl}/reset-password?token=${resetToken}`;
    const subject = 'Recuperación de Contraseña - Smart Campus';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Recuperación de Contraseña</h2>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #2563eb; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Restablecer Contraseña
          </a>
        </div>
        <p style="color: #ef4444; font-weight: bold;">
          ⚠️ Este enlace expira en 1 hora.
        </p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Por seguridad, nunca compartas este enlace con nadie.
        </p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  /**
   * Enviar notificación de cambio de estado de documento
   */
  async sendDocumentStatusEmail(email, documentInfo) {
    const { documentType, status, reason } = documentInfo;

    let statusText = '';
    let statusColor = '';

    if (status === 'APPROVED') {
      statusText = 'APROBADO ✅';
      statusColor = '#10b981';
    } else if (status === 'REJECTED') {
      statusText = 'RECHAZADO ❌';
      statusColor = '#ef4444';
    } else {
      statusText = 'EN REVISIÓN 🔄';
      statusColor = '#f59e0b';
    }

    const subject = `Actualización de Documento: ${documentType}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Actualización de Estado de Documento</h2>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Tipo de Documento:</strong> ${documentType}</p>
          <p><strong>Estado:</strong> <span style="color: ${statusColor};">${statusText}</span></p>
          ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
        </div>
        ${
          status === 'REJECTED'
            ? '<p>Por favor, revisa los comentarios y vuelve a subir el documento corregido.</p>'
            : '<p>Puedes ver el detalle en tu panel de documentos.</p>'
        }
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Smart Campus Instituto - Sistema de Gestión Documental
        </p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  /**
   * Enviar email de cita agendada
   */
  async sendAppointmentScheduledEmail(email, appointmentData) {
    const { teacherName, studentName, scheduledAt, duration } = appointmentData;

    const subject = 'Cita de Teleenfermería Agendada - Smart Campus';

    // Formatear fecha
    const appointmentDate = new Date(scheduledAt);
    const formattedDate = appointmentDate.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
            border-top: none;
          }
          .appointment-details {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
            border-radius: 5px;
          }
          .detail-row {
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
          }
          .label {
            font-weight: bold;
            color: #667eea;
          }
          .value {
            color: #333;
          }
          .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 10px 10px;
            font-size: 12px;
            color: #666;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 Cita de Teleenfermería Agendada</h1>
        </div>

        <div class="content">
          <p>Hola,</p>

          <p>Se ha agendado una nueva cita de teleenfermería en Smart Campus Instituto.</p>

          <div class="appointment-details">
            <h3>📋 Detalles de la Cita:</h3>

            <div class="detail-row">
              <span class="label">📅 Fecha:</span>
              <span class="value">${formattedDate}</span>
            </div>

            <div class="detail-row">
              <span class="label">🕐 Hora:</span>
              <span class="value">${formattedTime}</span>
            </div>

            <div class="detail-row">
              <span class="label">⏱️ Duración:</span>
              <span class="value">${duration} minutos</span>
            </div>

            ${
              teacherName
                ? `
            <div class="detail-row">
              <span class="label">👨‍⚕️ Docente:</span>
              <span class="value">${teacherName}</span>
            </div>
            `
                : ''
            }

            ${
              studentName
                ? `
            <div class="detail-row">
              <span class="label">👨‍🎓 Estudiante:</span>
              <span class="value">${studentName}</span>
            </div>
            `
                : ''
            }
          </div>

          <p><strong>Importante:</strong></p>
          <ul>
            <li>Asegúrate de tener una buena conexión a internet</li>
            <li>Prepara tu cámara y micrófono</li>
            <li>Ingresa con 5 minutos de anticipación</li>
            <li>Si necesitas cancelar, hazlo con al menos 2 horas de anticipación</li>
          </ul>

          <center>
            <a href="http://localhost:3000/telehealth/appointments" class="button">
              Ver Mis Citas
            </a>
          </center>
        </div>

        <div class="footer">
          <p>Este es un mensaje automático del sistema Smart Campus Instituto</p>
          <p>Instituto Superior Técnico de Enfermería "María Parado de Bellido"</p>
          <p>Jr. 9 de diciembre N° 471-485, Ayacucho, Perú</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Cita de Teleenfermería Agendada - Smart Campus Instituto

Detalles de la Cita:
- Fecha: ${formattedDate}
- Hora: ${formattedTime}
- Duración: ${duration} minutos
${teacherName ? `- Docente: ${teacherName}` : ''}
${studentName ? `- Estudiante: ${studentName}` : ''}

Importante:
- Asegúrate de tener una buena conexión a internet
- Prepara tu cámara y micrófono
- Ingresa con 5 minutos de anticipación
- Si necesitas cancelar, hazlo con al menos 2 horas de anticipación

Este es un mensaje automático del sistema Smart Campus Instituto.
    `.trim();

    return this.sendEmail(email, subject, html, text);
  }

  /**
   * Enviar SMS (placeholder - implementar con Twilio/AWS SNS)
   */
  async sendSMS(phone, message) {
    // Placeholder - implementar con servicio real en producción
    console.log('📱 SMS (Not implemented):');
    console.log('   To:', phone);
    console.log('   Message:', message);

    return true;
  }
}

module.exports = NotificationService;
