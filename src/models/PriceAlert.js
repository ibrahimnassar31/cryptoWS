import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const priceAlertSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tickerId: { type: String, required: true },
  targetPrice: { type: Number, required: true },
  direction: { type: String, enum: ['above', 'below'], required: true },
  triggered: { type: Boolean, default: false },
}, { timestamps: true });

const PriceAlert = model('PriceAlert', priceAlertSchema);

export default PriceAlert; 