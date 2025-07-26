import PriceAlert from '../models/PriceAlert.js';
import { validationResult } from 'express-validator';

export const createAlert = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  const { tickerId, targetPrice, direction } = req.body;
  const alert = await PriceAlert.create({ userId: req.user.id, tickerId, targetPrice, direction });
  res.status(201).json({ data: alert });
};

export const getAlerts = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  const alerts = await PriceAlert.find({ userId: req.user.id });
  res.json({ data: alerts });
};

export const deleteAlert = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  await PriceAlert.deleteOne({ _id: req.params.alertId, userId: req.user.id });
  res.json({ success: true });
}; 