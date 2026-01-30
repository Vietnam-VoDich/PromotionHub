import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { reviewsController } from '../controllers/reviews.controller.js';
import { validate } from '../middleware/validate.js';
import {
  createReviewSchema,
  updateReviewSchema,
  reviewsQuerySchema,
  reviewIdParamsSchema,
} from '../schemas/reviews.schema.js';
import { z } from 'zod';

export const reviewsRouter = Router();

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get all reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: listingId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
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
 *         description: List of reviews
 */
reviewsRouter.get('/', validate({ query: reviewsQuerySchema }), reviewsController.findAll);

/**
 * @swagger
 * /api/reviews/sentiment-stats:
 *   get:
 *     summary: Get review sentiment statistics
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: listingId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sentiment statistics
 */
reviewsRouter.get('/sentiment-stats', authenticate, reviewsController.getSentimentStats);

/**
 * @swagger
 * /api/reviews/smart:
 *   post:
 *     summary: Submit a review with smart routing (good → Google, bad → support)
 *     tags: [Reviews]
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
 *               - rating
 *             properties:
 *               listingId:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review processed with action
 */
reviewsRouter.post('/smart', authenticate, validate({ body: createReviewSchema }), reviewsController.submitSmart);

/**
 * @swagger
 * /api/reviews/listing/{listingId}/stats:
 *   get:
 *     summary: Get review statistics for a listing
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Review statistics
 */
reviewsRouter.get(
  '/listing/:listingId/stats',
  validate({ params: z.object({ listingId: z.string().uuid() }) }),
  reviewsController.getListingStats
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Get review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Review not found
 */
reviewsRouter.get(
  '/:id',
  validate({ params: reviewIdParamsSchema }),
  reviewsController.findById
);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a review
 *     tags: [Reviews]
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
 *               - rating
 *             properties:
 *               listingId:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 *       400:
 *         description: Cannot review this listing
 */
reviewsRouter.post(
  '/',
  authenticate,
  validate({ body: createReviewSchema }),
  reviewsController.create
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
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
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 *       403:
 *         description: Not authorized
 */
reviewsRouter.put(
  '/:id',
  authenticate,
  validate({ params: reviewIdParamsSchema, body: updateReviewSchema }),
  reviewsController.update
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
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
 *         description: Review deleted
 *       403:
 *         description: Not authorized
 */
reviewsRouter.delete(
  '/:id',
  authenticate,
  validate({ params: reviewIdParamsSchema }),
  reviewsController.delete
);
