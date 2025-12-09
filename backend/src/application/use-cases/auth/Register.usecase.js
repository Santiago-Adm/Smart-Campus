/**
 * Register Use Case - VERSIÓN REFACTORIZADA CON DTOs
 */

const User = require('../../../domain/entities/User.entity');
const { UserRole } = require('../../../domain/enums/UserRole.enum');
const UserMapper = require('../../mappers/UserMapper');

class RegisterUseCase {
  constructor(dependencies) {
    this.userRepository = dependencies.userRepository;
    this.authService = dependencies.authService;
    this.eventBus = dependencies.eventBus;
  }

  /**
   * Ejecuta el caso de uso de registro
   * @param {RegisterDto} registerDto - DTO validado
   * @returns {Promise<Object>} Usuario creado
   */
  async execute(registerDto) {
    try {
      // 1. Sanitizar y validar DTO
      registerDto.sanitize();
      registerDto.validate();

      // 2. Extraer datos del DTO
      const data = registerDto.toObject();

      // 3. Verificar que el email no exista
      const emailExists = await this.userRepository.existsByEmail(data.email);
      if (emailExists) {
        throw new Error('El email ya está registrado en el sistema');
      }

      // 4. Verificar que el DNI no exista
      const dniExists = await this.userRepository.existsByDNI(data.dni);
      if (dniExists) {
        throw new Error('El DNI ya está registrado en el sistema');
      }

      // 5. Hash de la contraseña
      const hashedPassword = await this.authService.hashPassword(data.password);

      // 6. Crear entidad User usando Mapper
      const user = UserMapper.fromRegisterDto(data, hashedPassword);

      // 7. Validar entidad
      user.validate();

      // 8. Guardar en repository
      const createdUser = await this.userRepository.create(user);

      // 9. Publicar evento USER_CREATED
      this.eventBus.publish('USER_CREATED', {
        userId: createdUser.id,
        email: createdUser.email.getValue(),
        fullName: createdUser.getFullName(),
        roles: createdUser.roles,
        timestamp: new Date(),
      });

      // 10. Retornar respuesta usando Mapper
      return UserMapper.toSuccessResponse(
        UserMapper.toDetailedResponse(createdUser),
        'Usuario registrado exitosamente. Pendiente de activación por administrador.'
      );
    } catch (error) {
      console.error('Error en RegisterUseCase:', error.message);
      throw error;
    }
  }
}

module.exports = RegisterUseCase;
