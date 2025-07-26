import { Router } from 'express';
import validationMiddleware from '../middleware/validationMiddleware.js';
import { historySchemas } from '../utils/validationSchemas.js';
import { getHistory } from '../controllers/historyController.js';

const router = Router();

/**
 * @swagger
 * /api/tickers/{id}/history:
 *   get:
 *     summary: Get historical price data for a ticker
 *     tags: [Tickers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ticker ID
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [1d, 1h]
 *         description: The interval for historical data (e.g., 1d for daily, 1h for hourly)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *         description: The number of data points to return
 *     responses:
 *       200:
 *         description: Historical price data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   price:
 *                     type: number
 *       404:
 *         description: Ticker not found
 */
router.get(
  '/:id/history',
  validationMiddleware(historySchemas.getHistory, 'params'),
  validationMiddleware(historySchemas.getHistory, 'query'),
  getHistory
);

export default router; 