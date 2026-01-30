import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { listingsController } from '../controllers/listings.controller.js';
import { validate } from '../middleware/validate.js';
import { uploadSingle } from '../middleware/upload.js';
import {
  createListingSchema,
  updateListingSchema,
  listingsQuerySchema,
  listingIdParamsSchema,
} from '../schemas/listings.schema.js';
import { z } from 'zod';

export const listingsRouter = Router();

/**
 * @swagger
 * /api/listings:
 *   get:
 *     summary: Get all listings with filters
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: quartier
 *         schema:
 *           type: string
 *         description: Filter by quartier
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price per month
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price per month
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *           enum: [small, medium, large]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, address
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, createdAt, rating]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
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
 *           maximum: 50
 *     responses:
 *       200:
 *         description: List of listings with pagination
 */
listingsRouter.get('/', validate({ query: listingsQuerySchema }), listingsController.findAll);

/**
 * @swagger
 * /api/listings/my:
 *   get:
 *     summary: Get current user's listings
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's listings
 */
listingsRouter.get(
  '/my',
  authenticate,
  validate({ query: listingsQuerySchema }),
  listingsController.getMyListings
);

/**
 * @swagger
 * /api/listings/{id}:
 *   get:
 *     summary: Get listing by ID
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Listing details
 *       404:
 *         description: Listing not found
 */
listingsRouter.get(
  '/:id',
  validate({ params: listingIdParamsSchema }),
  listingsController.findById
);

/**
 * @swagger
 * /api/listings:
 *   post:
 *     summary: Create a new listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - latitude
 *               - longitude
 *               - address
 *               - quartier
 *               - pricePerMonth
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               address:
 *                 type: string
 *               quartier:
 *                 type: string
 *               size:
 *                 type: string
 *                 enum: [small, medium, large]
 *               pricePerMonth:
 *                 type: number
 *     responses:
 *       201:
 *         description: Listing created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only owners can create listings
 */
listingsRouter.post(
  '/',
  authenticate,
  authorize('owner', 'admin'),
  validate({ body: createListingSchema }),
  listingsController.create
);

/**
 * @swagger
 * /api/listings/{id}:
 *   put:
 *     summary: Update a listing
 *     tags: [Listings]
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
 *         description: Listing updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Listing not found
 */
listingsRouter.put(
  '/:id',
  authenticate,
  validate({ params: listingIdParamsSchema, body: updateListingSchema }),
  listingsController.update
);

/**
 * @swagger
 * /api/listings/{id}:
 *   delete:
 *     summary: Delete a listing
 *     tags: [Listings]
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
 *       204:
 *         description: Listing deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Listing not found
 */
listingsRouter.delete(
  '/:id',
  authenticate,
  validate({ params: listingIdParamsSchema }),
  listingsController.delete
);

/**
 * @swagger
 * /api/listings/{id}/photos:
 *   post:
 *     summary: Upload a photo to a listing
 *     tags: [Listings]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Photo uploaded
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Listing not found
 */
listingsRouter.post(
  '/:id/photos',
  authenticate,
  validate({ params: listingIdParamsSchema }),
  uploadSingle,
  listingsController.addPhoto
);

/**
 * @swagger
 * /api/listings/{id}/photos/url:
 *   post:
 *     summary: Add a photo to a listing by URL (admin only)
 *     tags: [Listings]
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
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Photo added
 */
listingsRouter.post(
  '/:id/photos/url',
  authenticate,
  authorize('admin'),
  validate({
    params: listingIdParamsSchema,
    body: z.object({ url: z.string().url() }),
  }),
  listingsController.addPhotoByUrl
);

/**
 * @swagger
 * /api/listings/{id}/photos/{photoId}:
 *   delete:
 *     summary: Delete a photo from a listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Photo deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Photo not found
 */
listingsRouter.delete(
  '/:id/photos/:photoId',
  authenticate,
  validate({
    params: z.object({
      id: z.string().uuid(),
      photoId: z.string().uuid(),
    }),
  }),
  listingsController.deletePhoto
);
