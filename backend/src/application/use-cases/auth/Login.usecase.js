/**
 * Login Use Case - VERSIÓN REFACTORIZADA CON DTOs
 */

const UserMapper = require('../../mappers/UserMapper');

class LoginUseCase {
  constructor(dependencies) {
    this.userRepository = dependencies.userRepository;
    this.authService = dependencies.authService;
    this.eventBus = dependencies.eventBus;
  }

  /**
   * Ejecuta el caso de uso de login
   * @param {LoginDto} loginDto - DTO validado
   * @returns {Promise<Object>} Tokens y datos de usuario
   */
  async execute(loginDto) {
    try {
      // 1. Sanitizar y validar DTO
      loginDto.sanitize();
      loginDto.validate();

      // 2. Extraer datos del DTO
      const data = loginDto.toObject();

      // 3. Buscar usuario por email
      const user = await this.userRepository.findByEmail(data.email);

      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      // 4. Verificar que el usuario esté activo
      if (!user.isActive) {
        throw new Error('Usuario inactivo. Contacte al administrador para activar su cuenta.');
      }

      // 5. Verificar contraseña
      const isPasswordValid = await this.authService.comparePassword(data.password, user.password);

      if (!isPasswordValid) {
        throw new Error('Credenciales inválidas');
      }

      // 6. Generar tokens usando Mapper para payload
      const tokenPayload = UserMapper.toJwtPayload(user);
      const accessToken = this.authService.generateAccessToken(tokenPayload);
      const refreshToken = this.authService.generateRefreshToken({
        userId: user.id,
      });

      // 7. Publicar evento USER_LOGGED_IN
      this.eventBus.publish('USER_LOGGED_IN', {
        userId: user.id,
        email: user.email.getValue(),
        timestamp: new Date(),
        roles: user.roles,
      });

      // 8. Retornar respuesta usando Mapper
      return UserMapper.toSuccessResponse(
        UserMapper.toAuthResponse({
          accessToken,
          refreshToken,
          user,
        }),
        'Login exitoso'
      );
    } catch (error) {
      console.error('Error en LoginUseCase:', error.message);
      throw error;
    }
  }
}

module.exports = LoginUseCase;
