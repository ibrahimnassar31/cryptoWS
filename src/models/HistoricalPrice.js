import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const historicalPriceSchema = new Schema({
  tickerId: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  price: { type: Number, required: true },
  volume: { type: Number },
  marketCap: { type: Number },
}, { timestamps: true });

const HistoricalPrice = model('HistoricalPrice', historicalPriceSchema);

export default HistoricalPrice; 