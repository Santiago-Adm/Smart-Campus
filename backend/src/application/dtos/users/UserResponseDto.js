/**
 * UserResponse DTO
 * Define la estructura de respuesta de un usuario
 */

class UserResponseDto {
  constructor(user) {
    this.id = user.id;
    this.email = user.email.getValue ? user.email.getValue() : user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.fullName = user.getFullName();
    this.dni = user.dni;
    // eslint-disable-next-line no-nested-ternary
    this.phone = user.phone ? (user.phone.getValue ? user.phone.getValue() : user.phone) : null;
    this.roles = user.roles;
    this.isActive = user.isActive;
    this.profilePicture = user.profilePicture;
    // NO incluir password ni datos sensibles
  }

  /**
   * Crear DTO desde entidad
   */
  static fromEntity(user) {
    return new UserResponseDto(user);
  }

  /**
   * Crear array de DTOs desde array de entidades
   */
  static fromEntityArray(users) {
    return users.map((user) => new UserResponseDto(user));
  }

  /**
   * Versión simplificada (para listados)
   */
  toSimplified() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      roles: this.roles,
      isActive: this.isActive,
    };
  }
}

module.exports = UserResponseDto;
