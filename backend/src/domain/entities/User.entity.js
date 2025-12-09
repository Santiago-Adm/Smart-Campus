/**
 * Entity: User
 * Representa un usuario del sistema (estudiante, docente, admin, etc.)
 */

const { UserRole } = require('../enums/UserRole.enum');
const Email = require('../value-objects/Email.vo');
const PhoneNumber = require('../value-objects/PhoneNumber.vo');
const Address = require('../value-objects/Address.vo');

class User {
  constructor({
    id = null,
    email,
    password,
    firstName,
    lastName,
    dni,
    phone = null,
    dateOfBirth = null,
    address = null,
    roles = [],
    isActive = true,
    isEmailVerified = false,
    profilePicture = null,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.email = email instanceof Email ? email : new Email(email);
    this.password = password; // Hash, no plain text
    this.firstName = this.validateName(firstName, 'First name');
    this.lastName = this.validateName(lastName, 'Last name');
    this.dni = this.validateDNI(dni);
    // eslint-disable-next-line no-nested-ternary
    this.phone = phone ? (phone instanceof PhoneNumber ? phone : new PhoneNumber(phone)) : null;
    this.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    this.address = address instanceof Address ? address : null;
    this.roles = this.validateRoles(roles);
    this.isActive = Boolean(isActive);
    this.isEmailVerified = Boolean(isEmailVerified);
    this.profilePicture = profilePicture;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  }

  // ============================================
  // VALIDACIONES
  // ============================================

  validateName(name, fieldName) {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw new Error(`${fieldName} must be at least 2 characters long`);
    }
    return name.trim();
  }

  validateDNI(dni) {
    if (!dni || typeof dni !== 'string') {
      throw new Error('DNI must be a non-empty string');
    }

    const cleaned = dni.trim();
    // DNI peruano: 8 dígitos
    if (!/^\d{8}$/.test(cleaned)) {
      throw new Error('DNI must be 8 digits');
    }

    return cleaned;
  }

  validateRoles(roles) {
    if (!Array.isArray(roles) || roles.length === 0) {
      throw new Error('User must have at least one role');
    }

    const invalidRoles = roles.filter((role) => !Object.values(UserRole).includes(role));
    if (invalidRoles.length > 0) {
      throw new Error(`Invalid roles: ${invalidRoles.join(', ')}`);
    }

    return [...new Set(roles)]; // Eliminar duplicados
  }

  // ============================================
  // MÉTODOS DE NEGOCIO
  // ============================================

  /**
   * Obtener nombre completo
   */
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role) {
    return this.roles.includes(role);
  }

  /**
   * Verificar si el usuario es estudiante
   */
  isStudent() {
    return this.hasRole(UserRole.STUDENT);
  }

  /**
   * Verificar si el usuario es docente
   */
  isTeacher() {
    return this.hasRole(UserRole.TEACHER);
  }

  /**
   * Verificar si el usuario es admin
   */
  isAdmin() {
    return this.hasRole(UserRole.IT_ADMIN) || this.hasRole(UserRole.DIRECTOR);
  }

  /**
   * Agregar un rol
   */
  addRole(role) {
    if (!Object.values(UserRole).includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    if (!this.roles.includes(role)) {
      this.roles.push(role);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remover un rol
   */
  removeRole(role) {
    const index = this.roles.indexOf(role);
    if (index > -1) {
      this.roles.splice(index, 1);
      this.updatedAt = new Date();
    }

    if (this.roles.length === 0) {
      throw new Error('User must have at least one role');
    }
  }

  /**
   * Activar usuario
   */
  activate() {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Desactivar usuario
   */
  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Verificar email
   */
  verifyEmail() {
    this.isEmailVerified = true;
    this.updatedAt = new Date();
  }

  /**
   * Actualizar contraseña
   */
  updatePassword(newPasswordHash) {
    if (!newPasswordHash || typeof newPasswordHash !== 'string') {
      throw new Error('Invalid password hash');
    }
    this.password = newPasswordHash;
    this.updatedAt = new Date();
  }

  /**
   * Actualizar perfil
   */
  updateProfile({ firstName, lastName, phone, dateOfBirth, address, profilePicture }) {
    if (firstName) this.firstName = this.validateName(firstName, 'First name');
    if (lastName) this.lastName = this.validateName(lastName, 'Last name');
    if (phone) this.phone = phone instanceof PhoneNumber ? phone : new PhoneNumber(phone);
    if (dateOfBirth) this.dateOfBirth = new Date(dateOfBirth);
    if (address) this.address = address instanceof Address ? address : address;
    if (profilePicture !== undefined) this.profilePicture = profilePicture;

    this.updatedAt = new Date();
  }

  /**
   * Calcular edad
   */
  getAge() {
    if (!this.dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      // eslint-disable-next-line no-plusplus
      age--;
    }

    return age;
  }

  /**
   * Validar entidad (método explícito para Use Cases)
   * Las validaciones ya se ejecutan en el constructor
   */
  validate() {
    // Validaciones ya ejecutadas en constructor
    // Este método existe para compatibilidad con Use Cases
    if (!this.email || !this.password || !this.firstName || !this.lastName || !this.dni) {
      throw new Error('User entity is invalid - missing required fields');
    }
    return true;
  }

  /**
   * Convertir a objeto plano (para serialización)
   */
  toObject() {
    return {
      id: this.id,
      email: this.email.getValue(),
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName(),
      dni: this.dni,
      phone: this.phone ? this.phone.getValue() : null,
      dateOfBirth: this.dateOfBirth,
      age: this.getAge(),
      address: this.address ? this.address.toObject() : null,
      roles: this.roles,
      isActive: this.isActive,
      isEmailVerified: this.isEmailVerified,
      profilePicture: this.profilePicture,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = User;
