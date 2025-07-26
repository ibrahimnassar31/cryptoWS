import Joi from 'joi';

export const userSchemas = {
  getProfile: Joi.object({
    id: Joi.string().required(),
  }),
  updateProfile: Joi.object({
    id: Joi.string(),
    username: Joi.string().min(2).max(30).optional(),
    avatar: Joi.string().uri().optional(),
    bio: Joi.string().max(300).optional(),
  }),
};

export const authSchemas = {
  register: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  updateProfile: Joi.object({
    username: Joi.string().min(3).max(30).optional(),
    avatar: Joi.string().uri().optional(),
    bio: Joi.string().max(300).optional(),
  }),
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),
  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
};

export const adminSchemas = {
  deleteUser: Joi.object({
    id: Joi.string().required(),
  }),
  upsertTicker: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    symbol: Joi.string().required(),
    price: Joi.number().required(),
  }),
  deleteTicker: Joi.object({
    id: Joi.string().required(),
  }),
};

export const alertSchemas = {
  createAlert: Joi.object({
    id: Joi.string().required(),
    tickerId: Joi.string().required(),
    targetPrice: Joi.number().required(),
    direction: Joi.string().valid('above', 'below').required(),
  }),
  getAlerts: Joi.object({
    id: Joi.string().required(),
  }),
  deleteAlert: Joi.object({
    id: Joi.string().required(),
    alertId: Joi.string().required(),
  }),
};

export const analyticsSchemas = {
  getTrending: Joi.object({
    by: Joi.string().valid('volume', 'priceChange', 'favorites').optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
};

export const favoriteSchemas = {
  getFavorites: Joi.object({
    userId: Joi.string().required(),
  }),
  addFavorite: Joi.object({
    userId: Joi.string().required(),
    tickerId: Joi.string().required(),
  }),
  removeFavorite: Joi.object({
    userId: Joi.string().required(),
    tickerId: Joi.string().required(),
  }),
};

export const historySchemas = {
  getHistory: Joi.object({
    id: Joi.string().required(),
    interval: Joi.string().valid('1d', '1h').optional(),
    limit: Joi.number().integer().min(1).max(365).optional(),
  }),
};

export const notificationSchemas = {
  getNotifications: Joi.object({
    id: Joi.string().required(),
  }),
  createNotification: Joi.object({
    id: Joi.string().required(),
    type: Joi.string().required(),
    message: Joi.string().required(),
  }),
  markNotificationRead: Joi.object({
    id: Joi.string().required(),
    notifId: Joi.string().required(),
  }),
};

export const tickerSchemas = {
  getAll: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    sort: Joi.string().valid('price', 'market_cap', 'rank').optional(),
    symbol: Joi.string().optional(),
  }),
  getById: Joi.object({
    id: Joi.string().required(),
  }),
};