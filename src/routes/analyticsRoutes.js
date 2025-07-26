import { Router } from 'express';
import { query } from 'express-validator';
import { getTrending } from '../controllers/analyticsController.js';

const router = Router();

router.get(
  '/api/analytics/trending',
  [
    query('by').optional().isIn(['volume', 'priceChange', 'favorites']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  getTrending
);

export default router; 