import { Router } from 'express';
import { param, body } from 'express-validator';
import { getAllUsers, deleteUser, upsertTicker, deleteTicker } from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

router.get('/api/admin/users', authMiddleware, adminMiddleware, getAllUsers);

router.delete('/api/admin/users/:id', [param('id').isString().notEmpty()], authMiddleware, adminMiddleware, deleteUser);

router.post(
  '/api/admin/tickers',
  [
    body('id').isString().notEmpty(),
    body('name').isString().notEmpty(),
    body('symbol').isString().notEmpty(),
    body('price').isNumeric(),
  ],
  authMiddleware,
  adminMiddleware,
  upsertTicker
);

router.delete('/api/admin/tickers/:id', [param('id').isString().notEmpty()], authMiddleware, adminMiddleware, deleteTicker);

export default router; 