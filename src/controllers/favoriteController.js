import { validationResult } from 'express-validator';
import * as favoriteService from '../services/favoriteService.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import { validate } from '../utils/validation.js';

/**
 * Get user favorites
 * @route GET /api/favorites/:userId
 */
export const getFavorites = async (req, res, next) => {
  try {
    const validationError = validate(req, res);
    if (validationError) return;

    const { userId } = req.params;
    if (req.user.id !== userId) {
      throw new ApiError('You can only access your own favorites', 403);
    }

    const favorites = await favoriteService.getUserFavorites(userId);

    return res.status(200).json({ 
      data: favorites,
      count: favorites.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new favorite
 * @route POST /api/favorites/:userId
 */
export const addFavorite = async (req, res, next) => {
  try {
    const validationError = validate(req, res);
    if (validationError) return;

    const { userId } = req.params;
    if (req.user.id !== userId) {
      throw new ApiError('You can only modify your own favorites', 403);
    }

    const { tickerId } = req.body;
    const favorite = await favoriteService.addFavorite(userId, tickerId);

    return res.status(201).json({ 
      data: favorite,
      message: 'Favorite added successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a favorite
 * @route DELETE /api/favorites/:userId
 */
export const removeFavorite = async (req, res, next) => {
  try {
    const validationError = validate(req, res);
    if (validationError) return;

    const { userId } = req.params;
    if (req.user.id !== userId) {
      throw new ApiError('You can only modify your own favorites', 403);
    }

    // Remove favorite through service
    const { tickerId } = req.body;
    await favoriteService.removeFavorite(userId, tickerId);

    return res.status(200).json({ 
      success: true,
      message: 'Favorite removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
 