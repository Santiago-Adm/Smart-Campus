/**
 * Sequelize Model: Role
 * Modelo de roles de usuario
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Role = sequelize.define(
    'Role',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          isIn: [['STUDENT', 'TEACHER', 'ADMINISTRATIVE', 'IT_ADMIN', 'DIRECTOR']],
        },
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: 'roles',
      timestamps: true,
      underscored: true,
    }
  );

  Role.associate = (models) => {
    Role.belongsToMany(models.User, {
      through: models.UserRole,
      foreignKey: 'role_id',
      otherKey: 'user_id',
      as: 'users',
    });
  };

  return Role;
};
