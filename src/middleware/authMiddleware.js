import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../constants/index.js';
import { ApiError } from './errorMiddleware.js';

/**
 * Authentication middleware
 * Verifies JWT token and adds user information to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authMiddleware = (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('No token provided', 401);
    }

    // Extract and verify token
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ApiError('Token expired', 401);
      } else if (error.name === 'JsonWebTokenError') {
        throw new ApiError('Invalid token', 401);
      } else {
        throw new ApiError('Authentication failed', 401);
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization middleware
 * Ensures user has required roles
 * @param {Array<string>} roles - Array of required roles
 * @returns {Function} Express middleware function
 */
export const roleMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      // Check if user exists from auth middleware
      if (!req.user) {
        throw new ApiError('Authentication required', 401);
      }

      // Check if user has required roles
      const userRoles = req.user.roles || [];
      const hasRequiredRole = roles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        throw new ApiError('Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}; 