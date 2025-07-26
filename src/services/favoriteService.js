import Favorite from '../models/Favorite.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * Get user's favorites
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user favorites
 */
export const getUserFavorites = async (userId) => {
  try {
    if (!userId) {
      throw new ApiError('User ID is required', 400);
    }

    return await Favorite.find({ userId })
      .populate('tickerId', 'name symbol price')
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    if (error.name === 'ApiError') {
      throw error;
    }
    throw new ApiError('Failed to fetch favorites', 500);
  }
};

/**
 * Add a ticker to user's favorites
 * @param {string} userId - User ID
 * @param {string} tickerId - Ticker ID
 * @returns {Promise<Object>} Created favorite object
 * @throws {ApiError} If ticker is already in favorites
 */
export const addFavorite = async (userId, tickerId) => {
  try {
    if (!userId || !tickerId) {
      throw new ApiError('User ID and ticker ID are required', 400);
    }

    // Check if already favorited
    const existing = await Favorite.findOne({ userId, tickerId });
    if (existing) {
      throw new ApiError('Ticker already in favorites', 409);
    }

    // Create favorite
    const favorite = await Favorite.create({ userId, tickerId });
    return favorite;
  } catch (error) {
    console.error('Error adding favorite:', error);
    if (error.name === 'ApiError') {
      throw error;
    }
    throw new ApiError('Failed to add favorite', 500);
  }
};

/**
 * Remove a ticker from user's favorites
 * @param {string} userId - User ID
 * @param {string} tickerId - Ticker ID
 * @returns {Promise<void>}
 */
export const removeFavorite = async (userId, tickerId) => {
  try {
    if (!userId || !tickerId) {
      throw new ApiError('User ID and ticker ID are required', 400);
    }

    const result = await Favorite.deleteOne({ userId, tickerId });

    // Check if favorite was actually deleted
    if (result.deletedCount === 0) {
      throw new ApiError('Favorite not found', 404);
    }
  } catch (error) {
    console.error('Error removing favorite:', error);
    if (error.name === 'ApiError') {
      throw error;
    }
    throw new ApiError('Failed to remove favorite', 500);
  }
};

/**
 * Check if a ticker is in user's favorites
 * @param {string} userId - User ID
 * @param {string} tickerId - Ticker ID
 * @returns {Promise<boolean>} True if favorite exists
 */
export const isFavorite = async (userId, tickerId) => {
  try {
    if (!userId || !tickerId) {
      return false;
    }

    const favorite = await Favorite.findOne({ userId, tickerId });
    return !!favorite;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};
