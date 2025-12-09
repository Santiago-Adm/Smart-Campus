/**
 * Reset Password Use Case
 * Responsabilidad: Establecer nueva contraseña con token válido
 *
 * Flujo:
 * 1. Validar entrada (token y nueva contraseña)
 * 2. Verificar token de recuperación
 * 3. Buscar usuario
 * 4. Validar nueva contraseña
 * 5. Hash de nueva contraseña
 * 6. Actualizar contraseña
 * 7. Invalidar token usado
 * 8. Publicar evento PASSWORD_RESET_COMPLETED
 * 9. Retornar confirmación
 */

class ResetPasswordUseCase {
  /**
   * @param {Object} dependencies
   * @param {IUserRepository} dependencies.userRepository
   * @param {IAuthService} dependencies.authService
   * @param {EventBus} dependencies.eventBus
   */
  constructor(dependencies) {
    this.userRepository = dependencies.userRepository;
    this.authService = dependencies.authService;
    this.eventBus = dependencies.eventBus;
  }

  /**
   * Ejecuta el caso de uso de reseteo de contraseña
   * @param {Object} data - Token y nueva contraseña
   * @returns {Promise<Object>} Confirmación del proceso
   */
  async execute(data) {
    try {
      // 1. Validar entrada
      this._validateInput(data);

      // 2. Verificar token de recuperación (obtiene userId si es válido)
      const userId = await this.authService.verifyPasswordResetToken(data.token);

      if (!userId) {
        throw new Error('Token inválido o expirado');
      }

      // 3. Buscar usuario
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // 4. Validar que la nueva contraseña sea diferente a la anterior
      const isSamePassword = await this.authService.comparePassword(
        data.newPassword,
        user.password
      );

      if (isSamePassword) {
        throw new Error('La nueva contraseña debe ser diferente a la anterior');
      }

      // 5. Hash de la nueva contraseña
      const hashedPassword = await this.authService.hashPassword(data.newPassword);

      // 6. Actualizar contraseña del usuario
      user.password = hashedPassword;
      await this.userRepository.update(user.id, { password: hashedPassword });

      // 7. Invalidar el token usado (para que no se pueda reutilizar)
      await this.authService.invalidatePasswordResetToken(data.token);

      // 8. Publicar evento PASSWORD_RESET_COMPLETED
      this.eventBus.publish('PASSWORD_RESET_COMPLETED', {
        userId: user.id,
        email: user.email.getValue(),
        timestamp: new Date(),
      });

      // 9. Retornar confirmación
      return {
        message:
          'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
        success: true,
      };
    } catch (error) {
      console.error('Error en ResetPasswordUseCase:', error.message);
      throw error;
    }
  }

  /**
   * Valida los datos de entrada
   * @private
   */
  _validateInput(data) {
    if (!data.token) {
      throw new Error('Token es requerido');
    }

    if (!data.newPassword) {
      throw new Error('Nueva contraseña es requerida');
    }

    if (data.newPassword.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    // Validación de complejidad de contraseña
    const hasUpperCase = /[A-Z]/.test(data.newPassword);
    const hasLowerCase = /[a-z]/.test(data.newPassword);
    const hasNumber = /\d/.test(data.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      throw new Error(
        'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
      );
    }
  }
}

module.exports = ResetPasswordUseCase;
