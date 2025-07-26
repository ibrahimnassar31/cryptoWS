import { checkDatabaseHealth, retryDatabaseConnection } from '../config/db.js';
import redisClient from '../config/redis.js';
import logger from '../utils/logger.js';
import os from 'os';

/**
 * Service for checking application health and status
 */
class HealthService {
  /**
   * Check overall system health
   * @returns {Object} Health status of all components
   */
  static async getSystemHealth() {
    const dbHealth = HealthService.getDatabaseHealth();
    const redisHealth = await HealthService.getRedisHealth();
    const systemInfo = HealthService.getSystemInfo();

    const isHealthy = dbHealth.status === 'up' && redisHealth.status === 'up';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      components: {
        database: dbHealth,
        redis: redisHealth,
        system: systemInfo
      }
    };
  }

  /**
   * Get database health status
   * @returns {Object} Database health information
   */
  static getDatabaseHealth() {
    const health = checkDatabaseHealth();
    return health;
  }

  /**
   * Get Redis health status
   * @returns {Promise<Object>} Redis health information
   */
  static async getRedisHealth() {
    try {
      // Check if Redis client is open
      const isConnected = redisClient.isOpen;

      // Try a simple ping operation if connected
      let pingResult = false;
      if (isConnected) {
        try {
          // Set a short timeout for the ping operation
          const pingPromise = redisClient.ping();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Redis ping timeout')), 1000);
          });

          // Race the ping against the timeout
          await Promise.race([pingPromise, timeoutPromise]);
          pingResult = true;
        } catch (err) {
          logger.warn('Redis ping failed:', { error: err.message });
          pingResult = false;
        }
      }

      return {
        status: isConnected && pingResult ? 'up' : 'down',
        connected: isConnected,
        pingSuccess: pingResult
      };
    } catch (error) {
      logger.error('Redis health check error:', { error: error.message });
      return {
        status: 'down',
        error: error.message,
        connected: false,
        pingSuccess: false
      };
    }
  }

  /**
   * Get system information
   * @returns {Object} System metrics and information
   */
  static getSystemInfo() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      uptime: process.uptime(),
      nodeVersion: process.version,
      memory: {
        total: Math.round(totalMem / 1024 / 1024) + 'MB',
        free: Math.round(freeMem / 1024 / 1024) + 'MB',
        used: Math.round(usedMem / 1024 / 1024) + 'MB',
        percentUsed: Math.round((usedMem / totalMem) * 100) + '%'
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0].model,
        loadAvg: os.loadavg()
      }
    };
  }

  /**
   * Retry database connection manually
   * @returns {Promise<Object>} Connection attempt result
   */
  static async retryDatabaseConnection() {
    logger.info('Manual database connection retry requested');

    try {
      const result = await retryDatabaseConnection();
      return {
        success: result,
        message: result ? 'Database connection successful' : 'Database connection failed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error during manual database connection retry:', { error: error.message });
      return {
        success: false,
        message: 'Error during connection retry: ' + error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default HealthService;
