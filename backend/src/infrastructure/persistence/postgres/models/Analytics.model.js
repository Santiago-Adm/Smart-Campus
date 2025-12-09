/**
 * Sequelize Model: Analytics
 * Modelo para métricas y analíticas
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Analytics = sequelize.define(
    'Analytics',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      eventType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'event_type',
        // 'login', 'document_upload', 'resource_view', 'simulation_complete', etc.
      },
      eventData: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'event_data',
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      tableName: 'analytics',
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ['user_id'] }, { fields: ['event_type'] }, { fields: ['created_at'] }],
    }
  );

  Analytics.associate = (models) => {
    Analytics.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return Analytics;
};
