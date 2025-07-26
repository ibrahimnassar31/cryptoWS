import winston from 'winston';
import path from 'path';

/**
 * Logger configuration
 * Provides structured logging throughout the application
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'cryptoexpress-api' },
  transports: [
    // Write all logs with importance level 'error' or less to error.log
    new winston.transports.File({ 
      filename: path.join('logs', 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with importance level 'info' or less to combined.log
    new winston.transports.File({ 
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Handle exceptions and promise rejections
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join('logs', 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join('logs', 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
    level: 'debug'
  }));
}

// Helper methods for different log levels
export default {
  error: (message, meta = {}) => logger.error(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  info: (message, meta = {}) => logger.info(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),

  /**
   * Log HTTP request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  httpRequest: (req, res) => {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const userId = req.user ? req.user.id : 'anonymous';

    logger.info('HTTP Request', {
      method,
      url: originalUrl,
      status: res.statusCode,
      responseTime: res._responseTime,
      ip,
      userAgent,
      userId
    });
  },

  /**
   * Log API errors
   * @param {Error} err - Error object
   * @param {Object} req - Express request object
   */
  apiError: (err, req) => {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const userId = req.user ? req.user.id : 'anonymous';

    logger.error(`API Error: ${err.message}`, {
      method,
      url: originalUrl,
      ip,
      userAgent,
      userId,
      stack: err.stack,
      status: err.statusCode || 500
    });
  }
};
