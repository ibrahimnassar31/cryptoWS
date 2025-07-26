import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const favoriteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tickerId: { type: String, required: true },
}, { timestamps: true });

const Favorite = model('Favorite', favoriteSchema);

export default Favorite; 