import CryptoTicker from '../models/CryptoTicker.js';
import { fetchCryptoTickers } from '../services/coinpaprikaService.js';

// Fetch and update tickers from CoinPaprika, then return from DB
export const getTickers = async (req, res) => {
  try {
    // Fetch latest data from CoinPaprika
    const tickers = await fetchCryptoTickers();
    if (tickers.length) {
      // Upsert each ticker in DB
      await Promise.all(
        tickers.map(async (ticker) => {
          await CryptoTicker.findOneAndUpdate(
            { id: ticker.id },
            { $set: ticker },
            { upsert: true, new: true }
          );
        })
      );
    }
    // Return all tickers from DB
    const dbTickers = await CryptoTicker.find({}).sort({ rank: 1 });
    return res.status(200).json(dbTickers);
  } catch (error) {
    console.error('Error in getTickers:', error);
    return res.status(500).json({ error: 'Failed to fetch tickers' });
  }
};
