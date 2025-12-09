/**
 * Configuración de Sequelize (PostgreSQL ORM)
 */

const { Sequelize } = require('sequelize');
const config = require('../../../config/env.config');

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  config.postgres.database,
  config.postgres.username,
  config.postgres.password,
  {
    host: config.postgres.host,
    port: config.postgres.port,
    dialect: config.postgres.dialect,
    logging: config.postgres.logging,
    pool: config.postgres.pool,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Importar modelos
const UserModel = require('../models/User.model');
const RoleModel = require('../models/Role.model');
const UserRoleModel = require('../models/UserRole.model');
const AppointmentModel = require('../models/Appointment.model');
const AnalyticsModel = require('../models/Analytics.model');

// Inicializar modelos
const models = {
  User: UserModel(sequelize),
  Role: RoleModel(sequelize),
  UserRole: UserRoleModel(sequelize),
  Appointment: AppointmentModel(sequelize),
  Analytics: AnalyticsModel(sequelize),
};

// Ejecutar asociaciones
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

/**
 * Función para conectar a PostgreSQL
 */
const connectPostgreSQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established successfully');

    // Solo sincronizar en desarrollo (NO usar en producción)
    if (config.env === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ PostgreSQL models synchronized');

      // Seed inicial de roles
      // eslint-disable-next-line no-use-before-define
      await seedRoles();
    }
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error.message);
    throw error;
  }
};

/**
 * Seed inicial de roles
 */
const seedRoles = async () => {
  try {
    const roles = [
      { name: 'STUDENT', description: 'Estudiante' },
      { name: 'TEACHER', description: 'Docente' },
      { name: 'ADMINISTRATIVE', description: 'Administrativo' },
      { name: 'IT_ADMIN', description: 'Administrador TI' },
      { name: 'DIRECTOR', description: 'Director' },
    ];

    // eslint-disable-next-line no-restricted-syntax
    for (const role of roles) {
      // eslint-disable-next-line no-await-in-loop
      await models.Role.findOrCreate({
        where: { name: role.name },
        defaults: role,
      });
    }

    console.log('✅ Roles seeded successfully');
  } catch (error) {
    console.error('⚠️ Error seeding roles:', error.message);
  }
};

/**
 * Función para cerrar conexión
 */
const closePostgreSQL = async () => {
  try {
    await sequelize.close();
    console.log('✅ PostgreSQL connection closed');
  } catch (error) {
    console.error('❌ Error closing PostgreSQL connection:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  models,
  connectPostgreSQL,
  closePostgreSQL,
};
