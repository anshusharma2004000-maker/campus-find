import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../models/User.js';
const tokenFor = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const safeUser = user => ({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });
export async function register(req, res) {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  const normalizedEmail = email.toLowerCase();
  const exists = await findUserByEmail(normalizedEmail);
  if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });
  const role = process.env.ADMIN_EMAIL && normalizedEmail === process.env.ADMIN_EMAIL.toLowerCase() ? 'admin' : 'student';
  const user = await createUser({ name, email: normalizedEmail, phone, password: await bcrypt.hash(password, 12), role });
  res.status(201).json({ token: tokenFor(user._id), user: safeUser(user) });
}
export async function login(req, res) {
  const { email, password } = req.body;
  const user = email ? await findUserByEmail(email.toLowerCase(), true) : null;
  if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password.' });
  res.json({ token: tokenFor(user._id), user: safeUser(user) });
}
export async function me(req, res) { res.json({ user: safeUser(req.user) }); }
