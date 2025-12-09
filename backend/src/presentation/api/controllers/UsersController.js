/**
 * UsersController
 * Maneja todas las operaciones relacionadas con usuarios
 */

const UserResponseDto = require('../../../application/dtos/users/UserResponseDto');

class UsersController {
  constructor({ getUsersUseCase }) {
    this.getUsersUseCase = getUsersUseCase;
  }

  /**
   * GET /api/users
   * Obtiene lista de usuarios con filtros
   *
   * Permisos:
   * - STUDENT: Solo puede ver TEACHERS
   * - TEACHER: Puede ver STUDENTS y TEACHERS
   * - ADMINISTRATIVE, IT_ADMIN, DIRECTOR: Pueden ver todos
   */
  // eslint-disable-next-line consistent-return
  async getUsers(req, res, next) {
    try {
      // Extraer query params
      const { role, search, isActive, page = 1, limit = 50 } = req.query;

      // ✅ NUEVO: Usuario autenticado (viene del authMiddleware)
      const requestingUser = req.user;

      console.log('📋 Getting users with filters:', {
        role,
        search,
        isActive,
        requestingUserRole: requestingUser.roles,
      });

      // ✅ NUEVO: Validación de permisos según rol
      let allowedRole = role;

      // Si es STUDENT, solo puede ver TEACHERS
      if (
        requestingUser.roles.includes('STUDENT') &&
        !requestingUser.roles.includes('ADMINISTRATIVE')
      ) {
        if (!role || role !== 'TEACHER') {
          console.warn('⚠️ Student attempted to access non-TEACHER users');
          return res.status(403).json({
            success: false,
            message: 'Los estudiantes solo pueden consultar la lista de docentes',
          });
        }
        allowedRole = 'TEACHER';
      }

      // Si es TEACHER (y no admin), puede ver STUDENTS y TEACHERS
      if (
        requestingUser.roles.includes('TEACHER') &&
        !requestingUser.roles.some((r) => ['ADMINISTRATIVE', 'IT_ADMIN', 'DIRECTOR'].includes(r))
      ) {
        if (role && !['STUDENT', 'TEACHER'].includes(role)) {
          console.warn('⚠️ Teacher attempted to access restricted users');
          return res.status(403).json({
            success: false,
            message: 'Los docentes solo pueden consultar estudiantes y otros docentes',
          });
        }
      }

      // ✅ Ejecutar use case con el rol validado
      const result = await this.getUsersUseCase.execute({
        role: allowedRole,
        search,
        isActive: isActive !== undefined ? isActive === 'true' : true,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      // Convertir a DTOs
      const usersDto = UserResponseDto.fromEntityArray(result.users);

      console.log(`✅ Returning ${usersDto.length} users`);

      return res.status(200).json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: usersDto.map((dto) => dto.toSimplified()),
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('❌ Error in getUsers:', error);
      next(error);
    }
  }
}

module.exports = UsersController;
