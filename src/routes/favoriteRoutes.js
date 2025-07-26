import { Router } from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import validationMiddleware from '../middleware/validationMiddleware.js';
import { favoriteSchemas } from '../utils/validationSchemas.js';

/**
 * Favorites routes
 * @module routes/favoriteRoutes
 */
const router = Router();

// Validation schemas


/**
 * GET /api/favorites/:userId
 * Get user favorites
 * Protected route - requires authentication
 */
router.get(
  '/:userId',
  validationMiddleware(favoriteSchemas.getFavorites, 'params'),
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
  validationMiddleware(favoriteSchemas.addFavorite, 'params'),
  validationMiddleware(favoriteSchemas.addFavorite, 'body'),
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
  validationMiddleware(favoriteSchemas.removeFavorite, 'params'),
  validationMiddleware(favoriteSchemas.removeFavorite, 'body'),
  authMiddleware,
  removeFavorite
);

export default router; 