/**
 * Configuración de Redis (Cache y Sesiones)
 */

const Redis = require('ioredis');
const config = require('./env.config');

// Crear cliente de Redis
const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  retryStrategy: config.redis.retryStrategy,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

/**
 * Función para conectar a Redis
 */
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connection established successfully');

    // Verificar conexión
    const pong = await redisClient.ping();
    if (pong === 'PONG') {
      console.log('✅ Redis PING successful');
    }
  } catch (error) {
    console.error('❌ Unable to connect to Redis:', error.message);
    throw error;
  }
};

/**
 * Función para cerrar conexión (para testing o shutdown)
 */
const closeRedis = async () => {
  try {
    await redisClient.quit();
    console.log('✅ Redis connection closed');
  } catch (error) {
    console.error('❌ Error closing Redis connection:', error.message);
    throw error;
  }
};

// Event listeners
redisClient.on('error', (error) => {
  console.error('❌ Redis Client Error:', error);
});

redisClient.on('ready', () => {
  console.log('✅ Redis is ready');
});

redisClient.on('reconnecting', () => {
  console.log('⚠️ Redis is reconnecting...');
});

module.exports = {
  redisClient,
  connectRedis,
  closeRedis,
};
