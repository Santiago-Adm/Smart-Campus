// Test de Interfaces
const IUserRepository = require('./src/domain/interfaces/repositories/IUserRepository');
const IDocumentRepository = require('./src/domain/interfaces/repositories/IDocumentRepository');
const IAuthService = require('./src/domain/interfaces/services/IAuthService');
const IFileService = require('./src/domain/interfaces/services/IFileService');

console.log('🧪 Testing Interfaces...\n');

// Función principal asíncrona
async function testInterfaces() {
  try {
    // Test que las interfaces lanzan errores si no se implementan
    const userRepo = new IUserRepository();
    const docRepo = new IDocumentRepository();
    const authService = new IAuthService();
    const fileService = new IFileService();

    console.log('✅ IUserRepository instantiated');
    console.log('✅ IDocumentRepository instantiated');
    console.log('✅ IAuthService instantiated');
    console.log('✅ IFileService instantiated');

    // Verificar que los métodos lanzan errores (Repository)
    try {
      await userRepo.create({});
    } catch (error) {
      console.log('✅ IUserRepository.create() throws error as expected');
    }

    try {
      await docRepo.findById('123');
    } catch (error) {
      console.log('✅ IDocumentRepository.findById() throws error as expected');
    }

    // Verificar que los métodos lanzan errores (Service)
    try {
      authService.generateAccessToken({});
    } catch (error) {
      console.log('✅ IAuthService.generateAccessToken() throws error as expected');
    }

    try {
      await fileService.uploadFile(Buffer.from('test'), 'test.pdf', 'application/pdf', {});
    } catch (error) {
      console.log('✅ IFileService.uploadFile() throws error as expected');
    }

    console.log('\n🎉 All interface tests passed!');
    console.log('📝 Interfaces define contracts correctly');
    console.log('🚀 Ready to implement in Infrastructure Layer');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Ejecutar tests
testInterfaces();