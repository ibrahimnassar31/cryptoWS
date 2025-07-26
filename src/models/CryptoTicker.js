import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const { Schema, model } = mongoose;


const cryptoTickerSchema = new Schema(
  {
    id: { 
      type: String, 
      required: [true, 'Ticker ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    name: { 
      type: String, 
      required: [true, 'Name is required'],
      trim: true
    },
    symbol: { 
      type: String, 
      required: [true, 'Symbol is required'],
      trim: true,
      uppercase: true,
      index: true
    },
    rank: { 
      type: Number,
      min: 1,
      index: true 
    },
    price: { 
      type: Number,
      min: 0,
      default: null 
    },
    volume_24h: { 
      type: Number,
      min: 0,
      default: null 
    },
    market_cap: { 
      type: Number,
      min: 0,
      default: null 
    },
    percent_change_1h: { 
      type: Number,
      default: null 
    },
    percent_change_24h: { 
      type: Number,
      default: null 
    },
    percent_change_7d: { 
      type: Number,
      default: null 
    },
    last_updated: { 
      type: Date,
      default: Date.now 
    },
  },
  { 
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound index for optimized queries
cryptoTickerSchema.index({ symbol: 1, rank: 1 });

// Middleware - Log after successful save
cryptoTickerSchema.post('save', function(doc) {
  logger.debug(`CryptoTicker saved: ${doc.symbol}`, { id: doc.id });
});

// Static method to get top N ranked tickers
cryptoTickerSchema.statics.getTopRanked = function(limit = 10) {
  return this.find()
    .sort({ rank: 1 })
    .limit(limit);
};

// Static method to get tickers by market cap range
cryptoTickerSchema.statics.getByMarketCapRange = function(min, max) {
  return this.find({
    market_cap: { $gte: min, $lte: max }
  }).sort({ market_cap: -1 });
};

// Static method to search tickers by name or symbol
cryptoTickerSchema.statics.search = function(query) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    $or: [
      { name: searchRegex },
      { symbol: searchRegex }
    ]
  });
};

// Create model
const CryptoTicker = model('CryptoTicker', cryptoTickerSchema);

export default CryptoTicker;
