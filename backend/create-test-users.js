/**
 * Script: Crear Usuarios de Prueba
 * Crea usuarios con diferentes roles para testing
 */

require('dotenv').config();

// Database connections
const {
  connectPostgreSQL,
} = require('./src/infrastructure/persistence/postgres/config/sequelize.config');

// Repositories
const UserRepository = require('./src/infrastructure/persistence/postgres/repositories/UserRepository');

// Services
const AuthService = require('./src/infrastructure/external-services/auth/AuthService');

// Entities
const User = require('./src/domain/entities/User.entity');

// Enums
const { UserRole } = require('./src/domain/enums/UserRole.enum');

async function createTestUsers() {
  try {
    console.log('🚀 Creando usuarios de prueba...\n');

    // Conectar a PostgreSQL
    console.log('📦 Conectando a PostgreSQL...');
    await connectPostgreSQL();
    console.log('✅ Conectado\n');

    // Inicializar dependencias
    const userRepository = new UserRepository();
    const authService = new AuthService();

    // ============================================
    // USUARIOS DE PRUEBA
    // ============================================
    // ✅ CORRECTO
    const testUsers = [
      {
        email: 'juan.perez@smartcampus.edu.pe',
        password: 'NewPassword456',
        firstName: 'Juan',
        lastName: 'Pérez',
        dni: '12345678',
        phone: '987654321',
        roles: [UserRole.STUDENT],
        description: '👤 Estudiante - Usuario para pruebas generales',
      },
      {
        email: 'maria.garcia@smartcampus.edu.pe',
        password: 'Teacher123',
        firstName: 'María',
        lastName: 'García',
        dni: '23456789',
        phone: '987654322',
        roles: [UserRole.TEACHER],
        description: '👨‍🏫 Docente - Puede crear escenarios AR y supervisar',
      },
      {
        email: 'carlos.lopez@smartcampus.edu.pe',
        password: 'Administrative123',
        firstName: 'Carlos',
        lastName: 'López',
        dni: '34567890',
        phone: '987654323',
        roles: [UserRole.ADMINISTRATIVE], // ✅ CORREGIDO
        description: '👔 Administrativo - Puede validar, aprobar y rechazar documentos',
      },
      {
        email: 'admin@smartcampus.edu.pe',
        password: 'Admin123',
        firstName: 'Administrador',
        lastName: 'Sistema',
        dni: '45678901',
        phone: '987654324',
        roles: [UserRole.IT_ADMIN], // ✅ CORREGIDO
        description: '🔧 Administrador TI - Acceso completo al sistema',
      },
      {
        email: 'director@smartcampus.edu.pe',
        password: 'Director123',
        firstName: 'Roberto',
        lastName: 'Sánchez',
        dni: '56789012',
        phone: '987654325',
        roles: [UserRole.DIRECTOR],
        description: '📊 Director - Acceso a analytics estratégicos',
      },
    ];

    console.log('='.repeat(70));
    console.log('📝 CREANDO USUARIOS DE PRUEBA');
    console.log('='.repeat(70));
    console.log();

    // eslint-disable-next-line no-restricted-syntax
    for (const userData of testUsers) {
      try {
        // Verificar si el usuario ya existe
        // eslint-disable-next-line no-await-in-loop
        const existingUser = await userRepository.findByEmail(userData.email);

        if (existingUser) {
          console.log(`⚠️  Usuario ${userData.email} ya existe - SALTANDO`);
          console.log(`   Roles actuales: ${existingUser.roles.join(', ')}`);
          console.log();
          // eslint-disable-next-line no-continue
          continue;
        }

        // Hash de la contraseña
        // eslint-disable-next-line no-await-in-loop
        const hashedPassword = await authService.hashPassword(userData.password);

        // Crear entidad de usuario
        const user = new User({
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          dni: userData.dni,
          phone: userData.phone,
          roles: userData.roles,
          isActive: true,
        });

        // Guardar en la base de datos
        // eslint-disable-next-line no-await-in-loop
        const createdUser = await userRepository.create(user);

        console.log('✅ Usuario creado exitosamente:');
        console.log(`   ${userData.description}`);
        console.log(`   📧 Email: ${userData.email}`);
        console.log(`   🔑 Password: ${userData.password}`);
        console.log(`   👤 Nombre: ${userData.firstName} ${userData.lastName}`);
        console.log(`   🎭 Roles: ${userData.roles.join(', ')}`);
        console.log(`   🆔 ID: ${createdUser.id}`);
        console.log();
      } catch (error) {
        console.error(`❌ Error creando usuario ${userData.email}:`, error.message);
        console.log();
      }
    }

    console.log('='.repeat(70));
    console.log('🎉 PROCESO COMPLETADO');
    console.log('='.repeat(70));
    console.log();
    console.log('📋 RESUMEN DE CREDENCIALES:');
    console.log();
    console.log('   ESTUDIANTE:');
    console.log('   📧 juan.perez@smartcampus.edu.pe');
    console.log('   🔑 NewPassword456');
    console.log();
    console.log('   DOCENTE:');
    console.log('   📧 maria.garcia@smartcampus.edu.pe');
    console.log('   🔑 Teacher123');
    console.log();
    console.log('   ADMINISTRATIVO:');
    console.log('   📧 carlos.lopez@smartcampus.edu.pe');
    console.log('   🔑 Administrative123');
    console.log();
    console.log('   ADMINISTRADOR TI:');
    console.log('   📧 admin@smartcampus.edu.pe');
    console.log('   🔑 Admin123');
    console.log();
    console.log('   DIRECTOR:');
    console.log('   📧 director@smartcampus.edu.pe');
    console.log('   🔑 Director123');
    console.log();
    console.log('='.repeat(70));
    console.log();
    console.log('✨ Ahora puedes usar estos usuarios para testing!');
    console.log();

    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar script
createTestUsers();
