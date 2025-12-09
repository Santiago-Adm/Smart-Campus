/**
 * Test de Repository Implementations
 * Ahora con limpieza automática y datos únicos
 */

const {
  connectPostgreSQL,
  models,
  sequelize,
} = require('./src/infrastructure/persistence/postgres/config/sequelize.config');
const {
  connectMongoDB,
  mongoose,
} = require('./src/infrastructure/persistence/mongo/config/mongoose.config');
const UserRepository = require('./src/infrastructure/persistence/postgres/repositories/UserRepository');
const DocumentRepository = require('./src/infrastructure/persistence/mongo/repositories/DocumentRepository');
const User = require('./src/domain/entities/User.entity');
const Document = require('./src/domain/entities/Document.entity');
const { UserRole } = require('./src/domain/enums/UserRole.enum');
const { DocumentType } = require('./src/domain/enums/DocumentType.enum');

async function cleanupDatabases() {
  console.log('🧹 Cleaning up test data...');

  try {
    // Limpiar PostgreSQL (solo usuarios de test)
    await models.User.destroy({
      where: { email: 'test@smartcampus.edu.pe' },
      force: true,
    });

    // Limpiar MongoDB
    await mongoose.connection.collection('documents').deleteMany({
      'metadata.fileName': 'test-dni.pdf',
    });

    console.log('✅ Test data cleaned');
  } catch (error) {
    console.warn('⚠️ Cleanup warning:', error.message);
  }
}

async function testRepositories() {
  let createdUserId = null;

  try {
    console.log('🧪 Testing Repository Implementations...\n');

    // Conectar a bases de datos
    console.log('📦 Connecting to databases...');
    await connectPostgreSQL();
    await connectMongoDB();

    // Limpiar datos de tests anteriores
    await cleanupDatabases();

    // ============================================
    // Test UserRepository
    // ============================================
    console.log('\n✅ Testing UserRepository...');
    const userRepo = new UserRepository();

    // Generar datos únicos para evitar conflictos
    const timestamp = Date.now();
    const uniqueDNI = `8765${timestamp.toString().slice(-4)}`;

    // Crear usuario de prueba
    const testUser = new User({
      email: 'test@smartcampus.edu.pe',
      password: 'hashedpassword123',
      firstName: 'Test',
      lastName: 'User',
      dni: uniqueDNI,
      phone: '987654321',
      roles: [UserRole.STUDENT],
    });

    console.log('Creating test user...');
    const createdUser = await userRepo.create(testUser);
    createdUserId = createdUser.id;
    console.log('✅ User created with ID:', createdUser.id);
    console.log('✅ User DNI:', createdUser.dni);

    // Buscar usuario por email
    const foundUser = await userRepo.findByEmail('test@smartcampus.edu.pe');
    console.log('✅ User found by email:', foundUser.getFullName());

    // Buscar usuario por DNI
    const foundByDNI = await userRepo.findByDNI(uniqueDNI);
    console.log('✅ User found by DNI:', foundByDNI.dni);

    // Verificar existencia
    const emailExists = await userRepo.existsByEmail('test@smartcampus.edu.pe');
    console.log('✅ Email exists check:', emailExists);

    // Contar usuarios
    const userCount = await userRepo.count({ isActive: true });
    console.log('✅ Total active users:', userCount);

    // ============================================
    // Test DocumentRepository
    // ============================================
    console.log('\n✅ Testing DocumentRepository...');
    const docRepo = new DocumentRepository();

    // Crear documento de prueba
    const testDoc = new Document({
      userId: createdUser.id,
      metadata: {
        type: DocumentType.DNI,
        fileName: 'test-dni.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        issueDate: '2023-01-15',
        description: 'Documento de prueba',
      },
      fileUrl: 'https://test.com/test-dni.pdf',
    });

    console.log('Creating test document...');
    const createdDoc = await docRepo.create(testDoc);
    console.log('✅ Document created with ID:', createdDoc.id);
    console.log('✅ Document status:', createdDoc.status);

    // Buscar documento por ID
    const foundDoc = await docRepo.findById(createdDoc.id);
    console.log('✅ Document found by ID:', foundDoc.id);

    // Buscar documentos del usuario
    const userDocs = await docRepo.findByUserId(createdUser.id);
    console.log('✅ Found', userDocs.total, 'document(s) for user');

    // Contar documentos por estado
    const docCounts = await docRepo.countByStatus(createdUser.id);
    console.log('✅ Documents by status:', JSON.stringify(docCounts));

    // Buscar documentos pendientes
    const pendingDocs = await docRepo.findPendingReview(5);
    console.log('✅ Found', pendingDocs.length, 'pending documents');

    console.log('\n🎉 All repository tests passed!');
    console.log('🚀 Repositories are working correctly with databases');
    console.log('✨ UserRepository: CREATE, READ, FIND operations ✅');
    console.log('✨ DocumentRepository: CREATE, READ, FIND operations ✅');

    // Cleanup final
    await cleanupDatabases();

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Repository test failed:', error.message);
    console.error('Stack trace:', error.stack);

    // Cleanup en caso de error
    try {
      await cleanupDatabases();
    } catch (cleanupError) {
      console.error('⚠️ Cleanup failed:', cleanupError.message);
    }

    process.exit(1);
  }
}

testRepositories();
