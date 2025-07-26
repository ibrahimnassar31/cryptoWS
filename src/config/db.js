import mongoose from 'mongoose';
import { MONGODB_URI } from '../constants/index.js';
import logger from '../utils/logger.js';


export const dbStatus = {
  isConnected: false,
  lastError: null,
  connectionAttempts: 0,
  maxRetries: 5
};


const validateMongoURI = (uri) => {
  if (!uri) return false;

  const validPattern = /^mongodb(\+srv)?:\/\/.+/i;
  return validPattern.test(uri);
};


const connectDB = async (retryAttempt = 0) => {
  try {
    if (!validateMongoURI(MONGODB_URI)) {
      throw new Error('Invalid MongoDB URI format. Please check your MONGODB_URI environment variable.');
    }

    dbStatus.connectionAttempts++;

    logger.info(`Attempting to connect to MongoDB (attempt ${dbStatus.connectionAttempts})...`);

    const options = {
      autoIndex: process.env.NODE_ENV === 'development', 
      serverSelectionTimeoutMS: 10000, 
      socketTimeoutMS: 45000, 
      family: 4,
      maxPoolSize: 10, 
      heartbeatFrequencyMS: 30000,
    };

    const connectionURI = MONGODB_URI;

    if (!connectionURI) {
      throw new Error('MONGODB_URI is not defined. Please check your environment variables.');
    }

    try {
      const sanitizedUri = connectionURI.includes('@') 
        ? connectionURI.split('@').pop() 
        : connectionURI.split('//').pop().split('/')[0];
      logger.info(`Connecting to MongoDB at: ${sanitizedUri}`);
    } catch (error) {
      logger.info('Connecting to MongoDB with a URI that could not be parsed for logging');
    }

    const conn = await mongoose.connect(connectionURI, options);

    dbStatus.isConnected = true;
    dbStatus.lastError = null;

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      dbStatus.isConnected = false;
      dbStatus.lastError = err;
      logger.error('MongoDB connection error:', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      dbStatus.isConnected = false;
      logger.warn('MongoDB disconnected. Will attempt to reconnect automatically.');
    });

    mongoose.connection.on('reconnected', () => {
      dbStatus.isConnected = true;
      logger.info('MongoDB reconnected successfully');
    });

    return true;

  } catch (error) {
    dbStatus.isConnected = false;
    dbStatus.lastError = error;

    logger.error('MongoDB connection failed:', { 
      error: error.message,
      attempt: retryAttempt + 1,
      maxRetries: dbStatus.maxRetries
    });

    if (retryAttempt < dbStatus.maxRetries) {
      const retryDelayMs = Math.min(1000 * (2 ** retryAttempt), 30000); 

      logger.info(`Retrying database connection in ${retryDelayMs/1000} seconds...`);

      return new Promise(resolve => {
        setTimeout(async () => {
          const result = await connectDB(retryAttempt + 1);
          resolve(result);
        }, retryDelayMs);
      });
    }

    logger.error(`Failed to connect to MongoDB after ${dbStatus.maxRetries} attempts.`);
    logger.warn('Application continuing without database connection. Some features will be unavailable.');

    if (process.env.NODE_ENV === 'production') {
      logger.error('CRITICAL: Production database connection failed');
    }

    return false;
  }
};


export const retryDatabaseConnection = async () => {
  logger.info('Manual database connection retry initiated');

  dbStatus.connectionAttempts = 0;

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  return await connectDB();
};


export const checkDatabaseHealth = () => {
  return {
    status: dbStatus.isConnected ? 'up' : 'down',
    readyState: mongoose.connection.readyState,
    connectionAttempts: dbStatus.connectionAttempts,
    lastError: dbStatus.lastError ? dbStatus.lastError.message : null
  };
};

export default connectDB;