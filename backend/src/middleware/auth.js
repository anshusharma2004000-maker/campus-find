import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  let decoded;
  try {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;
    if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
  if (!decoded || typeof decoded !== 'object' || !decoded.id) {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
  req.user = await User.findById(decoded.id);
  if (!req.user) return res.status(401).json({ message: 'Account not found.' });
  next();
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access required.' });
  next();
}
