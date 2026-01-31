import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { rateLimit } from 'express-rate-limit';
import passport from 'passport';

import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { swaggerSpec } from './config/swagger.js';
import { authRouter } from './routes/auth.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { listingsRouter } from './routes/listings.routes.js';
import { bookingsRouter } from './routes/bookings.routes.js';
import { paymentsRouter } from './routes/payments.routes.js';
import { messagesRouter } from './routes/messages.routes.js';
import { reviewsRouter } from './routes/reviews.routes.js';
import { verificationsRouter } from './routes/verifications.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { analyticsRouter } from './routes/analytics.routes.js';
import { pushRouter } from './routes/push.routes.js';
import newsletterRouter from './routes/newsletter.routes.js';
import { blogRouter } from './routes/blog.routes.js';
import { imageAnalysisRouter } from './routes/image-analysis.routes.js';
import { sitemapRouter } from './routes/sitemap.routes.js';
import { blockchainRouter } from './routes/blockchain.routes.js';
import { favoritesRouter } from './routes/favorites.routes.js';

export const app: Express = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Passport OAuth
app.use(passport.initialize());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Root route - API info
app.get('/', (_req, res) => {
  res.json({
    name: 'PromotionHub API',
    version: '1.0.0',
    description: 'API pour la marketplace de panneaux publicitaires en Côte d\'Ivoire',
    documentation: '/api/docs',
    health: '/api/health',
    endpoints: {
      auth: '/api/auth',
      listings: '/api/listings',
      bookings: '/api/bookings',
      payments: '/api/payments',
      newsletter: '/api/newsletter',
    },
  });
});

// SEO - Sitemap and robots.txt (at root level)
app.use('/', sitemapRouter);

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/verifications', verificationsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/push', pushRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/blog', blogRouter);
app.use('/api/images', imageAnalysisRouter);
app.use('/api/blockchain', blockchainRouter);
app.use('/api/favorites', favoritesRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);
