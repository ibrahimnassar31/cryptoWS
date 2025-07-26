import { Router } from 'express';
import { param, query } from 'express-validator';
import { getHistory } from '../controllers/historyController.js';

const router = Router();

router.get(
  '/api/tickers/:id/history',
  [
    param('id').isString().notEmpty(),
    query('interval').optional().isIn(['1d', '1h']),
    query('limit').optional().isInt({ min: 1, max: 365 }),
  ],
  getHistory
);

export default router; 