import { Router } from 'express';
import { 
  getHealthStatus, 
  getHealthDetails, 
  getDatabaseHealth, 
  getRedisHealth, 
  retryDbConnection 
} from '../controllers/healthController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/authMiddleware.js';

/**
 * Health check routes
 * @module routes/healthRoutes
 */
const router = Router();

/**
 * GET /api/health
 * Basic health check endpoint
 */
router.get('/', getHealthStatus);

/**
 * GET /api/health/details
 * Detailed health information
 */
router.get('/details', getHealthDetails);

/**
 * GET /api/health/db
 * Database-specific health information
 */
router.get('/db', getDatabaseHealth);

/**
 * GET /api/health/redis
 * Redis-specific health information
 */
router.get('/redis', getRedisHealth);

/**
 * POST /api/health/retry-db-connection
 * Admin-only endpoint to retry database connection
 * Protected route - requires admin role
 */
router.post(
  '/retry-db-connection', 
  [authMiddleware, roleMiddleware(['admin'])], 
  retryDbConnection
);

export default router; 