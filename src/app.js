import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import fs from 'fs';

import { 
  RATE_LIMIT_WINDOW_MS, 
  RATE_LIMIT_MAX_REQUESTS 
} from './constants/index.js';

import tickerRoutes from './routes/tickerRoutes.js';
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import alertRoutes from './routes/alertRoutes.js';

import { notFoundMiddleware, errorHandlerMiddleware } from './middleware/errorMiddleware.js';
import { requestLogger, sanitizeRequestBody, errorLogger } from './middleware/loggingMiddleware.js';

import logger from './utils/logger.js';

import swaggerConfig from './swagger.js';

const app = express();

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const swaggerSpec = swaggerJSDoc(swaggerConfig);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res, next) => {
  req.id = Date.now().toString() + Math.random().toString(36).substring(2, 15);
  next();
});

app.use(helmet());

app.use(morgan('dev', { 
  skip: (req) => req.path === '/api/health' 
}));
app.use(requestLogger);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitizeRequestBody);

app.use(rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { 
      ip: req.ip,
      path: req.originalUrl 
    });
    res.status(429).json({
      error: 'Too many requests, please try again later',
      status: 429
    });
  }
}));

app.use(cors());

app.use('/api/health', healthRoutes);
app.use('/api/tickers', tickerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/favorites', favoriteRoutes);

logger.info('API routes initialized', {
  routes: [
    '/api/health', '/api/tickers', '/api/auth', '/api/users',
    '/api/notifications', '/api/admin', '/api/analytics',
    '/api/alerts', '/api/history', '/api/favorites'
  ]
});

app.use(errorLogger);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
