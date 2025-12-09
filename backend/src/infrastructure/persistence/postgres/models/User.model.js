/**
 * Sequelize Model: User
 * Modelo de base de datos para usuarios en PostgreSQL
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'first_name',
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'last_name',
      },
      dni: {
        type: DataTypes.STRING(8),
        allowNull: false,
        unique: true,
        validate: {
          len: [8, 8],
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'date_of_birth',
      },
      addressStreet: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'address_street',
      },
      addressCity: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'address_city',
      },
      addressState: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'address_state',
      },
      addressCountry: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'address_country',
      },
      addressZipCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'address_zip_code',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active',
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_email_verified',
      },
      profilePicture: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'profile_picture',
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ['email'] }, { fields: ['dni'] }, { fields: ['is_active'] }],
    }
  );

  // Asociaciones (las definiremos después)
  User.associate = (models) => {
    User.belongsToMany(models.Role, {
      through: models.UserRole,
      foreignKey: 'user_id',
      otherKey: 'role_id',
      as: 'roles',
    });

    User.hasMany(models.Appointment, {
      foreignKey: 'student_id',
      as: 'appointmentsAsStudent',
    });

    User.hasMany(models.Appointment, {
      foreignKey: 'teacher_id',
      as: 'appointmentsAsTeacher',
    });
  };

  return User;
};
