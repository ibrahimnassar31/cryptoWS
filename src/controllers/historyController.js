import HistoricalPrice from '../models/HistoricalPrice.js';
import { validationResult } from 'express-validator';

export const getHistory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = req.params;
  const interval = req.query.interval || '1d';
  const limit = parseInt(req.query.limit, 10) || 30;
  try {
    const history = await HistoricalPrice.find({ tickerId: id })
      .sort({ date: -1 })
      .limit(limit);
    res.json({ data: history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
}; 