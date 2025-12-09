/**
 * Configuración centralizada de variables de entorno
 * Este archivo valida y exporta todas las variables de entorno necesarias
 */

require('dotenv').config();

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'MONGO_URI',
  'REDIS_HOST',
  'REDIS_PORT',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

// Validar que todas las variables requeridas existan
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(
    `⚠️  Missing environment variables: ${missingVars.join(', ')}\n` +
      'Using default values for development'
  );
}

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',

  // Server (NUEVA ESTRUCTURA)
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    host: process.env.HOST || '0.0.0.0',
    apiVersion: process.env.API_VERSION || 'v1',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  },

  // PostgreSQL
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    database: process.env.POSTGRES_DB || 'smart_campus',
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres123',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  // MongoDB
  mongo: {
    uri:
      process.env.MONGO_URI ||
      'mongodb://admin:admin123@localhost:27017/smart_campus?authSource=admin',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || 'redis123',
    db: 0,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  },

  // JWT
  jwt: {
    accessTokenSecret:
      process.env.JWT_SECRET || 'change_this_super_secret_jwt_key_in_production_min_32_chars',
    refreshTokenSecret:
      process.env.JWT_REFRESH_SECRET || 'change_this_refresh_secret_in_production_min_32_chars',
    accessTokenExpiry: process.env.JWT_EXPIRATION || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },

  // Bcrypt
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Azure Blob Storage
  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
    containerName: process.env.AZURE_STORAGE_CONTAINER || 'documents',
  },

  // SendGrid
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.EMAIL_FROM || 'noreply@smartcampus.edu.pe',
    fromName: process.env.EMAIL_FROM_NAME || 'Smart Campus Instituto',
  },

  // Google Gemini
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },

  // Google Vision (OCR)
  googleVision: {
    apiKey: process.env.GOOGLE_VISION_API_KEY || '',
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

module.exports = config;
