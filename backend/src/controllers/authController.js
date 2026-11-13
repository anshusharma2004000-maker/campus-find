import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const tokenFor = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const safeUser = user => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role
});

export async function register(req, res) {
  const { name, email, password, phone } = req.body;
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || !name.trim() || !email.trim() || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  const normalizedEmail = email.trim().toLowerCase();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: typeof phone === 'string' ? phone.trim() : '',
    password: await bcrypt.hash(password, 12),
    role: 'student'
  });
  res.status(201).json({ token: tokenFor(user._id), user: safeUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = typeof email === 'string' && typeof password === 'string'
    ? await User.findOne({ email: email.trim().toLowerCase() }).select('+password')
    : null;
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid email or password.' });
  res.json({ token: tokenFor(user._id), user: safeUser(user) });
}

export async function me(req, res) {
  res.json({ user: safeUser(req.user) });
}
