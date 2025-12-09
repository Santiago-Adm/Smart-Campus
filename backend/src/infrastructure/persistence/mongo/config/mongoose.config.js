/**
 * Configuración de Mongoose (MongoDB ODM)
 */

const mongoose = require('mongoose');
const config = require('../../../config/env.config');

/**
 * Función para conectar a MongoDB
 */
const connectMongoDB = async () => {
  try {
    await mongoose.connect(config.mongo.uri, config.mongo.options);

    console.log('✅ MongoDB connection established successfully');
    console.log(`📌 Connected to database: ${mongoose.connection.name}`);

    // Event listeners
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
  } catch (error) {
    console.error('❌ Unable to connect to MongoDB:', error.message);
    throw error;
  }
};

/**
 * Función para cerrar conexión (para testing o shutdown)
 */
const closeMongoDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error.message);
    throw error;
  }
};

module.exports = {
  connectMongoDB,
  closeMongoDB,
  mongoose,
};