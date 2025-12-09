/**
 * API Server Entry Point
 * Inicializa todas las dependencias y arranca el servidor Express
 */

const createApp = require('./app');
const config = require('../../infrastructure/config/env.config');

// Database connections
const {
  connectPostgreSQL,
} = require('../../infrastructure/persistence/postgres/config/sequelize.config');
const { connectMongoDB } = require('../../infrastructure/persistence/mongo/config/mongoose.config');
const { connectRedis } = require('../../infrastructure/config/redis.config');

// Repositories
const UserRepository = require('../../infrastructure/persistence/postgres/repositories/UserRepository');
const DocumentRepository = require('../../infrastructure/persistence/mongo/repositories/DocumentRepository');
const ResourceRepository = require('../../infrastructure/persistence/mongo/repositories/ResourceRepository');
const ScenarioRepository = require('../../infrastructure/persistence/mongo/repositories/ScenarioRepository');
const AppointmentRepository = require('../../infrastructure/persistence/postgres/repositories/AppointmentRepository');
const SimulationMetricsRepository = require('../../infrastructure/persistence/mongo/repositories/SimulationMetricsRepository');
const ConversationRepository = require('../../infrastructure/persistence/mongo/repositories/ConversationRepository');

// Services
const AuthService = require('../../infrastructure/external-services/auth/AuthService');
const NotificationService = require('../../infrastructure/external-services/email/NotificationService');
const AzureBlobService = require('../../infrastructure/external-services/azure/AzureBlobService');
const GoogleVisionService = require('../../infrastructure/external-services/ocr/GoogleVisionService');
const MQTTService = require('../../infrastructure/external-services/iot/MQTTService');
const DropoutPredictionService = require('../../infrastructure/external-services/ml/DropoutPredictionService');
const ReportGeneratorService = require('../../infrastructure/external-services/reports/ReportGeneratorService');
const GeminiService = require('../../infrastructure/external-services/gemini/GeminiService');
const ContextBuilderService = require('../../infrastructure/external-services/chatbot/ContextBuilderService');

// Use Cases - Auth
const RegisterUseCase = require('../../application/use-cases/auth/Register.usecase');
const LoginUseCase = require('../../application/use-cases/auth/Login.usecase');
const RecoverPasswordUseCase = require('../../application/use-cases/auth/RecoverPassword.usecase');
const ResetPasswordUseCase = require('../../application/use-cases/auth/ResetPassword.usecase');
const RefreshTokenUseCase = require('../../application/use-cases/auth/RefreshToken.usecase');

// Use Cases - Documents
const UploadDocumentUseCase = require('../../application/use-cases/documents/UploadDocument.usecase');
const ValidateDocumentUseCase = require('../../application/use-cases/documents/ValidateDocument.usecase');
const SearchDocumentsUseCase = require('../../application/use-cases/documents/SearchDocuments.usecase');
const ApproveDocumentUseCase = require('../../application/use-cases/documents/ApproveDocument.usecase');
const RejectDocumentUseCase = require('../../application/use-cases/documents/RejectDocument.usecase');
const GetUsersUseCase = require('../../application/use-cases/users/GetUsers.usecase');

// Use Cases - Library
const SearchResourcesUseCase = require('../../application/use-cases/library/SearchResources.usecase');
const GetResourceDetailsUseCase = require('../../application/use-cases/library/GetResourceDetails.usecase');
const RecommendResourcesUseCase = require('../../application/use-cases/library/RecommendResources.usecase');
const TrackResourceUsageUseCase = require('../../application/use-cases/library/TrackResourceUsage.usecase');
const UploadResourceUseCase = require('../../application/use-cases/library/UploadResource.usecase');

// Use Cases - Simulations
const GetScenariosUseCase = require('../../application/use-cases/simulations/GetScenarios.usecase');
const CreateScenarioUseCase = require('../../application/use-cases/simulations/CreateScenario.usecase');
const ExecuteSimulationUseCase = require('../../application/use-cases/simulations/ExecuteSimulation.usecase');
const RecordMetricsUseCase = require('../../application/use-cases/simulations/RecordMetrics.usecase');
const GetUserMetricsUseCase = require('../../application/use-cases/simulations/GetUserMetrics.usecase');
const ConnectIoTDeviceUseCase = require('../../application/use-cases/simulations/ConnectIoTDevice.usecase');

// Use Cases - Telehealth
const ScheduleAppointmentUseCase = require('../../application/use-cases/telehealth/ScheduleAppointment.usecase');
const GetAppointmentsUseCase = require('../../application/use-cases/telehealth/GetAppointments.usecase');
const GetAppointmentDetailsUseCase = require('../../application/use-cases/telehealth/GetAppointmentDetails.usecase');
const UpdateAppointmentStatusUseCase = require('../../application/use-cases/telehealth/UpdateAppointmentStatus.usecase');
const CancelAppointmentUseCase = require('../../application/use-cases/telehealth/CancelAppointment.usecase');
const CheckAvailabilityUseCase = require('../../application/use-cases/telehealth/CheckAvailability.usecase');
const GetUpcomingAppointmentsUseCase = require('../../application/use-cases/telehealth/GetUpcomingAppointments.usecase');
const RecordSessionUseCase = require('../../application/use-cases/telehealth/RecordSession.usecase');

// Use Cases - Analytics
const GetDashboardDataUseCase = require('../../application/use-cases/analytics/GetDashboardData.usecase');
const GetComparativeDataUseCase = require('../../application/use-cases/analytics/GetComparativeData.usecase');
const GenerateReportUseCase = require('../../application/use-cases/analytics/GenerateReport.usecase');
const PredictDropoutRiskUseCase = require('../../application/use-cases/analytics/PredictDropoutRisk.usecase');
const GetAlertsUseCase = require('../../application/use-cases/analytics/GetAlerts.usecase');

// Use Cases - Chatbot
const ProcessMessageUseCase = require('../../application/use-cases/chatbot/ProcessMessage.usecase');
const GetContextualInfoUseCase = require('../../application/use-cases/chatbot/GetContextualInfo.usecase');
const EscalateToHumanUseCase = require('../../application/use-cases/chatbot/EscalateToHuman.usecase');

// Controllers
const AuthController = require('./controllers/AuthController');
const DocumentsController = require('./controllers/DocumentsController');
const LibraryController = require('./controllers/LibraryController');
const SimulationsController = require('./controllers/SimulationsController');
const TelehealthController = require('./controllers/TelehealthController');
const AnalyticsController = require('./controllers/AnalyticsController');
const ChatbotController = require('./controllers/ChatbotController');
const UsersController = require('./controllers/UsersController');

// Event Bus
const EventBus = require('../../infrastructure/messaging/EventBus');

/**
 * Inicializar todas las dependencias con Dependency Injection
 */
const initializeDependencies = () => {
  // ============================================
  // REPOSITORIES
  // ============================================
  const userRepository = new UserRepository();
  const documentRepository = new DocumentRepository();
  const resourceRepository = new ResourceRepository();
  const scenarioRepository = new ScenarioRepository();
  const appointmentRepository = new AppointmentRepository();
  const simulationMetricsRepository = new SimulationMetricsRepository();
  const conversationRepository = new ConversationRepository();

  // ============================================
  // SERVICES
  // ============================================
  const authService = new AuthService();
  const notificationService = new NotificationService();
  const fileService = new AzureBlobService();
  const ocrService = new GoogleVisionService();
  const mqttService = new MQTTService();
  const dropoutPredictionService = new DropoutPredictionService();
  const reportGeneratorService = new ReportGeneratorService();
  const geminiService = new GeminiService();
  const contextBuilderService = new ContextBuilderService({
    userRepository,
    documentRepository,
    resourceRepository,
    appointmentRepository,
    scenarioRepository,
  });

  // ============================================
  // EVENT BUS
  // ============================================
  const eventBus = EventBus.getInstance();

  // ============================================
  // USE CASES - AUTH
  // ============================================
  const authDependencies = {
    userRepository,
    authService,
    notificationService,
    eventBus,
  };

  const registerUseCase = new RegisterUseCase(authDependencies);
  const loginUseCase = new LoginUseCase(authDependencies);
  const recoverPasswordUseCase = new RecoverPasswordUseCase(authDependencies);
  const resetPasswordUseCase = new ResetPasswordUseCase(authDependencies);
  const refreshTokenUseCase = new RefreshTokenUseCase(authDependencies);

  // ============================================
  // USE CASES - DOCUMENTS
  // ============================================
  const uploadDocumentUseCase = new UploadDocumentUseCase({
    documentRepository,
    fileService,
    eventBus,
  });

  const validateDocumentUseCase = new ValidateDocumentUseCase({
    documentRepository,
    ocrService,
    eventBus,
  });

  const searchDocumentsUseCase = new SearchDocumentsUseCase({
    documentRepository,
  });

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

  const getUsersUseCase = new GetUsersUseCase({
    userRepository,
  });

  // ============================================
  // USE CASES - LIBRARY
  // ============================================
  const searchResourcesUseCase = new SearchResourcesUseCase({
    resourceRepository,
  });

  const getResourceDetailsUseCase = new GetResourceDetailsUseCase({
    resourceRepository,
  });

  const recommendResourcesUseCase = new RecommendResourcesUseCase({
    resourceRepository,
  });

  const trackResourceUsageUseCase = new TrackResourceUsageUseCase({
    resourceRepository,
  });

  const uploadResourceUseCase = new UploadResourceUseCase({
    resourceRepository,
    fileService,
  });

  // ============================================
  // USE CASES - SIMULATIONS
  // ============================================
  const getScenariosUseCase = new GetScenariosUseCase({ scenarioRepository });

  const createScenarioUseCase = new CreateScenarioUseCase({
    scenarioRepository,
    fileService,
  });

  const executeSimulationUseCase = new ExecuteSimulationUseCase({
    scenarioRepository,
  });

  const recordMetricsUseCase = new RecordMetricsUseCase({
    scenarioRepository,
  });
  const getUserMetricsUseCase = new GetUserMetricsUseCase({
    simulationMetricsRepository,
  });

  const connectIoTDeviceUseCase = new ConnectIoTDeviceUseCase({
    mqttService,
  });

  // ============================================
  // USE CASES - TELEHEALTH
  // ============================================
  const scheduleAppointmentUseCase = new ScheduleAppointmentUseCase({
    appointmentRepository,
    userRepository,
    notificationService,
    eventBus,
  });

  const getAppointmentsUseCase = new GetAppointmentsUseCase({
    appointmentRepository,
  });

  const getAppointmentDetailsUseCase = new GetAppointmentDetailsUseCase({
    appointmentRepository,
  });

  const updateAppointmentStatusUseCase = new UpdateAppointmentStatusUseCase({
    appointmentRepository,
    notificationService,
    eventBus,
  });

  const cancelAppointmentUseCase = new CancelAppointmentUseCase({
    appointmentRepository,
    notificationService,
    eventBus,
  });

  const checkAvailabilityUseCase = new CheckAvailabilityUseCase({
    appointmentRepository,
    userRepository,
  });

  const getUpcomingAppointmentsUseCase = new GetUpcomingAppointmentsUseCase({
    appointmentRepository,
  });

  const recordSessionUseCase = new RecordSessionUseCase({
    appointmentRepository,
    fileService,
  });

  // ============================================
  // USE CASES - ANALYTICS
  // ============================================
  const getDashboardDataUseCase = new GetDashboardDataUseCase({
    userRepository,
    documentRepository,
    resourceRepository,
    appointmentRepository,
    scenarioRepository,
    simulationMetricsRepository,
  });

  const getComparativeDataUseCase = new GetComparativeDataUseCase({
    userRepository,
    appointmentRepository,
    simulationMetricsRepository,
  });

  const generateReportUseCase = new GenerateReportUseCase({
    reportGeneratorService,
    userRepository,
    documentRepository,
    resourceRepository,
    appointmentRepository,
    simulationMetricsRepository,
  });

  const predictDropoutRiskUseCase = new PredictDropoutRiskUseCase({
    dropoutPredictionService,
    userRepository,
    appointmentRepository,
    simulationMetricsRepository,
    resourceRepository,
    conversationRepository,
  });

  const getAlertsUseCase = new GetAlertsUseCase({
    userRepository,
    documentRepository,
    appointmentRepository,
    simulationMetricsRepository,
  });

  // ============================================
  // USE CASES - CHATBOT
  // ============================================
  const processMessageUseCase = new ProcessMessageUseCase({
    conversationRepository,
    geminiService,
    contextBuilderService,
    documentRepository,
    appointmentRepository,
    resourceRepository,
    scenarioRepository,
    eventBus,
  });

  const getContextualInfoUseCase = new GetContextualInfoUseCase({
    contextBuilderService,
  });

  const escalateToHumanUseCase = new EscalateToHumanUseCase({
    conversationRepository,
    notificationService,
    eventBus,
  });

  // ============================================
  // CONTROLLERS
  // ============================================
  const authController = new AuthController({
    registerUseCase,
    loginUseCase,
    recoverPasswordUseCase,
    resetPasswordUseCase,
    refreshTokenUseCase,
    userRepository,
  });

  const documentsController = new DocumentsController({
    uploadDocumentUseCase,
    validateDocumentUseCase,
    searchDocumentsUseCase,
    approveDocumentUseCase,
    rejectDocumentUseCase,
    documentRepository,
  });

  const usersController = new UsersController({
    getUsersUseCase,
  });

  const libraryController = new LibraryController({
    searchResourcesUseCase,
    getResourceDetailsUseCase,
    recommendResourcesUseCase,
    trackResourceUsageUseCase,
    uploadResourceUseCase,
    resourceRepository,
  });

  const simulationsController = new SimulationsController({
    getScenariosUseCase,
    createScenarioUseCase,
    executeSimulationUseCase,
    recordMetricsUseCase,
    getUserMetricsUseCase,
    connectIoTDeviceUseCase,
    scenarioRepository,
  });

  const telehealthController = new TelehealthController({
    scheduleAppointmentUseCase,
    getAppointmentsUseCase,
    getAppointmentDetailsUseCase,
    updateAppointmentStatusUseCase,
    cancelAppointmentUseCase,
    checkAvailabilityUseCase,
    getUpcomingAppointmentsUseCase,
    recordSessionUseCase,
    appointmentRepository,
  });

  const analyticsController = new AnalyticsController({
    getDashboardDataUseCase,
    getComparativeDataUseCase,
    generateReportUseCase,
    predictDropoutRiskUseCase,
    getAlertsUseCase,
    reportGeneratorService,
  });

  const chatbotController = new ChatbotController({
    processMessageUseCase,
    getContextualInfoUseCase,
    escalateToHumanUseCase,
    conversationRepository,
  });

  // AGREGAR ESTE LOG
  console.log('✅ AnalyticsController created:', typeof analyticsController);

  // Retornar todos los controllers
  return {
    authController,
    documentsController,
    usersController,
    libraryController,
    simulationsController,
    telehealthController,
    analyticsController,
    chatbotController,
  };
};

/**
 * Iniciar el servidor
 */
const startServer = async () => {
  try {
    console.log('🚀 Starting Smart Campus API...\n');

    // ============================================
    // CONECTAR A BASES DE DATOS
    // ============================================
    console.log('📦 Connecting to databases...');
    await connectPostgreSQL();
    await connectMongoDB();
    await connectRedis();

    console.log('✅ All databases connected\n');

    // ============================================
    // INICIALIZAR DEPENDENCIAS
    // ============================================
    console.log('🔧 Initializing dependencies...');
    const controllers = initializeDependencies();
    console.log('✅ Dependencies initialized\n');

    // ============================================
    // CREAR APLICACIÓN EXPRESS
    // ============================================
    const app = createApp(controllers);

    // ============================================
    // INICIAR SERVIDOR
    // ============================================
    const PORT = config.server.port || 3000;
    const HOST = config.server.host || '0.0.0.0';

    const server = app.listen(PORT, HOST, () => {
      console.log('='.repeat(60));
      console.log('🎉 SMART CAMPUS API IS RUNNING');
      console.log('='.repeat(60));
      console.log(`🔧 Environment: ${config.env}`);
      console.log(`🌐 Server: http://${HOST}:${PORT}`);
      console.log(`🔗 API: http://${HOST}:${PORT}/api`);
      console.log(`💚 Health: http://${HOST}:${PORT}/api/health`);
      console.log('='.repeat(60));
      console.log('\n📚 Available endpoints:');
      console.log('\n   AUTH MODULE:');
      console.log('   POST   /api/auth/register');
      console.log('   POST   /api/auth/login');
      console.log('   POST   /api/auth/recover-password');
      console.log('   POST   /api/auth/reset-password');
      console.log('   POST   /api/auth/refresh-token');
      console.log('   GET    /api/auth/me (protected)');
      console.log('   POST   /api/auth/logout (protected)');
      console.log('\n   DOCUMENTS MODULE:');
      console.log('   POST   /api/documents/upload (protected)');
      console.log('   GET    /api/documents (protected)');
      console.log('   GET    /api/documents/:id (protected)');
      console.log('   POST   /api/documents/:id/validate (admin)');
      console.log('   POST   /api/documents/:id/approve (admin)');
      console.log('   POST   /api/documents/:id/reject (admin)');
      console.log('   DELETE /api/documents/:id (protected)');
      console.log('\n   USERS MODULE:');
      console.log('   GET    /api/users (admin/administrative)');
      console.log('\n   LIBRARY MODULE:');
      console.log('   GET    /api/library/resources (protected)');
      console.log('   GET    /api/library/resources/:id (protected)');
      console.log('   GET    /api/library/popular (protected)');
      console.log('   GET    /api/library/recommendations (protected)');
      console.log('   POST   /api/library/resources/upload (admin/teacher)');
      console.log('   POST   /api/library/resources/:id/track (protected)');
      console.log('   DELETE /api/library/resources/:id (protected)');
      console.log('\n   SIMULATIONS MODULE:');
      console.log('   GET    /api/simulations/scenarios (protected)');
      console.log('   GET    /api/simulations/scenarios/public (protected)');
      console.log('   GET    /api/simulations/scenarios/:id (protected)');
      console.log('   POST   /api/simulations/scenarios (teacher/admin)');
      console.log('   POST   /api/simulations/scenarios/:id/execute (protected)');
      console.log('   POST   /api/simulations/metrics (protected)');
      console.log('   GET    /api/simulations/metrics/my-history (protected)');
      console.log('   POST   /api/simulations/iot/connect (protected)');
      console.log('   DELETE /api/simulations/scenarios/:id (protected)');
      console.log('\n   TELEHEALTH MODULE:');
      console.log('   POST   /api/telehealth/appointments (protected)');
      console.log('   GET    /api/telehealth/appointments (protected)');
      console.log('   GET    /api/telehealth/appointments/upcoming (protected)');
      console.log('   GET    /api/telehealth/appointments/:id/details (protected)');
      console.log('   GET    /api/telehealth/appointments/:id (protected)');
      console.log('   PATCH  /api/telehealth/appointments/:id/status (protected)');
      console.log('   DELETE /api/telehealth/appointments/:id (protected)');
      console.log('   POST   /api/telehealth/availability/check (protected)');
      console.log('   POST   /api/telehealth/appointments/:id/recording (protected)');
      console.log('\n   ANALYTICS MODULE:');
      console.log('   GET    /api/analytics/dashboard (protected)');
      console.log('   GET    /api/analytics/comparative (admin)');
      console.log('   POST   /api/analytics/reports/generate (teacher/admin)');
      console.log('   GET    /api/analytics/reports (teacher/admin)');
      console.log('   GET    /api/analytics/reports/:fileName/download (teacher/admin)');
      console.log('   DELETE /api/analytics/reports/:fileName (admin)');
      console.log('   POST   /api/analytics/predictions/dropout-risk (teacher/admin)');
      console.log('   GET    /api/analytics/alerts (admin)');
      console.log('\n   CHATBOT MODULE:');
      console.log('   POST   /api/chatbot/message (protected)');
      console.log('   GET    /api/chatbot/conversations (protected)');
      console.log('   GET    /api/chatbot/conversations/:id (protected)');
      console.log('   POST   /api/chatbot/escalate (protected)');
      console.log('   DELETE /api/chatbot/conversations/:id (protected)');
      console.log('   GET    /api/chatbot/context (protected)');
      console.log('='.repeat(60));
      console.log('\n✨ Ready to accept requests!\n');
    });

    // ============================================
    // MANEJO DE CIERRE GRACEFUL
    // ============================================
    const gracefulShutdown = async (signal) => {
      console.log(`\n\n⚠️  ${signal} received. Closing server gracefully...`);

      server.close(async () => {
        console.log('🔌 HTTP server closed');

        try {
          // Cerrar conexiones de bases de datos
          const {
            sequelize,
            // eslint-disable-next-line global-require
          } = require('../../infrastructure/persistence/postgres/config/sequelize.config');
          const {
            mongoose,
            // eslint-disable-next-line global-require
          } = require('../../infrastructure/persistence/mongo/config/mongoose.config');
          // eslint-disable-next-line global-require
          const { redisClient } = require('../../infrastructure/config/redis.config');

          await sequelize.close();
          console.log('✅ PostgreSQL connection closed');

          await mongoose.connection.close();
          console.log('✅ MongoDB connection closed');

          await redisClient.quit();
          console.log('✅ Redis connection closed');

          console.log('👋 Goodbye!\n');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Escuchar señales de terminación
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

// Iniciar servidor si este archivo es ejecutado directamente
if (require.main === module) {
  startServer();
}

// Exportar para testing
module.exports = { startServer, initializeDependencies, createApp };
