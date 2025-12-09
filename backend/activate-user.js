const { models } = require('./src/infrastructure/persistence/postgres/config/sequelize.config');

async function activateUser() {
  await models.User.update(
    { isActive: true },
    { where: { email: 'juan.perez@smartcampus.edu.pe' } }
  );
  console.log('✅ Usuario activado');
  process.exit(0);
}

activateUser();
