/**
 * Express application server entry point.
 *
 * Configures security headers, CORS, body parsing, rate limiting,
 * route mounting, static assets, and global error handling.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';

// Route modules
import authRoutes from './routes/auth.js';
import recordsRoutes from './routes/records.js';
import appointmentsRoutes from './routes/appointments.js';
import remindersRoutes from './routes/reminders.js';
import metricsRoutes from './routes/metrics.js';
import copilotRoutes from './routes/copilot.js';
import profileRoutes from './routes/profile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Security & Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // relaxed for CDN scripts like Three.js and Chart.js
  })
);
app.use(
  cors({
    origin: config.server.corsOrigin,
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply general rate limiter to all API routes
app.use('/api/', generalLimiter);

// 2. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/profile', profileRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'VitaNex AI API',
    timestamp: new Date().toISOString(),
    ai_provider: config.ai.provider,
  });
});

// 3. Static Frontend Assets
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// SPA fallback for frontend pages
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// 4. Global Error Handler
app.use(errorHandler);

// 5. Start Server (if run directly)
if (process.env.NODE_ENV !== 'test') {
  const port = config.server.port;
  app.listen(port, () => {
    console.log(`\n========================================`);
    console.log(` MediNex AI Server running on port ${port} `);
    console.log(` Environment: ${config.server.nodeEnv}`);
    console.log(` AI Provider: ${config.ai.provider}`);
    console.log(`========================================\n`);
  });
}

export default app;
