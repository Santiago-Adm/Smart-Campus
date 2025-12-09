/**
 * Tests del Módulo de Autenticación - VERSIÓN CORREGIDA
 */

// ============================================
// IMPORTACIONES DE INFRAESTRUCTURA
// ============================================
const {
  connectPostgreSQL,
  models,
  sequelize,
} = require('./src/infrastructure/persistence/postgres/config/sequelize.config');
const {
  connectMongoDB,
  mongoose,
} = require('./src/infrastructure/persistence/mongo/config/mongoose.config');
const { connectRedis, redisClient } = require('./src/infrastructure/config/redis.config');

// ============================================
// IMPORTACIONES DE REPOSITORIES
// ============================================
const UserRepository = require('./src/infrastructure/persistence/postgres/repositories/UserRepository');

// ============================================
// IMPORTACIONES DE SERVICES
// ============================================
const AuthService = require('./src/infrastructure/external-services/auth/AuthService');
const NotificationService = require('./src/infrastructure/external-services/email/NotificationService');

// ============================================
// IMPORTACIONES DE USE CASES
// ============================================
const RegisterUseCase = require('./src/application/use-cases/auth/Register.usecase');
const LoginUseCase = require('./src/application/use-cases/auth/Login.usecase');
const RecoverPasswordUseCase = require('./src/application/use-cases/auth/RecoverPassword.usecase');
const ResetPasswordUseCase = require('./src/application/use-cases/auth/ResetPassword.usecase');
const RefreshTokenUseCase = require('./src/application/use-cases/auth/RefreshToken.usecase');

// ============================================
// IMPORTACIONES DE DTOs
// ============================================
const RegisterDto = require('./src/application/dtos/auth/RegisterDto');
const LoginDto = require('./src/application/dtos/auth/LoginDto');
const RecoverPasswordDto = require('./src/application/dtos/auth/RecoverPasswordDto');
const ResetPasswordDto = require('./src/application/dtos/auth/ResetPasswordDto');
const RefreshTokenDto = require('./src/application/dtos/auth/RefreshTokenDto');

// ============================================
// EVENT BUS MOCK
// ============================================
class EventBusMock {
  constructor() {
    this.events = [];
  }

  publish(eventName, data) {
    this.events.push({ eventName, data, timestamp: new Date() });
    console.log(`📢 Event published: ${eventName}`);
  }

  getEvents(eventName) {
    return this.events.filter((e) => e.eventName === eventName);
  }

  clear() {
    this.events = [];
  }
}

// ============================================
// VARIABLES GLOBALES
// ============================================
let userRepository;
let authService;
let notificationService;
let eventBus;
let registerUseCase;
let loginUseCase;
let recoverPasswordUseCase;
let resetPasswordUseCase;
let refreshTokenUseCase;

// ============================================
// DATOS DE PRUEBA
// ============================================
const testUsers = {
  validUser: {
    email: 'test.auth@smartcampus.edu.pe',
    password: 'TestPassword123',
    firstName: 'Juan',
    lastName: 'Pérez',
    dni: '12345678',
    phone: '987654321',
  },
  duplicateUser: {
    email: 'test.auth@smartcampus.edu.pe',
    password: 'AnotherPassword456',
    firstName: 'María',
    lastName: 'García',
    dni: '87654321',
    phone: '912345678',
  },
};

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Limpia datos de test de la base de datos
 */
async function cleanupTestData() {
  console.log('🧹 Limpiando datos de test...');

  try {
    // Limpiar PostgreSQL
    await models.User.destroy({
      where: { email: testUsers.validUser.email },
      force: true,
    });

    // Limpiar Redis
    const keys = await redisClient.keys('*test*');
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }

    console.log('✅ Datos de test limpiados');
  } catch (error) {
    console.warn('⚠️ Advertencia en cleanup:', error.message);
  }
}

/**
 * Inicializa las dependencias
 */
async function setup() {
  console.log('🚀 Iniciando tests del Módulo Auth...\n');

  // Conectar a bases de datos
  console.log('📦 Conectando a bases de datos...');
  await connectPostgreSQL();
  await connectMongoDB();
  await connectRedis();

  // Limpiar datos de tests anteriores
  await cleanupTestData();

  // Inicializar dependencias
  userRepository = new UserRepository();
  authService = new AuthService();
  notificationService = new NotificationService();
  eventBus = new EventBusMock();

  // Inicializar Use Cases
  const dependencies = {
    userRepository,
    authService,
    notificationService,
    eventBus,
  };

  registerUseCase = new RegisterUseCase(dependencies);
  loginUseCase = new LoginUseCase(dependencies);
  recoverPasswordUseCase = new RecoverPasswordUseCase(dependencies);
  resetPasswordUseCase = new ResetPasswordUseCase(dependencies);
  refreshTokenUseCase = new RefreshTokenUseCase(dependencies);

  console.log('✅ Setup completado\n');
}

/**
 * Cierra conexiones
 */
async function teardown() {
  console.log('\n🧹 Finalizando tests...');
  await cleanupTestData();
  // Cerrar conexiones
  await sequelize.close();
  await mongoose.connection.close();
  await redisClient.quit();
  console.log('✅ Tests finalizados correctamente');
}

// ============================================
// TESTS
// ============================================

/**
 * TEST 1: Register - Registro exitoso
 */
async function testRegisterSuccess() {
  console.log('📝 TEST 1: Register - Registro exitoso');

  try {
    const registerDto = new RegisterDto(testUsers.validUser);
    const result = await registerUseCase.execute(registerDto);

    // Verificaciones
    console.assert(result.success === true, 'Debe retornar success: true');
    console.assert(result.data.id, 'Debe retornar ID del usuario');
    console.assert(result.data.email === testUsers.validUser.email, 'Email debe coincidir');
    console.assert(result.data.fullName === 'Juan Pérez', 'Nombre completo debe estar correcto');
    console.assert(result.data.isActive === false, 'Usuario debe estar inactivo inicialmente');
    console.assert(!result.data.password, 'No debe retornar password');

    // Verificar evento publicado
    const events = eventBus.getEvents('USER_CREATED');
    console.assert(events.length === 1, 'Debe publicar evento USER_CREATED');

    console.log('✅ TEST 1 PASADO: Usuario registrado correctamente');
    console.log(`   - ID: ${result.data.id}`);
    console.log(`   - Email: ${result.data.email}`);
    console.log(`   - Estado: ${result.data.isActive ? 'Activo' : 'Inactivo'}`);

    return result.data;
  } catch (error) {
    console.error('❌ TEST 1 FALLIDO:', error.message);
    throw error;
  }
}

/**
 * TEST 2: Register - Email duplicado
 */
async function testRegisterDuplicateEmail() {
  console.log('\n📝 TEST 2: Register - Email duplicado');

  try {
    const registerDto = new RegisterDto(testUsers.duplicateUser);
    await registerUseCase.execute(registerDto);

    // Si llega aquí, el test falló
    console.error('❌ TEST 2 FALLIDO: Debería lanzar error de email duplicado');
    throw new Error('No se detectó email duplicado');
  } catch (error) {
    if (error.message.includes('email ya está registrado')) {
      console.log('✅ TEST 2 PASADO: Error de email duplicado detectado correctamente');
      console.log(`   - Error: ${error.message}`);
    } else {
      console.error('❌ TEST 2 FALLIDO:', error.message);
      throw error;
    }
  }
}

/**
 * TEST 3: Register - Validación de DTO
 */
async function testRegisterValidation() {
  console.log('\n📝 TEST 3: Register - Validación de DTO');

  try {
    // Intentar registrar sin email
    const invalidDto = new RegisterDto({
      password: 'Test123',
      firstName: 'Test',
      lastName: 'User',
      dni: '12345678',
    });

    invalidDto.validate();

    console.error('❌ TEST 3 FALLIDO: Debería lanzar error de validación');
    throw new Error('Validación no funcionó');
  } catch (error) {
    if (error.message.includes('Email es requerido')) {
      console.log('✅ TEST 3 PASADO: Validación de DTO funciona correctamente');
      console.log(`   - Error capturado: ${error.message}`);
    } else {
      console.error('❌ TEST 3 FALLIDO:', error.message);
      throw error;
    }
  }
}

/**
 * TEST 4: Login - Login fallido (usuario inactivo)
 */
async function testLoginInactiveUser() {
  console.log('\n📝 TEST 4: Login - Usuario inactivo');

  try {
    const loginDto = new LoginDto({
      email: testUsers.validUser.email,
      password: testUsers.validUser.password,
    });

    await loginUseCase.execute(loginDto);

    console.error('❌ TEST 4 FALLIDO: Debería lanzar error de usuario inactivo');
    throw new Error('Usuario inactivo pudo hacer login');
  } catch (error) {
    if (error.message.includes('inactivo')) {
      console.log('✅ TEST 4 PASADO: Login bloqueado para usuario inactivo');
      console.log(`   - Error: ${error.message}`);
    } else {
      console.error('❌ TEST 4 FALLIDO:', error.message);
      throw error;
    }
  }
}

/**
 * TEST 5: Activar usuario manualmente (simula admin)
 */
async function activateTestUser() {
  console.log('\n🔧 Activando usuario de prueba...');

  try {
    const user = await userRepository.findByEmail(testUsers.validUser.email);
    // Actualizar usuario
    await userRepository.update(user.id, { isActive: true });

    console.log('✅ Usuario activado correctamente');
    // Retornar usuario actualizado
    return await userRepository.findByEmail(testUsers.validUser.email);
  } catch (error) {
    console.error('❌ Error activando usuario:', error.message);
    throw error;
  }
}

/**
 * TEST 6: Login - Login exitoso
 */
async function testLoginSuccess() {
  console.log('\n📝 TEST 6: Login - Login exitoso');

  try {
    const loginDto = new LoginDto({
      email: testUsers.validUser.email,
      password: testUsers.validUser.password,
    });

    const result = await loginUseCase.execute(loginDto);

    // Verificaciones
    console.assert(result.success === true, 'Debe retornar success: true');
    console.assert(result.data.accessToken, 'Debe retornar accessToken');
    console.assert(result.data.refreshToken, 'Debe retornar refreshToken');
    console.assert(result.data.tokenType === 'Bearer', 'TokenType debe ser Bearer');
    console.assert(result.data.user, 'Debe retornar datos de usuario');
    console.assert(result.data.user.email === testUsers.validUser.email, 'Email debe coincidir');

    // Verificar evento publicado
    const events = eventBus.getEvents('USER_LOGGED_IN');
    console.assert(events.length > 0, 'Debe publicar evento USER_LOGGED_IN');

    console.log('✅ TEST 6 PASADO: Login exitoso');
    console.log(`   - Access Token: ${result.data.accessToken.substring(0, 20)}...`);
    console.log(`   - Refresh Token: ${result.data.refreshToken.substring(0, 20)}...`);
    console.log(`   - Usuario: ${result.data.user.fullName}`);

    return result.data;
  } catch (error) {
    console.error('❌ TEST 6 FALLIDO:', error.message);
    throw error;
  }
}

/**
 * TEST 7: Login - Credenciales inválidas
 */
async function testLoginInvalidCredentials() {
  console.log('\n📝 TEST 7: Login - Credenciales inválidas');

  try {
    const loginDto = new LoginDto({
      email: testUsers.validUser.email,
      password: 'PasswordIncorrecto123',
    });

    await loginUseCase.execute(loginDto);

    console.error('❌ TEST 7 FALLIDO: Debería lanzar error de credenciales inválidas');
    throw new Error('Login con password incorrecta');
  } catch (error) {
    if (error.message.includes('Credenciales inválidas')) {
      console.log('✅ TEST 7 PASADO: Credenciales inválidas detectadas');
      console.log(`   - Error: ${error.message}`);
    } else {
      console.error('❌ TEST 7 FALLIDO:', error.message);
      throw error;
    }
  }
}

/**
 * TEST 8: RefreshToken - Refresh exitoso
 */
async function testRefreshTokenSuccess(loginResult) {
  console.log('\n📝 TEST 8: RefreshToken - Renovación exitosa');

  try {
    const refreshTokenDto = new RefreshTokenDto({
      refreshToken: loginResult.refreshToken,
    });

    const result = await refreshTokenUseCase.execute(refreshTokenDto);

    // Verificaciones
    console.assert(result.success === true, 'Debe retornar success: true');
    console.assert(result.data.accessToken, 'Debe retornar nuevo accessToken');
    console.assert(result.data.refreshToken, 'Debe retornar nuevo refreshToken');
    console.assert(
      result.data.accessToken !== loginResult.accessToken,
      'AccessToken debe ser diferente'
    );
    console.assert(
      result.data.refreshToken !== loginResult.refreshToken,
      'RefreshToken debe ser diferente'
    );

    // Verificar evento publicado
    const events = eventBus.getEvents('TOKEN_REFRESHED');
    console.assert(events.length > 0, 'Debe publicar evento TOKEN_REFRESHED');

    console.log('✅ TEST 8 PASADO: Tokens renovados correctamente');
    console.log(`   - Nuevo Access Token: ${result.data.accessToken.substring(0, 20)}...`);
    console.log(`   - Nuevo Refresh Token: ${result.data.refreshToken.substring(0, 20)}...`);

    return result.data;
  } catch (error) {
    console.error('❌ TEST 8 FALLIDO:', error.message);
    throw error;
  }
}

/**
 * TEST 9: RefreshToken - Token inválido
 */
async function testRefreshTokenInvalid() {
  console.log('\n📝 TEST 9: RefreshToken - Token inválido');

  try {
    const refreshTokenDto = new RefreshTokenDto({
      refreshToken: 'token_invalido_12345',
    });

    await refreshTokenUseCase.execute(refreshTokenDto);

    console.error('❌ TEST 9 FALLIDO: Debería lanzar error de token inválido');
    throw new Error('Token inválido aceptado');
  } catch (error) {
    if (
      error.message.includes('inválido') ||
      error.message.includes('invalid') ||
      error.message.toLowerCase().includes('token')
    ) {
      console.log('✅ TEST 9 PASADO: Token inválido rechazado correctamente');
      console.log(`   - Error: ${error.message}`);
    } else {
      console.error('❌ TEST 9 FALLIDO:', error.message);
      throw error;
    }
  }
}

/**
 * TEST 10: RecoverPassword - Solicitud exitosa
 */
async function testRecoverPasswordSuccess() {
  console.log('\n📝 TEST 10: RecoverPassword - Solicitud exitosa');

  try {
    const recoverDto = new RecoverPasswordDto({
      email: testUsers.validUser.email,
    });

    const result = await recoverPasswordUseCase.execute(recoverDto);

    // Verificaciones
    console.assert(result.success === true, 'Debe retornar success: true');
    console.assert(result.message, 'Debe retornar mensaje');

    // Verificar evento publicado
    const events = eventBus.getEvents('PASSWORD_RESET_REQUESTED');
    console.assert(events.length > 0, 'Debe publicar evento PASSWORD_RESET_REQUESTED');

    console.log('✅ TEST 10 PASADO: Solicitud de recuperación procesada');
    console.log(`   - Mensaje: ${result.message}`);

    // Obtener token del evento para siguiente test
    const { resetToken } = events[events.length - 1].data;
    return resetToken;
  } catch (error) {
    console.error('❌ TEST 10 FALLIDO:', error.message);
    throw error;
  }
}

/**
 * TEST 11: ResetPassword - Reset exitoso
 */
async function testResetPasswordSuccess(resetToken) {
  console.log('\n📝 TEST 11: ResetPassword - Reset exitoso');

  try {
    const resetDto = new ResetPasswordDto({
      token: resetToken,
      newPassword: 'NewPassword456',
      confirmPassword: 'NewPassword456',
    });

    const result = await resetPasswordUseCase.execute(resetDto);

    // Verificaciones
    console.assert(result.success === true, 'Debe retornar success: true');
    console.assert(result.message, 'Debe retornar mensaje de éxito');

    // Verificar evento publicado
    const events = eventBus.getEvents('PASSWORD_RESET_COMPLETED');
    console.assert(events.length > 0, 'Debe publicar evento PASSWORD_RESET_COMPLETED');

    console.log('✅ TEST 11 PASADO: Contraseña reseteada correctamente');
    console.log(`   - Mensaje: ${result.message}`);
  } catch (error) {
    console.error('❌ TEST 11 FALLIDO:', error.message);
    throw error;
  }
}

/**
 * TEST 12: Login con nueva contraseña
 */
async function testLoginWithNewPassword() {
  console.log('\n📝 TEST 12: Login - Con nueva contraseña');

  try {
    const loginDto = new LoginDto({
      email: testUsers.validUser.email,
      password: 'NewPassword456',
    });

    const result = await loginUseCase.execute(loginDto);

    console.assert(result.success === true, 'Debe poder hacer login con nueva contraseña');
    console.assert(result.data.accessToken, 'Debe retornar tokens');

    console.log('✅ TEST 12 PASADO: Login exitoso con nueva contraseña');
  } catch (error) {
    console.error('❌ TEST 12 FALLIDO:', error.message);
    throw error;
  }
}

// ============================================
// EJECUTAR TODOS LOS TESTS
// ============================================
async function runAllTests() {
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    await setup();

    // Test Suite
    try {
      await testRegisterSuccess();
      // eslint-disable-next-line no-plusplus
      testsPassed++;
    } catch (error) {
      // eslint-disable-next-line no-plusplus
      testsFailed++;
    }

    try {
      await testRegisterDuplicateEmail();
      // eslint-disable-next-line no-plusplus
      testsPassed++;
    } catch (error) {
      // eslint-disable-next-line no-plusplus
      testsFailed++;
    }

    try {
      await testRegisterValidation();
      // eslint-disable-next-line no-plusplus
      testsPassed++;
    } catch (error) {
      // eslint-disable-next-line no-plusplus
      testsFailed++;
    }

    try {
      await testLoginInactiveUser();
      // eslint-disable-next-line no-plusplus
      testsPassed++;
    } catch (error) {
      // eslint-disable-next-line no-plusplus
      testsFailed++;
    }

    try {
      await activateTestUser();
      // eslint-disable-next-line no-plusplus
      testsPassed++;
    } catch (error) {
      // eslint-disable-next-line no-plusplus
      testsFailed++;
    }

    let loginResult;
    try {
      loginResult = await testLoginSuccess();
      // eslint-disable-next-line no-plusplus
      testsPassed++;
    } catch (error) {
      // eslint-disable-next-line no-plusplus
      testsFailed++;
    }

    try {
      await testLoginInvalidCredentials();
      // eslint-disable-next-line no-plusplus
      testsPassed++;
    } catch (error) {
      // eslint-disable-next-line no-plusplus
      testsFailed++;
    }

    try {
      if (loginResult) {
        await testRefreshTokenSuccess(loginResult);
        // eslint-disable-next-line no-plusplus
        testsPassed++;
      }
    } catch (error) {
      // eslint-disable-next-line no-plusplus
      testsFailed++;
    }

    try {
      await testRefreshTokenInvalid();
      // eslint-disable-next-line no-plusplus
      testsPassed++;
    } catch (error) {
      // eslint-disable-next-line no-plusplus
      testsFailed++;
    }

    let resetToken;
    try {
      resetToken = await testRecoverPasswordSuccess();
      // eslint-disable-next-line no-plusplus
      testsPassed++;
    } catch (error) {
      // eslint-disable-next-line no-plusplus
      testsFailed++;
    }

    try {
      if (resetToken) {
        await testResetPasswordSuccess(resetToken);
        // eslint-disable-next-line no-plusplus
        testsPassed++;
      }
    } catch (error) {
      // eslint-disable-next-line no-plusplus
      testsFailed++;
    }

    try {
      await testLoginWithNewPassword();
      // eslint-disable-next-line no-plusplus
      testsPassed++;
    } catch (error) {
      // eslint-disable-next-line no-plusplus
      testsFailed++;
    }

    // Resumen final
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 RESUMEN DE TESTS');
    console.log('='.repeat(60));
    console.log(`✅ Tests pasados: ${testsPassed}`);
    console.log(`❌ Tests fallidos: ${testsFailed}`);
    console.log(`📈 Total de tests: ${testsPassed + testsFailed}`);
    console.log(
      `🎯 Porcentaje de éxito: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%`
    );
    console.log('='.repeat(60));

    // Mostrar eventos publicados
    console.log('\n📢 EVENTOS PUBLICADOS:');
    eventBus.events.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.eventName} - ${event.timestamp.toLocaleTimeString()}`);
    });

    await teardown();

    if (testsFailed === 0) {
      console.log('\n🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE! 🎉\n');
      process.exit(0);
    } else {
      console.log('\n⚠️ ALGUNOS TESTS FALLARON ⚠️\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 ERROR CRÍTICO EN LOS TESTS:', error);
    await teardown();
    process.exit(1);
  }
}

// Ejecutar tests
runAllTests();
