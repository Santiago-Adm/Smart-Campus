/**
 * Test: Approve & Reject Document Use Cases
 * Prueba la aprobación y rechazo de documentos
 */

require('dotenv').config();

// Repositories
const DocumentRepository = require('./src/infrastructure/persistence/mongo/repositories/DocumentRepository');

// Services
const NotificationService = require('./src/infrastructure/external-services/email/NotificationService');

// Use Cases
const ApproveDocumentUseCase = require('./src/application/use-cases/documents/ApproveDocument.usecase');
const RejectDocumentUseCase = require('./src/application/use-cases/documents/RejectDocument.usecase');

// Event Bus
const EventBus = require('./src/infrastructure/messaging/EventBus');

// MongoDB Connection
const { connectMongoDB } = require('./src/infrastructure/persistence/mongo/config/mongoose.config');

async function testApproveReject() {
  try {
    console.log('🧪 TEST: Approve & Reject Document Use Cases\n');

    // 1. Conectar a MongoDB
    console.log('📦 Connecting to MongoDB...');
    await connectMongoDB();
    console.log('✅ MongoDB connected\n');

    // 2. Inicializar dependencias
    console.log('🔧 Initializing dependencies...');
    const documentRepository = new DocumentRepository();
    const notificationService = new NotificationService();
    const eventBus = EventBus.getInstance();

    const approveDocumentUseCase = new ApproveDocumentUseCase({
      documentRepository,
      notificationService,
      eventBus,
    });

    const rejectDocumentUseCase = new RejectDocumentUseCase({
      documentRepository,
      notificationService,
      eventBus,
    });
    console.log('✅ Dependencies initialized\n');

    // 3. Buscar documentos en revisión
    console.log('🔍 Looking for documents in review...');
    const filters = { status: 'IN_REVIEW', limit: 2 };
    const docsInReview = await documentRepository.findByFilters(filters);

    if (docsInReview.documents.length === 0) {
      console.log('⚠️  No documents in review found.');
      console.log('   Please run test-validate-document.js first');
      process.exit(0);
    }

    // 4. TEST 1: Aprobar documento
    if (docsInReview.documents.length > 0) {
      const docToApprove = docsInReview.documents[0];
      console.log('\n✅ TEST 1: Approve Document');
      console.log('   Document ID:', docToApprove.id);
      console.log('   Type:', docToApprove.metadata.type);
      console.log();

      const approveResult = await approveDocumentUseCase.execute({
        documentId: docToApprove.id,
        approvedBy: '123e4567-e89b-12d3-a456-426614174000', // Admin mock
        notes: 'Documento validado correctamente. Aprobado para procesamiento.',
      });

      console.log('═'.repeat(60));
      console.log('✅ APPROVE TEST - SUCCESS');
      console.log('═'.repeat(60));
      console.log('\n   Document ID:', approveResult.id);
      console.log('   New Status:', approveResult.status);
      console.log('   Review Notes:', approveResult.reviewNotes);
      console.log('   Reviewed By:', approveResult.reviewedBy);
      console.log('   Reviewed At:', new Date(approveResult.reviewedAt).toLocaleString());
      console.log(`\n${'═'.repeat(60)}`);
    }

    // 5. TEST 2: Rechazar documento
    if (docsInReview.documents.length > 1) {
      const docToReject = docsInReview.documents[1];
      console.log('\n❌ TEST 2: Reject Document');
      console.log('   Document ID:', docToReject.id);
      console.log('   Type:', docToReject.metadata.type);
      console.log();

      const rejectResult = await rejectDocumentUseCase.execute({
        documentId: docToReject.id,
        rejectedBy: '123e4567-e89b-12d3-a456-426614174000', // Admin mock
        reason:
          'Documento ilegible. La imagen está borrosa y no se pueden leer los datos claramente. Por favor, suba una nueva imagen con mejor calidad.',
      });

      console.log('═'.repeat(60));
      console.log('❌ REJECT TEST - SUCCESS');
      console.log('═'.repeat(60));
      console.log('\n   Document ID:', rejectResult.id);
      console.log('   New Status:', rejectResult.status);
      console.log('   Rejection Reason:', rejectResult.reviewNotes);
      console.log('   Reviewed By:', rejectResult.reviewedBy);
      console.log('   Reviewed At:', new Date(rejectResult.reviewedAt).toLocaleString());
      console.log(`\n${'═'.repeat(60)}`);
    }

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
testApproveReject();
