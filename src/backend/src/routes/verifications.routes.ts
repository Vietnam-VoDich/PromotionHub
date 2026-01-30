import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { verificationsController } from '../controllers/verifications.controller.js';
import { validate } from '../middleware/validate.js';
import {
  createVerificationPhotoSchema,
  updateVerificationStatusSchema,
  verificationsQuerySchema,
  verificationIdParamsSchema,
} from '../schemas/verifications.schema.js';
import { z } from 'zod';

export const verificationsRouter = Router();

/**
 * @swagger
 * /api/verifications:
 *   get:
 *     summary: Get all verification photos
 *     tags: [Verifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bookingId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
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
 *         description: List of verification photos
 */
verificationsRouter.get(
  '/',
  authenticate,
  validate({ query: verificationsQuerySchema }),
  verificationsController.findAll
);

/**
 * @swagger
 * /api/verifications/booking/{bookingId}:
 *   get:
 *     summary: Get all verification photos for a booking
 *     tags: [Verifications]
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
 *         description: Verification photos
 */
verificationsRouter.get(
  '/booking/:bookingId',
  authenticate,
  validate({ params: z.object({ bookingId: z.string().uuid() }) }),
  verificationsController.getBookingVerifications
);

/**
 * @swagger
 * /api/verifications/{id}:
 *   get:
 *     summary: Get verification photo by ID
 *     tags: [Verifications]
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
 *         description: Verification photo details
 *       404:
 *         description: Not found
 */
verificationsRouter.get(
  '/:id',
  authenticate,
  validate({ params: verificationIdParamsSchema }),
  verificationsController.findById
);

/**
 * @swagger
 * /api/verifications:
 *   post:
 *     summary: Upload a verification photo
 *     tags: [Verifications]
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
 *               - photoUrl
 *             properties:
 *               bookingId:
 *                 type: string
 *                 format: uuid
 *               photoUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Verification photo uploaded
 *       400:
 *         description: Invalid booking status
 */
verificationsRouter.post(
  '/',
  authenticate,
  validate({ body: createVerificationPhotoSchema }),
  verificationsController.create
);

/**
 * @swagger
 * /api/verifications/{id}/status:
 *   put:
 *     summary: Approve or reject a verification photo
 *     tags: [Verifications]
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
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Not authorized
 */
verificationsRouter.put(
  '/:id/status',
  authenticate,
  validate({ params: verificationIdParamsSchema, body: updateVerificationStatusSchema }),
  verificationsController.updateStatus
);
