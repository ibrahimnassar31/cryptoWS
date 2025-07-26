import CryptoTicker from '../models/CryptoTicker.js';
import Favorite from '../models/Favorite.js';
import { validationResult } from 'express-validator';

export const getTrending = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const by = req.query.by || 'volume';
  const limit = parseInt(req.query.limit, 10) || 10;

  let data = [];
  if (by === 'volume') {
    data = await CryptoTicker.find().sort({ volume_24h: -1 }).limit(limit);
  } else if (by === 'priceChange') {
    data = await CryptoTicker.find().sort({ percent_change_24h: -1 }).limit(limit);
  } else if (by === 'favorites') {
    // Aggregate by favorite count
    const favs = await Favorite.aggregate([
      { $group: { _id: '$tickerId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
    const ids = favs.map(f => f._id);
    data = await CryptoTicker.find({ id: { $in: ids } });
    // Sort by favorite count order
    data = ids.map(id => data.find(t => t.id === id)).filter(Boolean);
  }
  res.json({ data });
}; 