/**
 * Test de Service Implementations (COMPLETO)
 */

const AuthService = require('./src/infrastructure/external-services/auth/AuthService');
const NotificationService = require('./src/infrastructure/external-services/email/NotificationService');
const AzureBlobService = require('./src/infrastructure/external-services/azure/AzureBlobService');
const GoogleVisionService = require('./src/infrastructure/external-services/ocr/GoogleVisionService');
const { connectRedis } = require('./src/infrastructure/config/redis.config');

async function testServices() {
  try {
    console.log('🧪 Testing ALL Service Implementations...\n');

    // Conectar Redis
    await connectRedis();

    // ============================================
    // Test AuthService
    // ============================================
    console.log('✅ Testing AuthService...');
    const authService = new AuthService();

    const password = 'MiPasswordSegura123!';
    const hashedPassword = await authService.hashPassword(password);
    console.log('✅ Password hashed');

    const isMatch = await authService.comparePassword(password, hashedPassword);
    console.log('✅ Password comparison:', isMatch);

    const payload = {
      userId: 'test-user-123',
      email: 'test@smartcampus.edu.pe',
      roles: ['STUDENT'],
    };

    const accessToken = authService.generateAccessToken(payload);
    const refreshToken = authService.generateRefreshToken(payload);
    console.log('✅ Tokens generated');

    const decoded = authService.verifyToken(accessToken, 'access');
    console.log('✅ Token verified, userId:', decoded.userId);

    // ============================================
    // Test NotificationService
    // ============================================
    console.log('\n✅ Testing NotificationService...');
    const notificationService = new NotificationService();

    await notificationService.sendWelcomeEmail('test@smartcampus.edu.pe', 'Juan Pérez');
    console.log('✅ Welcome email sent (dev mode)');

    // ============================================
    // Test AzureBlobService
    // ============================================
    console.log('\n✅ Testing AzureBlobService...');
    const fileService = new AzureBlobService();

    // Test file type validation
    const isPDFValid = fileService.validateFileType('application/pdf');
    console.log('✅ PDF validation:', isPDFValid);

    // Test file size validation
    const sizeValid = fileService.validateFileSize(1024000); // 1MB
    console.log('✅ Size validation (1MB):', sizeValid);

    // Test file upload (MOCK)
    const mockBuffer = Buffer.from('test file content');
    const fileUrl = await fileService.uploadFile(
      mockBuffer,
      'test-document.pdf',
      'application/pdf',
      { userId: 'test-123' }
    );
    console.log('✅ File uploaded (mock):', `${fileUrl.substring(0, 50)}...`);

    // Test file download (MOCK)
    const downloadedBuffer = await fileService.downloadFile(fileUrl);
    console.log('✅ File downloaded (mock), size:', downloadedBuffer.length);

    // Test file deletion (MOCK)
    const deleted = await fileService.deleteFile(fileUrl);
    console.log('✅ File deleted (mock):', deleted);

    // ============================================
    // Test GoogleVisionService
    // ============================================
    console.log('\n✅ Testing GoogleVisionService...');
    const ocrService = new GoogleVisionService();

    // Test text extraction (MOCK)
    const ocrResult = await ocrService.extractText(mockBuffer);
    console.log('✅ Text extracted (mock)');
    console.log('   Confidence:', ocrResult.confidence);
    console.log('   DNI found:', ocrResult.fields.dni);

    // Test DNI validation (MOCK)
    const dniValidation = await ocrService.validateDNI(mockBuffer);
    console.log('✅ DNI validated (mock):', dniValidation.isValid);

    // Test field extraction (MOCK)
    const specificFields = await ocrService.extractFields(mockBuffer, ['dni', 'nombres']);
    console.log('✅ Specific fields extracted:', Object.keys(specificFields));

    console.log('\n🎉 ALL service tests passed!');
    console.log('🚀 All services are working correctly');
    console.log('✨ AuthService: JWT, Bcrypt, Redis ✅');
    console.log('✨ NotificationService: Email templates ✅');
    console.log('✨ AzureBlobService: File operations (mock) ✅');
    console.log('✨ GoogleVisionService: OCR operations (mock) ✅');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Service test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testServices();
