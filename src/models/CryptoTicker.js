import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const cryptoTickerSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    rank: { type: Number },
    price: { type: Number },
    volume_24h: { type: Number },
    market_cap: { type: Number },
    percent_change_1h: { type: Number },
    percent_change_24h: { type: Number },
    percent_change_7d: { type: Number },
    last_updated: { type: Date },
  },
  { timestamps: true }
);

const CryptoTicker = model('CryptoTicker', cryptoTickerSchema);

export default CryptoTicker;
