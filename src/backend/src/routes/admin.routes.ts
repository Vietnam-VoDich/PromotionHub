import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { adminController } from '../controllers/admin.controller.js';
import { validate } from '../middleware/validate.js';
import {
  adminUsersQuerySchema,
  adminUpdateUserSchema,
  adminListingsQuerySchema,
  adminStatsQuerySchema,
} from '../schemas/admin.schema.js';
import { z } from 'zod';

export const adminRouter = Router();

// all admin routes require admin role
adminRouter.use(authenticate, authorize('admin'));

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
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
 *         description: Dashboard statistics
 */
adminRouter.get(
  '/stats',
  validate({ query: adminStatsQuerySchema }),
  adminController.getDashboardStats
);

/**
 * @swagger
 * /api/admin/activity:
 *   get:
 *     summary: Get recent activity
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Recent activity
 */
adminRouter.get('/activity', adminController.getRecentActivity);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [owner, advertiser, admin]
 *       - in: query
 *         name: verified
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
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
 *         description: List of users
 */
adminRouter.get('/users', validate({ query: adminUsersQuerySchema }), adminController.getUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
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
 *         description: User details
 */
adminRouter.get(
  '/users/:id',
  validate({ params: z.object({ id: z.string().uuid() }) }),
  adminController.getUserById
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Admin]
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
 *               role:
 *                 type: string
 *                 enum: [owner, advertiser, admin]
 *               verified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 */
adminRouter.put(
  '/users/:id',
  validate({ params: z.object({ id: z.string().uuid() }), body: adminUpdateUserSchema }),
  adminController.updateUser
);

/**
 * @swagger
 * /api/admin/listings:
 *   get:
 *     summary: Get all listings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, booked]
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: List of listings
 */
adminRouter.get(
  '/listings',
  validate({ query: adminListingsQuerySchema }),
  adminController.getListings
);

/**
 * @swagger
 * /api/admin/listings/{id}/status:
 *   put:
 *     summary: Update listing status
 *     tags: [Admin]
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
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Listing status updated
 */
adminRouter.put(
  '/listings/:id/status',
  validate({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({ status: z.enum(['active', 'inactive']) }),
  }),
  adminController.updateListingStatus
);

/**
 * @swagger
 * /api/admin/verifications/pending:
 *   get:
 *     summary: Get pending verifications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Pending verifications
 */
adminRouter.get('/verifications/pending', adminController.getPendingVerifications);
