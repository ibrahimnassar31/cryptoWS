import { Router } from 'express';
import { query } from 'express-validator';
import { getTrending } from '../controllers/analyticsController.js';

const router = Router();

/**
 * @swagger
 * /api/analytics/trending:
 *   get:
 *     summary: Get trending cryptocurrencies
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: by
 *         schema:
 *           type: string
 *           enum: [volume, priceChange, favorites]
 *         description: The criteria to determine trending tickers
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: The number of trending tickers to return
 *     responses:
 *       200:
 *         description: A list of trending tickers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticker'
 */
router.get(
  '/api/analytics/trending',
  [
    query('by').optional().isIn(['volume', 'priceChange', 'favorites']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  getTrending
);

export default router;
 