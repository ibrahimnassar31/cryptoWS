import { Router } from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  updateProfile, 
  changePassword, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.js';
import { authValidation } from '../utils/validation.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';

/**
 * Authentication routes
 * @module routes/authRoutes
 */
const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register', 
  authValidation.register,
  register
);

/**
 * POST /api/auth/login
 * Login an existing user
 */
router.post(
  '/login', 
  authValidation.login,
  login
);

/**
 * GET /api/auth/me
 * Get current user profile
 * Protected route - requires authentication
 */
router.get(
  '/me', 
  authMiddleware,
  getCurrentUser
);

/**
 * PATCH /api/auth/me
 * Update current user profile
 * Protected route - requires authentication
 */
router.patch(
  '/me',
  [
    authMiddleware,
    body('username').optional().isString().trim().isLength({ min: 3, max: 30 }),
    body('avatar').optional().isURL(),
    body('bio').optional().isString().trim().isLength({ max: 300 })
  ],
  updateProfile
);

/**
 * POST /api/auth/change-password
 * Change current user password
 * Protected route - requires authentication
 */
router.post(
  '/change-password',
  [
    authMiddleware,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  changePassword
);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 * Public route
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Valid email required')
  ],
  forgotPassword
);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 * Public route
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  resetPassword
);

export default router; 