export const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.roles || !req.user.roles.includes('admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}; 