import { Router } from 'express';
import { getAllUsers, deleteUser, upsertTicker, deleteTicker } from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import validationMiddleware from '../middleware/validationMiddleware.js';
import { adminSchemas } from '../utils/validationSchemas.js';

const router = Router();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
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
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', validationMiddleware(adminSchemas.deleteUser, 'params'), authMiddleware, adminMiddleware, deleteUser);

/**
 * @swagger
 * /api/admin/tickers:
 *   post:
 *     summary: Create or update a ticker
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               symbol:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Ticker upserted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/tickers',
  validationMiddleware(adminSchemas.upsertTicker, 'body'),
  authMiddleware,
  adminMiddleware,
  upsertTicker
);

/**
 * @swagger
 * /api/admin/tickers/{id}:
 *   delete:
 *     summary: Delete a ticker
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ticker ID
 *     responses:
 *       200:
 *         description: Ticker deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticker not found
 */
router.delete('/tickers/:id', validationMiddleware(adminSchemas.deleteTicker, 'params'), authMiddleware, adminMiddleware, deleteTicker);

export default router;
 