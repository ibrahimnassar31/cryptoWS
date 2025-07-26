import { Router } from 'express';
import { param, body } from 'express-validator';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get(
  '/api/users/:id/profile',
  [param('id').isString().notEmpty()],
  getProfile
);

router.put(
  '/api/users/:id/profile',
  [
    param('id').isString().notEmpty(),
    body('username').optional().isString().trim().isLength({ min: 2, max: 30 }),
    body('avatar').optional().isURL(),
    body('bio').optional().isString().isLength({ max: 300 }),
  ],
  authMiddleware,
  updateProfile
);

export default router; 