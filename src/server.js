import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB, { dbStatus } from './config/db.js'; 
import { initWebSocketServer } from './websocket/wsServer.js';
import { connectRedis } from './config/redis.js';
import redisClient from './config/redis.js';
import logger from './utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DB_REQUIRED = process.env.DB_REQUIRED === 'true' || false; 


const startServer = async () => {
  try {
    logger.info('Starting CryptoExpress API server...');
    logger.info(`Environment: ${NODE_ENV}`);

    const dbConnected = await connectDB();

    if (DB_REQUIRED && !dbConnected) {
      logger.error('Database connection required but failed. Exiting application.');
      process.exit(1);
    }

    try {
      await connectRedis();
      logger.info('Redis connected successfully.');
    } catch (redisError) {
      logger.error('Redis connection error:', { error: redisError.message });
      logger.warn('Continuing without Redis connection. Some features might be limited.');
    }

    const server = http.createServer(app);

    try {
      initWebSocketServer(server);
      logger.info('WebSocket server initialized.');
    } catch (wsError) {
      logger.error('WebSocket server initialization error:', { error: wsError.message });
      logger.warn('Continuing without WebSocket functionality.');
    }

    server.listen(PORT, () => {
      logger.info(`=== CryptoExpress API ===`);
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`Database Status: ${dbStatus.isConnected ? 'Connected' : 'Disconnected'}`);
      logger.info(`===========================`);
    });

    const handleShutdown = async () => {
      logger.info('Shutdown signal received. Closing server gracefully...');

      server.close(async () => {
        logger.info('HTTP server closed.');

        
        if (mongoose && mongoose.connection && mongoose.connection.readyState !== 0) {
          logger.info('Closing database connections...');
          try {
            await mongoose.connection.close();
            logger.info('Database connections closed.');
          } catch (err) {
            logger.error('Error closing database connection:', { error: err.message });
          }
        }

        if (redisClient && typeof redisClient.quit === 'function') {
          logger.info('Closing Redis connections...');
          try {
            await redisClient.quit();
            logger.info('Redis connections closed.');
          } catch (err) {
            logger.error('Error closing Redis connection:', { error: err.message });
          }
        }

        logger.info('Shutdown complete.');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forcing exit after 10s timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', handleShutdown);
    process.on('SIGINT', handleShutdown);
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', { error: error.stack });
      handleShutdown();
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection:', { reason });
      handleShutdown();
    });

  } catch (error) {
    logger.error('Failed to start server:', { error: error.stack });
    process.exit(1);
  }
};

// Start the server
startServer().catch(error => {
  logger.error('Top-level startup error:', { error: error.stack });
  process.exit(1);
});
