import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/error.js';

const isProduction = process.env.NODE_ENV === 'production';
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
if (isProduction) requiredEnv.push('CLIENT_URL');
const missingEnv = requiredEnv.filter(key => !process.env[key]);
if (missingEnv.length) throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
if (isProduction && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.');
}

const configuredOrigins = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = new Set(configuredOrigins.split(',').map(value => {
  try {
    return new URL(value.trim()).origin;
  } catch {
    throw new Error(`Invalid CLIENT_URL origin: ${value}`);
  }
}));
for (const host of [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) {
  if (host) allowedOrigins.add(new URL(host.includes('://') ? host : `https://${host}`).origin);
}

const app = express();
if (isProduction) app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    const error = new Error(`Origin ${origin} is not allowed by CORS`);
    error.status = 403;
    callback(error);
  }
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    console.log(JSON.stringify({
      level: 'info',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - startedAt
    }));
  });
  next();
});
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
    app: 'CampusFind API',
    database: connected ? 'connected' : 'disconnected'
  });
});
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDB()
  .then(() => {
    const server = app.listen(port, () => console.log(`CampusFind API running on port ${port}`));
    process.on('SIGTERM', () => {
      server.close(() => {
        mongoose.disconnect().then(() => process.exit(0)).catch(error => {
          console.error('Error disconnecting MongoDB during shutdown:', error);
          process.exit(1);
        });
      });
    });
  })
  .catch(error => {
    if (isProduction) {
      const message = error.message?.replace(/mongodb(?:\+srv)?:\/\/\S+/gi, '[MongoDB URI redacted]');
      console.error(`Unable to start CampusFind API (${error.name || 'Error'}): ${message || 'Unknown startup error'}`);
    } else {
      console.error('Unable to start CampusFind API:', error);
    }
    process.exit(1);
  });
