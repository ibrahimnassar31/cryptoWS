import mongoose from 'mongoose';
import redisClient from '../config/redis.js';
import logger from '../utils/logger.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import HealthService from '../services/healthService.js';
import { dbStatus, retryDatabaseConnection } from '../config/db.js';

/**
 * Get overall health status of the system
 * @route GET /api/health
 */
export const getHealthStatus = async (req, res, next) => {
  try {
    // Get health status from service
    const health = await HealthService.getSystemHealth();

    // Set appropriate status code based on health
    const statusCode = health.status === 'healthy' ? 200 : 503;

    // Return simplified response for standard health check
    const response = {
      status: health.status === 'healthy' ? 'ok' : 'error',
      db: health.components.database.status,
      redis: health.components.redis.status,
      timestamp: health.timestamp
    };

    // Log health status issue if not healthy
    if (response.status !== 'ok') {
      logger.warn('Health check failed:', response);
    }

    res.status(statusCode).json(response);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Health check failed',
      error: error.message
    });
  }
};

/**
 * Get detailed health information
 * @route GET /api/health/details
 */
export const getHealthDetails = async (req, res, next) => {
  try {
    const health = await HealthService.getSystemHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    next(new ApiError('Health check failed', 500));
  }
};

/**
 * Retry database connection
 * @route POST /api/health/retry-db-connection
 */
export const retryDbConnection = async (req, res, next) => {
  try {
    logger.info('Manual database connection retry requested');

    // Check current db status
    const beforeStatus = {
      connected: dbStatus.isConnected,
      attempts: dbStatus.connectionAttempts,
      lastError: dbStatus.lastError ? dbStatus.lastError.message : null
    };

    // Attempt to reconnect
    const success = await retryDatabaseConnection();

    // Get new status
    const afterStatus = {
      connected: dbStatus.isConnected,
      attempts: dbStatus.connectionAttempts,
      lastError: dbStatus.lastError ? dbStatus.lastError.message : null
    };

    res.status(success ? 200 : 503).json({
      success,
      message: success ? 'Database connection restored' : 'Database connection failed',
      before: beforeStatus,
      after: afterStatus
    });
  } catch (error) {
    logger.error('Database retry error:', error);
    next(new ApiError('Database retry failed', 500));
  }
};

/**
 * Get database specific health info
 * @route GET /api/health/db
 */
export const getDatabaseHealth = (req, res, next) => {
  try {
    const dbHealth = HealthService.getDatabaseHealth();
    const statusCode = dbHealth.status === 'up' ? 200 : 503;
    res.status(statusCode).json(dbHealth);
  } catch (error) {
    next(new ApiError('Database health check failed', 500));
  }
};

/**
 * Get Redis specific health info
 * @route GET /api/health/redis
 */
export const getRedisHealth = async (req, res, next) => {
  try {
    const redisHealth = await HealthService.getRedisHealth();
    const statusCode = redisHealth.status === 'up' ? 200 : 503;
    res.status(statusCode).json(redisHealth);
  } catch (error) {
    next(new ApiError('Redis health check failed', 500));
  }
};
