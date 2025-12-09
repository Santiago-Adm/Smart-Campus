/**
 * Test: SearchDocuments Use Case
 * Prueba la búsqueda con diferentes filtros
 */

require('dotenv').config();

// Repositories
const DocumentRepository = require('./src/infrastructure/persistence/mongo/repositories/DocumentRepository');

// Use Case
const SearchDocumentsUseCase = require('./src/application/use-cases/documents/SearchDocuments.usecase');

// MongoDB Connection
const { connectMongoDB } = require('./src/infrastructure/persistence/mongo/config/mongoose.config');

async function testSearchDocuments() {
  try {
    console.log('🧪 TEST: Search Documents Use Case\n');

    // 1. Conectar a MongoDB
    console.log('📦 Connecting to MongoDB...');
    await connectMongoDB();
    console.log('✅ MongoDB connected\n');

    // 2. Inicializar dependencias
    console.log('🔧 Initializing dependencies...');
    const documentRepository = new DocumentRepository();
    const searchDocumentsUseCase = new SearchDocumentsUseCase({
      documentRepository,
    });
    console.log('✅ Dependencies initialized\n');

    // 3. TEST 1: Buscar todos los documentos
    console.log('🔍 TEST 1: Search all documents\n');
    const allDocs = await searchDocumentsUseCase.execute({
      page: 1,
      limit: 10,
    });

    console.log('Results:', {
      found: allDocs.documents.length,
      total: allDocs.pagination.total,
      pages: allDocs.pagination.totalPages,
    });
    console.log();

    // 4. TEST 2: Buscar por tipo de documento
    console.log('🔍 TEST 2: Search by document type (DNI)\n');
    const dniDocs = await searchDocumentsUseCase.execute({
      documentType: 'DNI',
      page: 1,
      limit: 10,
    });

    console.log('Results:', {
      found: dniDocs.documents.length,
      total: dniDocs.pagination.total,
    });
    console.log();

    // 5. TEST 3: Buscar por estado
    console.log('🔍 TEST 3: Search by status (PENDING)\n');
    const pendingDocs = await searchDocumentsUseCase.execute({
      status: 'PENDING',
      page: 1,
      limit: 10,
    });

    console.log('Results:', {
      found: pendingDocs.documents.length,
      total: pendingDocs.pagination.total,
    });
    console.log();

    // 6. TEST 4: Buscar con múltiples filtros
    console.log('🔍 TEST 4: Search with multiple filters\n');
    const filteredDocs = await searchDocumentsUseCase.execute({
      documentType: 'DNI',
      status: 'APPROVED',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 5,
    });

    console.log('Results:', {
      found: filteredDocs.documents.length,
      total: filteredDocs.pagination.total,
    });

    // 7. Mostrar detalles de documentos encontrados
    if (allDocs.documents.length > 0) {
      console.log(`\n${'═'.repeat(60)}`);
      console.log('📄 Sample Documents:');
      console.log('═'.repeat(60));
      allDocs.documents.slice(0, 3).forEach((doc, index) => {
        console.log(`\n${index + 1}. Document ID: ${doc.id}`);
        console.log(`   Type: ${doc.metadata.type}`);
        console.log(`   Status: ${doc.status}`);
        console.log(`   File: ${doc.metadata.fileName}`);
        console.log(`   Created: ${new Date(doc.createdAt).toLocaleString()}`);
      });
      console.log(`\n${'═'.repeat(60)}`);
    }

    // 8. Cerrar conexión
    console.log('\n🔌 Closing connections...');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar test
testSearchDocuments();
