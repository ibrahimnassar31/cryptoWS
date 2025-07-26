import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import validationMiddleware from '../middleware/validationMiddleware.js';
import { userSchemas } from '../utils/validationSchemas.js';

const router = Router();

/**
 * @swagger
 * /api/users/{id}/profile:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User profile data
 *       404:
 *         description: User not found
 */
router.get(
  '/:id/profile',
  validationMiddleware(userSchemas.getProfile, 'params'),
  getProfile
);

/**
 * @swagger
 * /api/users/{id}/profile:
 *   put:
 *     summary: Update user profile by ID
 *     tags: [Users]
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
 *               username:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: url
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put(
  '/:id/profile',
  validationMiddleware(userSchemas.updateProfile, 'params'),
  validationMiddleware(userSchemas.updateProfile, 'body'),
  authMiddleware,
  updateProfile
);

export default router;
 