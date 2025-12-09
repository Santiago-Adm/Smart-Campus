/**
 * Sequelize Model: UserRole
 * Tabla intermedia para la relación muchos a muchos entre User y Role
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserRole = sequelize.define(
    'UserRole',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'role_id',
        references: {
          model: 'roles',
          key: 'id',
        },
      },
    },
    {
      tableName: 'user_roles',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['role_id'] },
        { unique: true, fields: ['user_id', 'role_id'] },
      ],
    }
  );

  return UserRole;
};
