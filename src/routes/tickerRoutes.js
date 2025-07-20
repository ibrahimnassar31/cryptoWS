import { Router } from 'express';
import { getTickers } from '../controllers/tickerController.js';
import { query } from 'express-validator';

const router = Router();

// GET /api/tickers with validation for pagination, filtering, sorting
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('sort').optional().isIn(['price', 'market_cap', 'rank']).withMessage('Invalid sort field'),
    query('symbol').optional().isString().trim().isLength({ min: 1, max: 10 }),
  ],
  getTickers
);

export default router;
