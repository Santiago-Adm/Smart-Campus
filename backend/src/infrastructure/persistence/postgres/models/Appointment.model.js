/**
 * Sequelize Model: Appointment
 * Modelo de citas de teleenfermería
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Appointment = sequelize.define(
    'Appointment',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'student_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      teacherId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'teacher_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'scheduled_at',
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        validate: {
          min: 15,
          max: 120,
        },
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'SCHEDULED',
        validate: {
          isIn: [['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']],
        },
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      recordingUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'recording_url',
      },
      vitalSigns: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'vital_signs',
      },
    },
    {
      tableName: 'appointments',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['student_id'] },
        { fields: ['teacher_id'] },
        { fields: ['scheduled_at'] },
        { fields: ['status'] },
      ],
    }
  );

  Appointment.associate = (models) => {
    // ✅ Relación con User (como estudiante)
    Appointment.belongsTo(models.User, {
      foreignKey: 'studentId', // ✅ Usar camelCase (JavaScript property)
      as: 'student',
    });

    // ✅ Relación con User (como docente)
    Appointment.belongsTo(models.User, {
      foreignKey: 'teacherId', // ✅ Usar camelCase (JavaScript property)
      as: 'teacher',
    });
  };

  return Appointment;
};
