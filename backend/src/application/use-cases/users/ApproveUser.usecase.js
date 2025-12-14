/**
 * ApproveUserUseCase
 * Aprueba un usuario pendiente (isActive = false → true)
 */

const { UnauthorizedException } = require('../../../shared/exceptions/UnauthorizedException');
const { NotFoundException } = require('../../../shared/exceptions/NotFoundException');

class ApproveUserUseCase {
  constructor({ userRepository, notificationService }) {
    this.userRepository = userRepository;
    this.notificationService = notificationService;
  }

  async execute(userId, approvedBy) {
    try {
      console.log(`📋 Approving user ${userId} by ${approvedBy.email}...`);

      // Verificar permisos
      const hasPermission = approvedBy.roles.some((role) =>
        ['IT_ADMIN', 'ADMINISTRATIVE'].includes(role)
      );

      if (!hasPermission) {
        throw new UnauthorizedException('No tienes permisos para aprobar usuarios');
      }

      // Buscar usuario
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Verificar que esté pendiente
      if (user.isActive) {
        console.warn('⚠️ User is already active');
        return {
          success: true,
          message: 'El usuario ya está aprobado',
          user,
        };
      }

      // ✅ Activar usuario
      const updatedUser = await this.userRepository.update(userId, {
        isActive: true,
      });

      console.log(`✅ User ${userId} approved successfully`);

      // Enviar email
      try {
        await this.notificationService.sendWelcomeEmail(user.email.getValue(), user.getFullName());
        console.log('✅ Welcome email sent');
      } catch (emailError) {
        console.error('⚠️ Failed to send welcome email:', emailError.message);
      }

      return {
        success: true,
        message: 'Usuario aprobado exitosamente',
        user: updatedUser,
      };
    } catch (error) {
      console.error('❌ Error in ApproveUserUseCase:', error);
      throw error;
    }
  }
}

module.exports = ApproveUserUseCase;
