import { Router } from 'express';
import { getTickers, getTickerById } from '../controllers/tickerController.js';
import { tickerValidation } from '../utils/validation.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import { CACHE_TTL } from '../constants/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tickers
 *   description: Cryptocurrency ticker data
 */

/**
 * @swagger
 * /api/tickers:
 *   get:
 *     summary: Get paginated, filtered, sorted list of cryptocurrency tickers
 *     tags: [Tickers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price, market_cap, rank]
 *         description: Sort by field
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *         description: Filter by symbol
 *     responses:
 *       200:
 *         description: Paginated tickers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticker'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */
router.get(
  '/',
  tickerValidation.getAll,
  cacheMiddleware(CACHE_TTL),
  getTickers
);

/**
 * @swagger
 * /api/tickers/{id}:
 *   get:
 *     summary: Get a single cryptocurrency ticker by ID
 *     tags: [Tickers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ticker ID
 *     responses:
 *       200:
 *         description: Ticker found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticker'
 *       404:
 *         description: Ticker not found
 */
router.get(
  '/:id',
  tickerValidation.getById,
  cacheMiddleware(CACHE_TTL),
  getTickerById
);

export default router;
