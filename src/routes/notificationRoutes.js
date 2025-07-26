import { Router } from 'express';
import { param, body } from 'express-validator';
import { getNotifications, createNotification, markNotificationRead } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

router.get(
  '/api/users/:id/notifications',
  [param('id').isString().notEmpty()],
  authMiddleware,
  getNotifications
);

router.post(
  '/api/users/:id/notifications',
  [param('id').isString().notEmpty(), body('type').isString(), body('message').isString().notEmpty()],
  authMiddleware,
  adminMiddleware,
  createNotification
);

router.put(
  '/api/users/:id/notifications/:notifId/read',
  [param('id').isString().notEmpty(), param('notifId').isString().notEmpty()],
  authMiddleware,
  markNotificationRead
);

export default router; 