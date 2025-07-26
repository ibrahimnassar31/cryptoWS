import { validationResult } from 'express-validator';
import { ApiError } from '../middleware/errorMiddleware.js';
import * as authService from '../services/authService.js';
import { validate } from '../utils/validation.js';
import logger from '../utils/logger.js';

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    // Validate request
    const validationError = validate(req, res);
    if (validationError) return;

    const { email, password, username, avatar, bio } = req.body;

    // Register user through service
    const result = await authService.registerUser(email, password, { 
      username, 
      avatar, 
      bio
    });

    // Return JWT token and user data
    return res.status(201).json({ 
      token: result.token,
      user: result.user,
      message: 'Registration successful'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Login an existing user
 * @route POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    // Validate request
    const validationError = validate(req, res);
    if (validationError) return;

    const { email, password } = req.body;

    // Login user through service
    const result = await authService.loginUser(email, password);

    // Return JWT token and user data
    return res.status(200).json({ 
      token: result.token,
      user: result.user,
      message: 'Login successful'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @middleware authMiddleware - Requires authentication
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    // req.user is set by auth middleware
    if (!req.user || !req.user.id) {
      throw new ApiError('Authentication required', 401);
    }

    // Get user profile through service
    const user = await authService.getUserProfile(req.user.id);

    // Return user data (excluding password)
    return res.status(200).json(user);

  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route PATCH /api/auth/me
 * @middleware authMiddleware - Requires authentication
 */
export const updateProfile = async (req, res, next) => {
  try {
    // Validate request
    const validationError = validate(req, res);
    if (validationError) return;

    if (!req.user || !req.user.id) {
      throw new ApiError('Authentication required', 401);
    }

    const { username, avatar, bio } = req.body;

    // Update user profile
    const updatedUser = await authService.updateUserProfile(req.user.id, { 
      username, 
      avatar, 
      bio 
    });

    return res.status(200).json({
      user: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 * @route POST /api/auth/change-password
 * @middleware authMiddleware - Requires authentication
 */
export const changePassword = async (req, res, next) => {
  try {
    // Validate request
    const validationError = validate(req, res);
    if (validationError) return;

    if (!req.user || !req.user.id) {
      throw new ApiError('Authentication required', 401);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError('Current password and new password are required', 400);
    }

    // Change password
    const result = await authService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );

    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    // Validate request
    const validationError = validate(req, res);
    if (validationError) return;

    const { email } = req.body;

    if (!email) {
      throw new ApiError('Email is required', 400);
    }

    const result = await authService.requestPasswordReset(email);


    return res.status(200).json({
      message: 'Password reset instructions sent to your email',
      ...(process.env.NODE_ENV === 'development' && { resetToken: result.resetToken })
    });

  } catch (error) {
    if (error.statusCode === 404) {
      logger.info('Password reset requested for non-existent email', { email: req.body.email });
      return res.status(200).json({
        message: 'Password reset instructions sent to your email if account exists'
      });
    }

    next(error);
  }
};

/**
 * Reset password using token
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const validationError = validate(req, res);
    if (validationError) return;

    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ApiError('Token and new password are required', 400);
    }

    const result = await authService.resetPassword(token, newPassword);

    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
};
 