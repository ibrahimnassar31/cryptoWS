import { Router } from 'express';
import { getTickers, getTickerById } from '../controllers/tickerController.js';
import { tickerValidation } from '../utils/validation.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import { CACHE_TTL } from '../constants/index.js';

/**
 * Ticker routes
 * @module routes/tickerRoutes
 */
const router = Router();

/**
 * GET /api/tickers
 * Get paginated, filtered, sorted list of cryptocurrency tickers
 */
router.get(
  '/',
  tickerValidation.getAll,
  cacheMiddleware(CACHE_TTL),
  getTickers
);

/**
 * GET /api/tickers/:id
 * Get a single cryptocurrency ticker by ID
 */
router.get(
  '/:id',
  tickerValidation.getById,
  cacheMiddleware(CACHE_TTL),
  getTickerById
);

/**
 * Future routes for ticker management can be added here:
 * - PUT /api/tickers/:id (update a ticker)
 * - POST /api/tickers (create a new ticker - admin only)
 * - DELETE /api/tickers/:id (delete a ticker - admin only)
 */

export default router;
