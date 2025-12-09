/**
 * Auth Controller
 * Responsabilidad: Manejar requests HTTP y delegar a Use Cases
 *
 * Endpoints:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - POST /api/auth/recover-password
 * - POST /api/auth/reset-password
 * - POST /api/auth/refresh-token
 * - GET  /api/auth/me (protegido)
 * - POST /api/auth/logout
 */

const RegisterDto = require('../../../application/dtos/auth/RegisterDto');
const LoginDto = require('../../../application/dtos/auth/LoginDto');
const RecoverPasswordDto = require('../../../application/dtos/auth/RecoverPasswordDto');
const ResetPasswordDto = require('../../../application/dtos/auth/ResetPasswordDto');
const RefreshTokenDto = require('../../../application/dtos/auth/RefreshTokenDto');
const UserMapper = require('../../../application/mappers/UserMapper');

class AuthController {
  /**
   * @param {Object} dependencies
   * @param {RegisterUseCase} dependencies.registerUseCase
   * @param {LoginUseCase} dependencies.loginUseCase
   * @param {RecoverPasswordUseCase} dependencies.recoverPasswordUseCase
   * @param {ResetPasswordUseCase} dependencies.resetPasswordUseCase
   * @param {RefreshTokenUseCase} dependencies.refreshTokenUseCase
   * @param {IUserRepository} dependencies.userRepository
   */
  constructor(dependencies) {
    this.registerUseCase = dependencies.registerUseCase;
    this.loginUseCase = dependencies.loginUseCase;
    this.recoverPasswordUseCase = dependencies.recoverPasswordUseCase;
    this.resetPasswordUseCase = dependencies.resetPasswordUseCase;
    this.refreshTokenUseCase = dependencies.refreshTokenUseCase;
    this.userRepository = dependencies.userRepository;
  }

  /**
   * POST /api/auth/register
   * Registra un nuevo usuario
   */
  // eslint-disable-next-line consistent-return
  async register(req, res, next) {
    try {
      // 1. Crear DTO desde request
      const registerDto = RegisterDto.fromRequest(req);

      // 2. Ejecutar Use Case
      const result = await this.registerUseCase.execute(registerDto);

      // 3. Retornar respuesta
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Inicia sesión y retorna tokens
   */
  // eslint-disable-next-line consistent-return
  async login(req, res, next) {
    try {
      // 1. Crear DTO desde request
      const loginDto = LoginDto.fromRequest(req);

      // 2. Ejecutar Use Case
      const result = await this.loginUseCase.execute(loginDto);

      // 3. Retornar respuesta
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/recover-password
   * Solicita recuperación de contraseña
   */
  // eslint-disable-next-line consistent-return
  async recoverPassword(req, res, next) {
    try {
      // 1. Crear DTO desde request
      const recoverDto = RecoverPasswordDto.fromRequest(req);

      // 2. Ejecutar Use Case
      const result = await this.recoverPasswordUseCase.execute(recoverDto);

      // 3. Retornar respuesta
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password
   * Resetea la contraseña con token
   */
  // eslint-disable-next-line consistent-return
  async resetPassword(req, res, next) {
    try {
      // 1. Crear DTO desde request
      const resetDto = ResetPasswordDto.fromRequest(req);

      // 2. Ejecutar Use Case
      const result = await this.resetPasswordUseCase.execute(resetDto);

      // 3. Retornar respuesta
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh-token
   * Renueva los tokens de acceso
   */
  // eslint-disable-next-line consistent-return
  async refreshToken(req, res, next) {
    try {
      // 1. Crear DTO desde request
      const refreshDto = RefreshTokenDto.fromRequest(req);

      // 2. Ejecutar Use Case
      const result = await this.refreshTokenUseCase.execute(refreshDto);

      // 3. Retornar respuesta
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Obtiene datos del usuario actual (requiere autenticación)
   */
  // eslint-disable-next-line consistent-return
  async getCurrentUser(req, res, next) {
    try {
      // 1. Obtener userId del token (viene del middleware de auth)
      const { userId } = req.user;

      // 2. Buscar usuario
      const user = await this.userRepository.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Usuario no encontrado',
          },
        });
      }

      // 3. Retornar usuario usando Mapper
      return res
        .status(200)
        .json(
          UserMapper.toSuccessResponse(
            UserMapper.toDetailedResponse(user),
            'Usuario obtenido exitosamente'
          )
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Cierra sesión invalidando el token
   */
  // eslint-disable-next-line consistent-return
  async logout(req, res, next) {
    try {
      // 1. Obtener token del header
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Token no proporcionado',
          },
        });
      }

      // 2. Invalidar token (agregarlo a blacklist en Redis)
      // Esto se puede implementar en AuthService si aún no existe
      // await this.authService.invalidateToken(token);

      // 3. Retornar confirmación
      return res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
