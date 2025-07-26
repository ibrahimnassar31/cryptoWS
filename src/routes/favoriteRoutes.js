import { Router } from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { param, body } from 'express-validator';

/**
 * Favorites routes
 * @module routes/favoriteRoutes
 */
const router = Router();

// Validation schemas
const favoriteValidation = {
  userId: param('userId').isMongoId().withMessage('Valid user ID is required'),
  tickerId: body('tickerId').isString().trim().notEmpty().withMessage('Valid ticker ID is required')
};

/**
 * GET /api/favorites/:userId
 * Get user favorites
 * Protected route - requires authentication
 */
router.get(
  '/:userId',
  [favoriteValidation.userId],
  authMiddleware,
  getFavorites
);

/**
 * POST /api/favorites/:userId
 * Add a new favorite
 * Protected route - requires authentication
 */
router.post(
  '/:userId',
  [
    favoriteValidation.userId,
    favoriteValidation.tickerId
  ],
  authMiddleware,
  addFavorite
);

/**
 * DELETE /api/favorites/:userId
 * Remove a favorite
 * Protected route - requires authentication
 */
router.delete(
  '/:userId',
  [
    favoriteValidation.userId,
    favoriteValidation.tickerId
  ],
  authMiddleware,
  removeFavorite
);

export default router; 