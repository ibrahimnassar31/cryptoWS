import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['system', 'alert', 'info'], default: 'info' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = model('Notification', notificationSchema);

export default Notification; 