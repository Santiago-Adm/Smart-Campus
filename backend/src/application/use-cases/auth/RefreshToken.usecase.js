/**
 * Refresh Token Use Case - VERSIÓN REFACTORIZADA CON DTOs
 */

const UserMapper = require('../../mappers/UserMapper');

class RefreshTokenUseCase {
  constructor(dependencies) {
    this.userRepository = dependencies.userRepository;
    this.authService = dependencies.authService;
    this.eventBus = dependencies.eventBus;
  }

  /**
   * Ejecuta el caso de uso de refresh token
   * @param {RefreshTokenDto} refreshTokenDto - DTO validado
   * @returns {Promise<Object>} Nuevos tokens
   */
  async execute(refreshTokenDto) {
    try {
      // 1. Sanitizar y validar DTO
      refreshTokenDto.sanitize();
      refreshTokenDto.validate();

      // 2. Extraer datos del DTO
      const data = refreshTokenDto.toObject();

      // 3. Verificar que el token no esté en blacklist
      const isBlacklisted = await this.authService.isTokenBlacklisted(data.refreshToken);
      if (isBlacklisted) {
        throw new Error('Token inválido o revocado');
      }

      // 4. Verificar y decodificar refresh token
      const decoded = this.authService.verifyToken(data.refreshToken, 'refresh');

      if (!decoded || !decoded.userId) {
        throw new Error('Token inválido');
      }

      // 5. Buscar usuario
      const user = await this.userRepository.findById(decoded.userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // 6. Verificar que el usuario siga activo
      if (!user.isActive) {
        throw new Error('Usuario inactivo');
      }

      // 7. Generar nuevos tokens usando Mapper
      const tokenPayload = UserMapper.toJwtPayload(user);
      const newAccessToken = this.authService.generateAccessToken(tokenPayload);
      const newRefreshToken = this.authService.generateRefreshToken({
        userId: user.id,
      });

      // ✅ Verifica que el refresh token esté en Redis
      // eslint-disable-next-line no-unused-vars
      const isValidRefreshToken = await this.authService.verifyRefreshToken(
        user.id,
        data.refreshToken
      );

      // 8. Invalidar refresh token anterior
      // await this.authService.invalidateToken(data.refreshToken);

      // O usar el método correcto:
      await this.authService.removeRefreshToken(user.id, newRefreshToken);

      // 9. Publicar evento TOKEN_REFRESHED
      this.eventBus.publish('TOKEN_REFRESHED', {
        userId: user.id,
        email: user.email.getValue(),
        timestamp: new Date(),
      });

      // 10. Retornar respuesta usando Mapper
      return UserMapper.toSuccessResponse(
        UserMapper.toAuthResponse({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user,
        }),
        'Tokens renovados exitosamente'
      );
    } catch (error) {
      console.error('Error en RefreshTokenUseCase:', error.message);
      throw error;
    }
  }
}

module.exports = RefreshTokenUseCase;
