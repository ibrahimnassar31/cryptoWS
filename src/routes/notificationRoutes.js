import { Router } from 'express';
import { param, body } from 'express-validator';
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
  '/api/users/:id/notifications',
  [param('id').isString().notEmpty()],
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
  '/api/users/:id/notifications',
  [param('id').isString().notEmpty(), body('type').isString(), body('message').isString().notEmpty()],
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
  '/api/users/:id/notifications/:notifId/read',
  [param('id').isString().notEmpty(), param('notifId').isString().notEmpty()],
  authMiddleware,
  markNotificationRead
);

export default router; 