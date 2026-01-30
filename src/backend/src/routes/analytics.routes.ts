import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { analyticsController } from '../controllers/analytics.controller.js';

export const analyticsRouter = Router();

// all analytics routes require admin authentication
analyticsRouter.use(authenticate, authorize('admin'));

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
analyticsRouter.get('/dashboard', analyticsController.getDashboardStats);

/**
 * @swagger
 * /api/analytics/bookings:
 *   get:
 *     summary: Get bookings time series
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Bookings over time
 */
analyticsRouter.get('/bookings', analyticsController.getBookingsTimeSeries);

/**
 * @swagger
 * /api/analytics/revenue:
 *   get:
 *     summary: Get revenue time series
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Revenue over time
 */
analyticsRouter.get('/revenue', analyticsController.getRevenueTimeSeries);

/**
 * @swagger
 * /api/analytics/users:
 *   get:
 *     summary: Get user registrations time series
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: User registrations over time
 */
analyticsRouter.get('/users', analyticsController.getUsersTimeSeries);

/**
 * @swagger
 * /api/analytics/top-listings:
 *   get:
 *     summary: Get top performing listings
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top listings by revenue
 */
analyticsRouter.get('/top-listings', analyticsController.getTopListings);

/**
 * @swagger
 * /api/analytics/quartiers:
 *   get:
 *     summary: Get statistics by quartier
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics grouped by quartier
 */
analyticsRouter.get('/quartiers', analyticsController.getQuartierStats);

/**
 * @swagger
 * /api/analytics/users-by-role:
 *   get:
 *     summary: Get user count by role
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User distribution by role
 */
analyticsRouter.get('/users-by-role', analyticsController.getUsersByRole);

/**
 * @swagger
 * /api/analytics/bookings-by-status:
 *   get:
 *     summary: Get booking count by status
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking distribution by status
 */
analyticsRouter.get('/bookings-by-status', analyticsController.getBookingsByStatus);

/**
 * @swagger
 * /api/analytics/payment-methods:
 *   get:
 *     summary: Get payment method statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment method distribution
 */
analyticsRouter.get('/payment-methods', analyticsController.getPaymentMethodStats);
