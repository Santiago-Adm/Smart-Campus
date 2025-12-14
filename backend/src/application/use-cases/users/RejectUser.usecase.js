/**
 * RejectUserUseCase
 * Rechaza un usuario pendiente y lo elimina del sistema
 */

const { UnauthorizedException } = require('../../../shared/exceptions/UnauthorizedException');
const { NotFoundException } = require('../../../shared/exceptions/NotFoundException');
const { ValidationException } = require('../../../shared/exceptions/ValidationException');

class RejectUserUseCase {
  constructor({ userRepository, notificationService }) {
    this.userRepository = userRepository;
    this.notificationService = notificationService;
  }

  async execute(userId, reason, rejectedBy) {
    try {
      console.log(`📋 Rejecting user ${userId} by ${rejectedBy.email}...`);

      // Verificar permisos
      const hasPermission = rejectedBy.roles.some((role) =>
        ['IT_ADMIN', 'ADMINISTRATIVE'].includes(role)
      );

      if (!hasPermission) {
        throw new UnauthorizedException('No tienes permisos para rechazar usuarios');
      }

      // Validar razón
      if (!reason || reason.trim().length < 10) {
        throw new ValidationException('Debes proporcionar una razón con al menos 10 caracteres');
      }

      // Buscar usuario
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Verificar que esté pendiente
      if (user.isActive) {
        throw new ValidationException('No se puede rechazar un usuario ya aprobado');
      }

      console.log(`✅ User ${userId} rejected: ${reason}`);

      // Enviar email
      try {
        await this.notificationService.sendUserRejectionEmail(
          user.email.getValue(),
          user.getFullName(),
          reason
        );
        console.log('✅ Rejection email sent');
      } catch (emailError) {
        console.error('⚠️ Failed to send rejection email:', emailError.message);
      }

      // Eliminar usuario
      await this.userRepository.delete(userId);

      console.log(`✅ User ${userId} deleted from database`);

      return {
        success: true,
        message: 'Usuario rechazado y eliminado exitosamente',
      };
    } catch (error) {
      console.error('❌ Error in RejectUserUseCase:', error);
      throw error;
    }
  }
}

module.exports = RejectUserUseCase;
