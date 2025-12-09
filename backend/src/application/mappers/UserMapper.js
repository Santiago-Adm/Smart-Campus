/**
 * User Mapper
 * Responsabilidad: Convertir entre diferentes representaciones de User
 *
 * Conversiones soportadas:
 * - Entity → DTO (para respuestas)
 * - DTO → Entity (para creación)
 * - Entity → Response (para API HTTP)
 * - Model → Entity (desde base de datos)
 */

const User = require('../../domain/entities/User.entity');

class UserMapper {
  /**
   * Convierte una Entity User a DTO de respuesta
   * @param {User} user - Entity de dominio
   * @returns {Object} DTO para respuesta
   */
  static toDto(user) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email.getValue(),
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      dni: user.dni,
      phone: user.phone ? user.phone.getValue() : null,
      dateOfBirth: user.dateOfBirth,
      roles: user.roles,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Convierte una Entity User a respuesta HTTP pública
   * (Sin información sensible)
   * @param {User} user - Entity de dominio
   * @returns {Object} Datos públicos del usuario
   */
  static toPublicResponse(user) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email.getValue(),
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      roles: user.roles,
      isActive: user.isActive,
    };
  }

  /**
   * Convierte una Entity User a respuesta detallada
   * (Para el propio usuario o administradores)
   * @param {User} user - Entity de dominio
   * @returns {Object} Datos completos del usuario
   */
  static toDetailedResponse(user) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email.getValue(),
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      dni: user.dni,
      phone: user.phone ? user.phone.getValue() : null,
      dateOfBirth: user.dateOfBirth,
      age: user.getAge(),
      roles: user.roles,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Métodos de utilidad
      isStudent: user.isStudent(),
      isTeacher: user.isTeacher(),
      isAdmin: user.isAdmin(),
    };
  }

  /**
   * Convierte un array de Users a array de DTOs
   * @param {User[]} users - Array de entities
   * @returns {Object[]} Array de DTOs
   */
  static toListDto(users) {
    if (!users || !Array.isArray(users)) {
      return [];
    }

    return users.map((user) => this.toDto(user));
  }

  /**
   * Convierte un array de Users a respuestas públicas
   * @param {User[]} users - Array de entities
   * @returns {Object[]} Array de respuestas públicas
   */
  static toPublicListResponse(users) {
    if (!users || !Array.isArray(users)) {
      return [];
    }

    return users.map((user) => this.toPublicResponse(user));
  }

  /**
   * Convierte datos de registro a Entity User
   * @param {Object} registerData - Datos del RegisterDto
   * @param {string} hashedPassword - Password ya hasheada
   * @returns {User} Entity de dominio
   */
  static fromRegisterDto(registerData, hashedPassword) {
    return new User({
      email: registerData.email,
      password: hashedPassword,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      dni: registerData.dni,
      phone: registerData.phone || null,
      dateOfBirth: registerData.dateOfBirth || null,
      roles: registerData.roles || ['STUDENT'],
      isActive: registerData.isActive !== undefined ? registerData.isActive : false,
    });
  }

  /**
   * Convierte resultado de paginación a respuesta HTTP
   * @param {Object} paginationResult - Resultado con { items, total, page, limit }
   * @returns {Object} Respuesta paginada
   */
  static toPaginatedResponse(paginationResult) {
    return {
      data: this.toListDto(paginationResult.items),
      pagination: {
        total: paginationResult.total,
        page: paginationResult.page,
        limit: paginationResult.limit,
        totalPages: Math.ceil(paginationResult.total / paginationResult.limit),
        hasMore: paginationResult.page * paginationResult.limit < paginationResult.total,
      },
    };
  }

  /**
   * Extrae datos esenciales para JWT payload
   * @param {User} user - Entity de dominio
   * @returns {Object} Payload para JWT
   */
  static toJwtPayload(user) {
    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email.getValue(),
      roles: user.roles,
      isActive: user.isActive,
    };
  }

  /**
   * Convierte respuesta de login/refresh a formato estandarizado
   * @param {Object} authResult - Resultado con tokens y usuario
   * @returns {Object} Respuesta de autenticación
   */
  static toAuthResponse(authResult) {
    return {
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutos
      user: this.toPublicResponse(authResult.user),
    };
  }

  /**
   * Convierte Entity a formato para actualización
   * @param {User} user - Entity de dominio
   * @param {Object} updateData - Datos a actualizar
   * @returns {User} Entity actualizada
   */
  static toUpdatedEntity(user, updateData) {
    // Solo actualiza campos permitidos
    if (updateData.firstName !== undefined) {
      // eslint-disable-next-line no-param-reassign
      user.firstName = updateData.firstName;
    }

    if (updateData.lastName !== undefined) {
      // eslint-disable-next-line no-param-reassign
      user.lastName = updateData.lastName;
    }

    if (updateData.phone !== undefined) {
      // eslint-disable-next-line no-param-reassign
      user.phone = updateData.phone;
    }

    if (updateData.dateOfBirth !== undefined) {
      // eslint-disable-next-line no-param-reassign
      user.dateOfBirth = updateData.dateOfBirth;
    }

    // Campos sensibles solo por admin
    if (updateData.roles !== undefined && updateData.isAdmin) {
      // eslint-disable-next-line no-param-reassign
      user.roles = updateData.roles;
    }

    if (updateData.isActive !== undefined && updateData.isAdmin) {
      // eslint-disable-next-line no-param-reassign
      user.isActive = updateData.isActive;
    }

    return user;
  }

  /**
   * Crea respuesta de error estandarizada
   * @param {string} message - Mensaje de error
   * @param {Object} details - Detalles adicionales
   * @returns {Object} Respuesta de error
   */
  static toErrorResponse(message, details = null) {
    return {
      success: false,
      error: {
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Crea respuesta de éxito estandarizada
   * @param {any} data - Datos de respuesta
   * @param {string} message - Mensaje opcional
   * @returns {Object} Respuesta de éxito
   */
  static toSuccessResponse(data, message = null) {
    const response = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    if (message) {
      response.message = message;
    }

    return response;
  }

  /**
   * Convierte búsqueda con filtros a respuesta HTTP
   * @param {User[]} users - Array de usuarios encontrados
   * @param {Object} filters - Filtros aplicados
   * @param {Object} pagination - Info de paginación
   * @returns {Object} Respuesta de búsqueda
   */
  static toSearchResponse(users, filters, pagination) {
    return {
      data: this.toListDto(users),
      filters,
      pagination: {
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Valida que un objeto tenga estructura de User Entity
   * @param {any} obj - Objeto a validar
   * @returns {boolean}
   */
  static isValidUserEntity(obj) {
    return (
      obj &&
      obj.id &&
      obj.email &&
      obj.firstName &&
      obj.lastName &&
      obj.roles &&
      Array.isArray(obj.roles)
    );
  }

  /**
   * Sanitiza datos de usuario para logs (sin info sensible)
   * @param {User} user - Entity de dominio
   * @returns {Object} Datos seguros para logging
   */
  static toLogSafe(user) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email.getValue().replace(/(.{3})(.*)(@.*)/, '$1***$3'), // Ofuscar email
      fullName: user.getFullName(),
      roles: user.roles,
      isActive: user.isActive,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = UserMapper;
