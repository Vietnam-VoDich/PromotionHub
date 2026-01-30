import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { paymentsController } from '../controllers/payments.controller.js';
import { validate } from '../middleware/validate.js';
import {
  createPaymentSchema,
  paymentWebhookSchema,
  paymentIdParamsSchema,
} from '../schemas/payments.schema.js';
import { z } from 'zod';

export const paymentsRouter = Router();

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create a payment for a booking
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - paymentMethod
 *             properties:
 *               bookingId:
 *                 type: string
 *                 format: uuid
 *               paymentMethod:
 *                 type: string
 *                 enum: [orange_money, mtn_money, card]
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment initiated
 *       400:
 *         description: Invalid payment request
 */
paymentsRouter.post(
  '/',
  authenticate,
  validate({ body: createPaymentSchema }),
  paymentsController.create
);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
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
 *         description: Payment details
 *       404:
 *         description: Payment not found
 */
paymentsRouter.get(
  '/:id',
  authenticate,
  validate({ params: paymentIdParamsSchema }),
  paymentsController.findById
);

/**
 * @swagger
 * /api/payments/{id}/status:
 *   get:
 *     summary: Check and update payment status
 *     tags: [Payments]
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
 *         description: Current payment status
 */
paymentsRouter.get(
  '/:id/status',
  authenticate,
  validate({ params: paymentIdParamsSchema }),
  paymentsController.checkStatus
);

/**
 * @swagger
 * /api/payments/booking/{bookingId}:
 *   get:
 *     summary: Get all payments for a booking
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of payments
 */
paymentsRouter.get(
  '/booking/:bookingId',
  authenticate,
  validate({ params: z.object({ bookingId: z.string().uuid() }) }),
  paymentsController.findByBookingId
);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Handle payment webhook from Mobile Money providers
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionId
 *               - status
 *               - amount
 *             properties:
 *               transactionId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [success, failed]
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: XOF
 *     responses:
 *       200:
 *         description: Webhook processed
 */
paymentsRouter.post(
  '/webhook',
  validate({ body: paymentWebhookSchema }),
  paymentsController.handleWebhook
);
