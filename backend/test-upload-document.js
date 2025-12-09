/**
 * Test: UploadDocument Use Case
 * Prueba la subida de un documento con archivo mock
 */

require('dotenv').config();
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
// eslint-disable-next-line no-unused-vars
const path = require('path');

// Repositories
const DocumentRepository = require('./src/infrastructure/persistence/mongo/repositories/DocumentRepository');

// Services
// eslint-disable-next-line import/no-unresolved, import/extensions
const AzureBlobService = require('./src/infrastructure/external-services/azure/AzureBlobService');

// Use Case
const UploadDocumentUseCase = require('./src/application/use-cases/documents/UploadDocument.usecase');

// Event Bus
const EventBus = require('./src/infrastructure/messaging/EventBus');

// MongoDB Connection
const { connectMongoDB } = require('./src/infrastructure/persistence/mongo/config/mongoose.config');

async function testUploadDocument() {
  try {
    console.log('🧪 TEST: Upload Document Use Case\n');

    // 1. Conectar a MongoDB
    console.log('📦 Connecting to MongoDB...');
    await connectMongoDB();
    console.log('✅ MongoDB connected\n');

    // 2. Inicializar dependencias
    console.log('🔧 Initializing dependencies...');
    const documentRepository = new DocumentRepository();
    const fileService = new AzureBlobService();
    const eventBus = EventBus.getInstance();

    const uploadDocumentUseCase = new UploadDocumentUseCase({
      documentRepository,
      fileService,
      eventBus,
    });
    console.log('✅ Dependencies initialized\n');

    // 3. Crear un archivo mock (PDF de 1KB)
    console.log('📄 Creating mock file...');
    const mockPdfContent = Buffer.from(
      '%PDF-1.4\n%Mock PDF for testing\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n%%EOF',
      'utf-8'
    );

    const testData = {
      userId: '655aa70d-391e-4e7b-b2aa-25ce3c9ad48b', // Usuario de prueba
      fileBuffer: mockPdfContent,
      fileName: 'dni-test.pdf',
      mimeType: 'application/pdf',
      fileSize: mockPdfContent.length,
      documentType: 'DNI',
      description: 'Documento de prueba - DNI',
      issueDate: new Date('2020-01-15'),
    };

    console.log('Mock file created:', {
      fileName: testData.fileName,
      size: `${testData.fileSize} bytes`,
      type: testData.mimeType,
    });
    console.log();

    // 4. Ejecutar Use Case
    console.log('🚀 Executing UploadDocument Use Case...\n');
    const result = await uploadDocumentUseCase.execute(testData);

    // 5. Mostrar resultados
    console.log('═'.repeat(60));
    console.log('✅ UPLOAD DOCUMENT TEST - SUCCESS');
    console.log('═'.repeat(60));
    console.log('\n📋 Document Details:');
    console.log('   ID:', result.id);
    console.log('   User ID:', result.userId);
    console.log('   Type:', result.metadata.type);
    console.log('   File Name:', result.metadata.fileName);
    console.log('   File Size:', `${result.metadata.fileSize} bytes`);
    console.log('   File URL:', result.fileUrl);
    console.log('   Status:', result.status);
    console.log('   Created At:', result.createdAt);
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
testUploadDocument();
