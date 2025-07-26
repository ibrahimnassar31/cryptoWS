

import { body, query, param, validationResult } from 'express-validator';

/**
 * Processes validation results and returns errors if any
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object|null} - Returns validation errors or null if valid
 */
export const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
};

/**
 * Validation schemas for tickers routes
 */
export const tickerValidation = {
  getAll: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('sort').optional().isIn(['price', 'market_cap', 'rank']).withMessage('Invalid sort field'),
    query('symbol').optional().isString().trim().isLength({ min: 1, max: 10 }),
  ],
  getById: [
    param('id').isString().trim().notEmpty().withMessage('id param is required')
  ]
};

/**
 * Validation schemas for auth routes
 */
export const authValidation = {
  register: [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  ],
  login: [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').exists().withMessage('Password required'),
  ]
};

/**
 * Validation schemas for user routes
 */
export const userValidation = {
  update: [
    body('username').optional().isString().trim().isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 chars'),
    body('bio').optional().isString().trim().isLength({ max: 300 }).withMessage('Bio must be max 300 chars'),
    body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
  ]
};
