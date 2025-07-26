import { Router } from 'express';
import { getTrending } from '../controllers/analyticsController.js';
import validationMiddleware from '../middleware/validationMiddleware.js';
import { analyticsSchemas } from '../utils/validationSchemas.js';

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
  '/trending',
  validationMiddleware(analyticsSchemas.getTrending, 'query'),
  getTrending
);

export default router;
 