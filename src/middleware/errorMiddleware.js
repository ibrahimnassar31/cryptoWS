

import { formatErrorResponse } from '../utils/index.js';
import logger from '../utils/logger.js';


export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}


export const notFoundMiddleware = (req, res, next) => {
  logger.warn(`Route not found: ${req.originalUrl}`, { 
    method: req.method, 
    ip: req.ip 
  });

  res.status(404).json(formatErrorResponse(`Route not found: ${req.originalUrl}`, 404));
};


export const errorHandlerMiddleware = (err, req, res, next) => {
  // Log error with contextual information
  const logMeta = {
    statusCode: err.statusCode || 500,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user ? req.user.id : 'anonymous',
    stack: err.stack
  };

  // Handle different types of errors
  if (err.name === 'ApiError') {
    logger.warn(`API Error: ${err.message}`, logMeta);
    return res.status(err.statusCode).json(formatErrorResponse(err.message, err.statusCode));
  }

  if (err.name === 'ValidationError') {
    logger.warn(`Validation Error: ${err.message}`, logMeta);
    return res.status(400).json(formatErrorResponse(err.message, 400));
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    logger.warn('Duplicate key error', logMeta);
    return res.status(409).json(formatErrorResponse('Duplicate key error', 409));
  }

  if (err.name === 'JsonWebTokenError') {
    logger.warn('Invalid token', logMeta);
    return res.status(401).json(formatErrorResponse('Invalid token', 401));
  }

  if (err.name === 'TokenExpiredError') {
    logger.warn('Token expired', logMeta);
    return res.status(401).json(formatErrorResponse('Token expired', 401));
  }

  // Default server error - log with error level
  logger.error(`Unhandled error: ${err.message}`, logMeta);

  res.status(500).json(formatErrorResponse(
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message, 
    500
  ));
};
