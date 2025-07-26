import { Router } from 'express';
import { param, body } from 'express-validator';
import { createAlert, getAlerts, deleteAlert } from '../controllers/alertController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/users/{id}/alerts:
 *   post:
 *     summary: Create a new price alert for a user
 *     tags: [Alerts]
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
 *               tickerId:
 *                 type: string
 *               targetPrice:
 *                 type: number
 *               direction:
 *                 type: string
 *                 enum: [above, below]
 *     responses:
 *       201:
 *         description: Alert created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /api/users/{id}/alerts:
 *   get:
 *     summary: Get all price alerts for a user
 *     tags: [Alerts]
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
 *         description: A list of alerts
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get(
  '/api/users/:id/alerts',
  [param('id').isString().notEmpty()],
  authMiddleware,
  getAlerts
);

/**
 * @swagger
 * /api/users/{id}/alerts/{alertId}:
 *   delete:
 *     summary: Delete a price alert
 *     tags: [Alerts]
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
 *         name: alertId
 *         schema:
 *           type: string
 *         required: true
 *         description: The alert ID
 *     responses:
 *       200:
 *         description: Alert deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Alert not found
 */
router.delete(
  '/api/users/:id/alerts/:alertId',
  [param('id').isString().notEmpty(), param('alertId').isString().notEmpty()],
  authMiddleware,
  deleteAlert
);

export default router;
 