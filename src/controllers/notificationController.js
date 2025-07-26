import Notification from '../models/Notification.js';
import { validationResult } from 'express-validator';

export const getNotifications = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ data: notifications });
};

export const createNotification = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { type, message } = req.body;
  const notif = await Notification.create({ userId: req.params.id, type, message });
  res.status(201).json({ data: notif });
};

export const markNotificationRead = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.notifId, userId: req.user.id },
    { read: true },
    { new: true }
  );
  if (!notif) return res.status(404).json({ error: 'Notification not found' });
  res.json({ data: notif });
}; 