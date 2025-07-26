import User from '../models/User.js';
import { validationResult } from 'express-validator';

export const getProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const user = await User.findById(req.params.id).select('email username avatar bio createdAt');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ data: user });
};

export const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  const { username, avatar, bio } = req.body;
  const update = {};
  if (username) update.username = username;
  if (avatar) update.avatar = avatar;
  if (bio) update.bio = bio;
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, select: 'email username avatar bio createdAt' });
  res.json({ data: user });
}; 