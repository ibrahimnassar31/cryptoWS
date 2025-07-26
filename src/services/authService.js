import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_SECRET, JWT_EXPIRY } from '../constants/index.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import logger from '../utils/logger.js';

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password (plain text)
 * @param {Object} userData - Optional additional user data
 * @returns {Object} Object containing JWT token and user info
 * @throws {ApiError} If email already exists or registration fails
 */
export const registerUser = async (email, password, userData = {}) => {
  try {
    logger.debug('Attempting to register user', { email });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn('Registration attempt with existing email', { email });
      throw new ApiError('Email already registered', 409);
    }

    // Create new user (password hashing is handled by the model's pre-save hook)
    const user = await User.create({
      email,
      password,
      username: userData.username,
      avatar: userData.avatar,
      bio: userData.bio
    });

    logger.info('User registered successfully', { userId: user._id });

    // Generate JWT token
    const token = generateToken(user);

    return { 
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        roles: user.roles,
        displayName: user.displayName
      }
    };
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      logger.warn('User registration validation error', { 
        email,
        error: error.message 
      });
      throw new ApiError(`Validation error: ${error.message}`, 400);
    }

    // Re-throw ApiErrors
    if (error.name === 'ApiError') {
      throw error;
    }

    logger.error('Registration error:', error);
    throw new ApiError('Registration failed', 500);
  }
};

/**
 * Login an existing user
 * @param {string} email - User email
 * @param {string} password - User password (plain text)
 * @returns {Object} Object containing JWT token and user info
 * @throws {ApiError} If credentials are invalid or login fails
 */
export const loginUser = async (email, password) => {
  try {
    logger.debug('Login attempt', { email });

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Login attempt with non-existent email', { email });
      throw new ApiError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn('Login attempt for inactive account', { email });
      throw new ApiError('Account is inactive', 403);
    }

    // Compare passwords using the model method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn('Login attempt with incorrect password', { email });
      throw new ApiError('Invalid credentials', 401);
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    logger.info('User logged in successfully', { userId: user._id });

    // Generate JWT token
    const token = generateToken(user);

    return { 
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        roles: user.roles,
        displayName: user.displayName
      }
    };
  } catch (error) {
    // Re-throw ApiErrors
    if (error.name === 'ApiError') {
      throw error;
    }

    logger.error('Login error:', error);
    throw new ApiError('Login failed', 500);
  }
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Object} User profile without password
 * @throws {ApiError} If user not found
 */
export const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      logger.warn('Profile request for non-existent user', { userId });
      throw new ApiError('User not found', 404);
    }

    logger.debug('User profile retrieved', { userId });
    return user;
  } catch (error) {
    // Handle invalid ID format
    if (error.name === 'CastError') {
      logger.warn('Invalid user ID format', { userId });
      throw new ApiError('Invalid user ID format', 400);
    }

    // Re-throw ApiErrors
    if (error.name === 'ApiError') {
      throw error;
    }

    logger.error('Get user profile error:', error);
    throw new ApiError('Failed to retrieve user profile', 500);
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated user profile
 * @throws {ApiError} If user not found or update fails
 */
export const updateUserProfile = async (userId, updateData) => {
  try {
    // Filter allowed fields to update
    const allowedUpdates = {};
    if (updateData.username !== undefined) allowedUpdates.username = updateData.username;
    if (updateData.avatar !== undefined) allowedUpdates.avatar = updateData.avatar;
    if (updateData.bio !== undefined) allowedUpdates.bio = updateData.bio;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    logger.info('User profile updated', { userId });
    return user;
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      throw new ApiError(`Validation error: ${error.message}`, 400);
    }

    // Re-throw ApiErrors
    if (error.name === 'ApiError') {
      throw error;
    }

    logger.error('Update user profile error:', error);
    throw new ApiError('Failed to update user profile', 500);
  }
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Object} Success message
 * @throws {ApiError} If passwords don't match or change fails
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      logger.warn('Password change with incorrect current password', { userId });
      throw new ApiError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    logger.info('User password changed', { userId });
    return { message: 'Password changed successfully' };
  } catch (error) {
    // Re-throw ApiErrors
    if (error.name === 'ApiError') {
      throw error;
    }

    logger.error('Change password error:', error);
    throw new ApiError('Failed to change password', 500);
  }
};

/**
 * Generate JWT token for user
 * @param {Object} user - User document
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      roles: user.roles,
      username: user.username || undefined
    }, 
    JWT_SECRET, 
    { 
      expiresIn: JWT_EXPIRY 
    }
  );
};

/**
 * Start password reset process
 * @param {string} email - User email
 * @returns {Object} Success message and reset token
 * @throws {ApiError} If user not found or process fails
 */
export const requestPasswordReset = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError('No account with that email address exists', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Set token and expiry on user model
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    logger.info('Password reset requested', { userId: user._id });

    return { 
      message: 'Password reset initiated',
      resetToken,
      // In a real app, you'd send an email with this token
      // but for now, we'll return it for testing
    };
  } catch (error) {
    // Re-throw ApiErrors
    if (error.name === 'ApiError') {
      throw error;
    }

    logger.error('Password reset request error:', error);
    throw new ApiError('Failed to initiate password reset', 500);
  }
};

/**
 * Complete password reset using token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Object} Success message
 * @throws {ApiError} If token is invalid or expired
 */
export const resetPassword = async (token, newPassword) => {
  try {
    // Find user with matching token and check it hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      logger.warn('Password reset attempt with invalid or expired token');
      throw new ApiError('Password reset token is invalid or has expired', 400);
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    logger.info('Password reset completed', { userId: user._id });

    return { message: 'Password has been reset successfully' };
  } catch (error) {
    // Re-throw ApiErrors
    if (error.name === 'ApiError') {
      throw error;
    }

    logger.error('Password reset error:', error);
    throw new ApiError('Failed to reset password', 500);
  }
};

