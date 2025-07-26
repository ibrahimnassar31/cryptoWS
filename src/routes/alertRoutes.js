import { Router } from 'express';
import { param, body } from 'express-validator';
import { createAlert, getAlerts, deleteAlert } from '../controllers/alertController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post(
  '/api/users/:id/alerts',
  [
    param('id').isString().notEmpty(),
    body('tickerId').isString().notEmpty(),
    body('targetPrice').isNumeric(),
    body('direction').isIn(['above', 'below']),
  ],
  authMiddleware,
  createAlert
);

router.get(
  '/api/users/:id/alerts',
  [param('id').isString().notEmpty()],
  authMiddleware,
  getAlerts
);

router.delete(
  '/api/users/:id/alerts/:alertId',
  [param('id').isString().notEmpty(), param('alertId').isString().notEmpty()],
  authMiddleware,
  deleteAlert
);

export default router; 