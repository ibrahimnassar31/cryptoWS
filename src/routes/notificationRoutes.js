import { Router } from 'express';
import validationMiddleware from '../middleware/validationMiddleware.js';
import { notificationSchemas } from '../utils/validationSchemas.js';
import { getNotifications, createNotification, markNotificationRead } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/users/{id}/notifications:
 *   get:
 *     summary: Get all notifications for a user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A list of notifications
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get(
  '/:id/notifications',
  validationMiddleware(notificationSchemas.getNotifications, 'params'),
  authMiddleware,
  getNotifications
);

/**
 * @swagger
 * /api/users/{id}/notifications:
 *   post:
 *     summary: Create a new notification for a user (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/:id/notifications',
  validationMiddleware(notificationSchemas.createNotification, 'params'),
  validationMiddleware(notificationSchemas.createNotification, 'body'),
  authMiddleware,
  adminMiddleware,
  createNotification
);

/**
 * @swagger
 * /api/users/{id}/notifications/{notifId}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *       - in: path
 *         name: notifId
 *         schema:
 *           type: string
 *         required: true
 *         description: The notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.put(
  '/:id/notifications/:notifId/read',
  validationMiddleware(notificationSchemas.markNotificationRead, 'params'),
  authMiddleware,
  markNotificationRead
);

export default router; 