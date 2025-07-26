import User from '../models/User.js';
import CryptoTicker from '../models/CryptoTicker.js';
import { validationResult } from 'express-validator';

export const getAllUsers = async (req, res) => {
  const users = await User.find().select('email username roles createdAt');
  res.json({ data: users });
};

export const deleteUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

export const upsertTicker = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id, name, symbol, price } = req.body;
  const ticker = await CryptoTicker.findOneAndUpdate(
    { id },
    { $set: { name, symbol, price } },
    { upsert: true, new: true }
  );
  res.status(201).json({ data: ticker });
};

export const deleteTicker = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  await CryptoTicker.findOneAndDelete({ id: req.params.id });
  res.json({ success: true });
}; 