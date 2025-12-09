/**
 * Recover Password Use Case
 * Responsabilidad: Iniciar proceso de recuperación de contraseña
 *
 * Flujo:
 * 1. Validar email
 * 2. Buscar usuario
 * 3. Generar token de recuperación
 * 4. Almacenar token en Redis (1 hora de validez)
 * 5. Publicar evento PASSWORD_RESET_REQUESTED
 * 6. Retornar confirmación (sin exponer si el email existe)
 */

class RecoverPasswordUseCase {
  /**
   * @param {Object} dependencies
   * @param {IUserRepository} dependencies.userRepository
   * @param {IAuthService} dependencies.authService
   * @param {INotificationService} dependencies.notificationService
   * @param {EventBus} dependencies.eventBus
   */
  constructor(dependencies) {
    this.userRepository = dependencies.userRepository;
    this.authService = dependencies.authService;
    this.notificationService = dependencies.notificationService;
    this.eventBus = dependencies.eventBus;
  }

  /**
   * Ejecuta el caso de uso de recuperación de contraseña
   * @param {Object} data - Email del usuario
   * @returns {Promise<Object>} Confirmación del proceso
   */
  async execute(data) {
    try {
      // 1. Validar entrada
      this._validateInput(data);

      // 2. Buscar usuario por email
      const user = await this.userRepository.findByEmail(data.email);

      // IMPORTANTE: Por seguridad, siempre retornar el mismo mensaje
      // sin revelar si el email existe o no
      const response = {
        message:
          'Si el email está registrado, recibirás instrucciones para recuperar tu contraseña.',
        success: true,
      };

      // 3. Si el usuario NO existe, retornar mensaje genérico
      if (!user) {
        console.log(`Intento de recuperación con email no registrado: ${data.email}`);
        return response;
      }

      // 4. Si el usuario NO está activo, no permitir recuperación
      if (!user.isActive) {
        console.log(`Intento de recuperación con usuario inactivo: ${data.email}`);
        return response;
      }

      // 5. Generar token de recuperación (válido 1 hora)
      const resetToken = await this.authService.generatePasswordResetToken(user.id);

      // 6. Publicar evento PASSWORD_RESET_REQUESTED
      this.eventBus.publish('PASSWORD_RESET_REQUESTED', {
        userId: user.id,
        email: user.email.getValue(),
        resetToken,
        timestamp: new Date(),
      });

      // 7. Enviar email (lo hace un subscriber del evento)
      // El subscriber escuchará PASSWORD_RESET_REQUESTED y enviará el email
      // await this.notificationService.sendPasswordResetEmail(user.email.getValue(), resetToken);

      // 8. Retornar confirmación
      console.log(`Token de recuperación generado para: ${user.email.getValue()}`);
      return response;
    } catch (error) {
      console.error('Error en RecoverPasswordUseCase:', error.message);
      throw error;
    }
  }

  /**
   * Valida los datos de entrada
   * @private
   */
  _validateInput(data) {
    if (!data.email) {
      throw new Error('Email es requerido');
    }

    if (!data.email.includes('@')) {
      throw new Error('Email inválido');
    }
  }
}

module.exports = RecoverPasswordUseCase;
