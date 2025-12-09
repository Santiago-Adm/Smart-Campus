/**
 * Test: ValidateDocument Use Case
 * Prueba la validación automática con OCR
 */

require('dotenv').config();

// Repositories
const DocumentRepository = require('./src/infrastructure/persistence/mongo/repositories/DocumentRepository');

// Services
const GoogleVisionService = require('./src/infrastructure/external-services/ocr/GoogleVisionService');

// Use Case
const ValidateDocumentUseCase = require('./src/application/use-cases/documents/ValidateDocument.usecase');

// Event Bus
const EventBus = require('./src/infrastructure/messaging/EventBus');

// MongoDB Connection
const { connectMongoDB } = require('./src/infrastructure/persistence/mongo/config/mongoose.config');

async function testValidateDocument() {
  try {
    console.log('🧪 TEST: Validate Document Use Case\n');

    // 1. Conectar a MongoDB
    console.log('📦 Connecting to MongoDB...');
    await connectMongoDB();
    console.log('✅ MongoDB connected\n');

    // 2. Inicializar dependencias
    console.log('🔧 Initializing dependencies...');
    const documentRepository = new DocumentRepository();
    const ocrService = new GoogleVisionService();
    const eventBus = EventBus.getInstance();

    const validateDocumentUseCase = new ValidateDocumentUseCase({
      documentRepository,
      ocrService,
      eventBus,
    });
    console.log('✅ Dependencies initialized\n');

    // 3. Buscar un documento pendiente de validación
    console.log('🔍 Looking for pending documents...');
    const filters = { status: 'PENDING', limit: 1 };
    const pendingDocs = await documentRepository.findByFilters(filters);

    if (pendingDocs.documents.length === 0) {
      console.log('⚠️  No pending documents found. Please run test-upload-document.js first');
      process.exit(0);
    }

    const documentToValidate = pendingDocs.documents[0];
    console.log('✅ Found document:', documentToValidate.id);
    console.log('   Type:', documentToValidate.metadata.type);
    console.log('   Status:', documentToValidate.status);
    console.log();

    // 4. Ejecutar validación
    console.log('🚀 Executing ValidateDocument Use Case...\n');
    const result = await validateDocumentUseCase.execute({
      documentId: documentToValidate.id,
    });

    // 5. Mostrar resultados
    console.log('═'.repeat(60));
    console.log('✅ VALIDATE DOCUMENT TEST - SUCCESS');
    console.log('═'.repeat(60));
    console.log('\n📋 Validation Results:');
    console.log('   Document ID:', result.document.id);
    console.log('   New Status:', result.document.status);
    console.log('   Auto-Approved:', result.validationResult.autoApprove);
    console.log('   Reason:', result.validationResult.reason);
    console.log('\n🔍 OCR Results:');
    console.log('   Confidence:', `${(result.ocrResult.confidence * 100).toFixed(1)}%`);
    console.log('   Extracted Fields:');
    Object.entries(result.ocrResult.fields).forEach(([key, value]) => {
      console.log(`      ${key}: ${value}`);
    });
    console.log(`\n${'═'.repeat(60)}`);

    // 6. Cerrar conexión
    console.log('\n🔌 Closing connections...');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar test
testValidateDocument();
