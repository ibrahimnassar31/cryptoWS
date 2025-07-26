import request from 'supertest';
import express from 'express';
import tickerRoutes from '../routes/tickerRoutes.js';
import redisClient from '../config/redis.js';

jest.mock('../config/redis.js', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue(null),
    setEx: jest.fn().mockResolvedValue(null),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/tickers', tickerRoutes);

describe('GET /api/tickers', () => {
  it('should return 200 and an object with data array', async () => {
    const res = await request(app).get('/api/tickers');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limit');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('totalPages');
  });
});

describe('GET /api/tickers/:id', () => {
  it('should return 200 and a ticker object if found', async () => {
    // Mock DB response
    jest.spyOn(require('../models/CryptoTicker.js'), 'findOne').mockResolvedValue({ id: 'btc-bitcoin', name: 'Bitcoin' });
    const res = await request(app).get('/api/tickers/btc-bitcoin');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 'btc-bitcoin');
  });
  it('should return 404 if ticker not found', async () => {
    jest.spyOn(require('../models/CryptoTicker.js'), 'findOne').mockResolvedValue(null);
    const res = await request(app).get('/api/tickers/unknown-id');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/tickers error case', () => {
  it('should return 400 for invalid query params', async () => {
    const res = await request(app).get('/api/tickers?page=-1');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });
}); 