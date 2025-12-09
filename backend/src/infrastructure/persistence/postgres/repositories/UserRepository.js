/**
 * UserRepository Implementation
 * Implementa IUserRepository usando Sequelize (PostgreSQL)
 */

const { Op } = require('sequelize');
const IUserRepository = require('../../../../domain/interfaces/repositories/IUserRepository');
const User = require('../../../../domain/entities/User.entity');
const Email = require('../../../../domain/value-objects/Email.vo');
const PhoneNumber = require('../../../../domain/value-objects/PhoneNumber.vo');
const Address = require('../../../../domain/value-objects/Address.vo');
const { models } = require('../config/sequelize.config');

class UserRepository extends IUserRepository {
  /**
   * Convertir modelo Sequelize a Entity User
   */
  _toEntity(userModel) {
    if (!userModel) return null;

    const roles = userModel.roles ? userModel.roles.map((r) => r.name) : [];

    const address =
      userModel.addressStreet && userModel.addressCity
        ? new Address({
            street: userModel.addressStreet,
            city: userModel.addressCity,
            state: userModel.addressState,
            country: userModel.addressCountry,
            zipCode: userModel.addressZipCode,
          })
        : null;

    return new User({
      id: userModel.id,
      email: new Email(userModel.email),
      password: userModel.password,
      firstName: userModel.firstName,
      lastName: userModel.lastName,
      dni: userModel.dni,
      phone: userModel.phone ? new PhoneNumber(userModel.phone) : null,
      dateOfBirth: userModel.dateOfBirth,
      address,
      roles,
      isActive: userModel.isActive,
      isEmailVerified: userModel.isEmailVerified,
      profilePicture: userModel.profilePicture,
      createdAt: userModel.createdAt,
      updatedAt: userModel.updatedAt,
    });
  }

  /**
   * Convertir Entity User a objeto plano para Sequelize
   */
  _toModel(user) {
    const data = {
      email: user.email.getValue(),
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      dni: user.dni,
      phone: user.phone ? user.phone.getValue() : null,
      dateOfBirth: user.dateOfBirth,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      profilePicture: user.profilePicture,
    };

    if (user.address) {
      data.addressStreet = user.address.street;
      data.addressCity = user.address.city;
      data.addressState = user.address.state;
      data.addressCountry = user.address.country;
      data.addressZipCode = user.address.zipCode;
    }

    return data;
  }

  /**
   * Crear un nuevo usuario (versión simplificada)
   */
  async create(user) {
    try {
      const userData = this._toModel(user);

      // Crear usuario sin roles primero
      const userModel = await models.User.create(userData);

      // Asignar roles después
      if (user.roles && user.roles.length > 0) {
        // Buscar los roles en la BD
        const roleModels = await models.Role.findAll({
          where: { name: { [Op.in]: user.roles } },
        });

        if (roleModels.length === 0) {
          console.warn('⚠️ Warning: No roles found in database');
        } else {
          // Crear las relaciones manualmente en la tabla intermedia
          const userRoles = roleModels.map((role) => ({
            userId: userModel.id,
            roleId: role.id,
          }));

          await models.UserRole.bulkCreate(userRoles);
        }
      }

      // Recargar con roles
      const createdUser = await models.User.findByPk(userModel.id, {
        include: [{ model: models.Role, as: 'roles' }],
      });

      return this._toEntity(createdUser);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  /**
   * Buscar usuario por ID
   */
  async findById(id) {
    try {
      const userModel = await models.User.findByPk(id, {
        include: [{ model: models.Role, as: 'roles' }],
      });

      return this._toEntity(userModel);
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email) {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      const userModel = await models.User.findOne({
        where: { email: normalizedEmail },
        include: [{ model: models.Role, as: 'roles' }],
      });

      return this._toEntity(userModel);
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  /**
   * Buscar usuario por DNI
   */
  async findByDNI(dni) {
    try {
      const userModel = await models.User.findOne({
        where: { dni },
        include: [{ model: models.Role, as: 'roles' }],
      });

      return this._toEntity(userModel);
    } catch (error) {
      throw new Error(`Error finding user by DNI: ${error.message}`);
    }
  }

  /**
   * Buscar múltiples usuarios con filtros
   */
  async findMany(filters = {}) {
    try {
      const { role, isActive, search, limit = 20, offset = 0 } = filters;

      const where = {};

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { dni: { [Op.like]: `%${search}%` } },
        ];
      }

      const include = [{ model: models.Role, as: 'roles' }];

      if (role) {
        include[0].where = { name: role };
      }

      const { rows, count } = await models.User.findAndCountAll({
        where,
        include,
        limit,
        offset,
        order: [['id', 'DESC']],
        distinct: true,
      });

      const users = rows.map((userModel) => this._toEntity(userModel));

      return { users, total: count };
    } catch (error) {
      throw new Error(`Error finding users: ${error.message}`);
    }
  }

  /**
   * Actualizar usuario
   */
  async update(id, updates) {
    try {
      const userModel = await models.User.findByPk(id);

      if (!userModel) {
        throw new Error('User not found');
      }

      // Actualizar campos básicos
      const allowedUpdates = [
        'firstName',
        'lastName',
        'phone',
        'dateOfBirth',
        'isActive',
        'isEmailVerified',
        'profilePicture',
        'password',
      ];

      Object.keys(updates).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          userModel[key] = updates[key];
        }
      });

      // Actualizar dirección si se proporciona
      if (updates.address) {
        userModel.addressStreet = updates.address.street;
        userModel.addressCity = updates.address.city;
        userModel.addressState = updates.address.state;
        userModel.addressCountry = updates.address.country;
        userModel.addressZipCode = updates.address.zipCode;
      }

      await userModel.save();

      // Actualizar roles si se proporcionan
      if (updates.roles) {
        const roleModels = await models.Role.findAll({
          where: { name: { [Op.in]: updates.roles } },
        });
        await userModel.setRoles(roleModels);
      }

      // Recargar con roles
      const updatedUser = await models.User.findByPk(id, {
        include: [{ model: models.Role, as: 'roles' }],
      });

      return this._toEntity(updatedUser);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async delete(id) {
    try {
      const userModel = await models.User.findByPk(id);

      if (!userModel) {
        return false;
      }

      userModel.isActive = false;
      await userModel.save();

      return true;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  /**
   * Verificar si existe un email
   */
  async existsByEmail(email) {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      const count = await models.User.count({
        where: { email: normalizedEmail },
      });

      return count > 0;
    } catch (error) {
      throw new Error(`Error checking email existence: ${error.message}`);
    }
  }

  /**
   * Verificar si existe un DNI
   */
  async existsByDNI(dni) {
    try {
      const count = await models.User.count({
        where: { dni },
      });

      return count > 0;
    } catch (error) {
      throw new Error(`Error checking DNI existence: ${error.message}`);
    }
  }

  /**
   * Contar usuarios con filtros opcionales
   */
  async count(filters = {}) {
    try {
      const { role, isActive } = filters;

      const where = {};

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const include = [];

      if (role) {
        include.push({
          model: models.Role,
          as: 'roles',
          where: { name: role },
        });
      }

      const count = await models.User.count({
        where,
        include,
        distinct: true,
      });

      return count;
    } catch (error) {
      throw new Error(`Error counting users: ${error.message}`);
    }
  }

  /**
   * Buscar usuarios por rol
   * @param {string} role - Rol a buscar (STUDENT, TEACHER, etc.)
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise<Array>} Lista de usuarios
   */
  async findByRole(role, filters = {}) {
    try {
      const { isActive } = filters;

      console.log(`🔍 Searching for users with role: ${role}`);

      // Construir query WHERE
      const whereClause = {};

      if (isActive !== undefined) {
        whereClause.isActive = isActive;
      }

      // Buscar usuarios con el rol especificado
      const users = await models.User.findAll({
        where: whereClause,
        include: [
          {
            model: models.Role,
            as: 'roles',
            where: { name: role },
            through: { attributes: [] },
            required: true, // ⭐ INNER JOIN - solo usuarios que tienen este rol
          },
        ],
      });

      console.log(`✅ Found ${users.length} users with role ${role}`);

      // Verificar que los roles estén cargados
      if (users.length > 0) {
        console.log(`📋 Sample user roles:`, users[0].roles);
      }

      // Convertir a entities
      const entities = users.map((user) => {
        const entity = this._toEntity(user);
        console.log(`👤 User ${entity.id} has roles:`, entity.roles);
        return entity;
      });

      return entities;
    } catch (error) {
      console.error('❌ Error finding users by role:', error);
      throw new Error(`Error finding users by role: ${error.message}`);
    }
  }
}

module.exports = UserRepository;
