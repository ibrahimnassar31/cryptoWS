import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import tickerRoutes from './routes/tickerRoutes.js';

const app = express();

// Security headers
app.use(helmet());
// Logging
app.use(morgan('dev'));
// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
}));
// CORS
app.use(cors());
// JSON body parsing
app.use(express.json());

app.use('/api/tickers', tickerRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
