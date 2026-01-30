import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { bookingsController } from '../controllers/bookings.controller.js';
import { validate } from '../middleware/validate.js';
import {
  createBookingSchema,
  updateBookingStatusSchema,
  bookingsQuerySchema,
  bookingIdParamsSchema,
} from '../schemas/bookings.schema.js';

export const bookingsRouter = Router();

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings for current user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, rejected, completed, cancelled]
 *       - in: query
 *         name: asOwner
 *         schema:
 *           type: boolean
 *         description: If true, get bookings for listings you own
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of bookings
 */
bookingsRouter.get(
  '/',
  authenticate,
  validate({ query: bookingsQuerySchema }),
  bookingsController.findAll
);

/**
 * @swagger
 * /api/bookings/earnings:
 *   get:
 *     summary: Get earnings summary for owner
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earnings data
 */
bookingsRouter.get(
  '/earnings',
  authenticate,
  authorize('owner', 'admin'),
  bookingsController.getEarnings
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Booking details
 *       404:
 *         description: Booking not found
 */
bookingsRouter.get(
  '/:id',
  authenticate,
  validate({ params: bookingIdParamsSchema }),
  bookingsController.findById
);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listingId
 *               - startDate
 *               - endDate
 *               - paymentMethod
 *             properties:
 *               listingId:
 *                 type: string
 *                 format: uuid
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               paymentMethod:
 *                 type: string
 *                 enum: [orange_money, mtn_money, card]
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Invalid dates or listing not available
 */
bookingsRouter.post(
  '/',
  authenticate,
  authorize('advertiser', 'admin'),
  validate({ body: createBookingSchema }),
  bookingsController.create
);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   put:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, rejected, completed, cancelled]
 *     responses:
 *       200:
 *         description: Booking status updated
 *       403:
 *         description: Not authorized to update status
 */
bookingsRouter.put(
  '/:id/status',
  authenticate,
  validate({ params: bookingIdParamsSchema, body: updateBookingStatusSchema }),
  bookingsController.updateStatus
);

/**
 * @swagger
 * /api/bookings/{id}/sign-contract:
 *   post:
 *     summary: Sign the contract for a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contract signed
 *       403:
 *         description: Only advertiser can sign
 */
bookingsRouter.post(
  '/:id/sign-contract',
  authenticate,
  validate({ params: bookingIdParamsSchema }),
  bookingsController.signContract
);
