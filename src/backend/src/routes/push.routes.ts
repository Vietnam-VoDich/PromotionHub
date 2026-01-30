import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { pushController } from '../controllers/push.controller.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

export const pushRouter = Router();

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

/**
 * @swagger
 * /api/push/vapid-key:
 *   get:
 *     summary: Get VAPID public key for push subscription
 *     tags: [Push Notifications]
 *     responses:
 *       200:
 *         description: VAPID public key
 */
pushRouter.get('/vapid-key', pushController.getVapidPublicKey);

/**
 * @swagger
 * /api/push/subscribe:
 *   post:
 *     summary: Subscribe to push notifications
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endpoint
 *               - keys
 *             properties:
 *               endpoint:
 *                 type: string
 *               keys:
 *                 type: object
 *                 properties:
 *                   p256dh:
 *                     type: string
 *                   auth:
 *                     type: string
 *     responses:
 *       201:
 *         description: Subscribed successfully
 */
pushRouter.post(
  '/subscribe',
  authenticate,
  validate({ body: subscriptionSchema }),
  pushController.subscribe
);

/**
 * @swagger
 * /api/push/unsubscribe:
 *   post:
 *     summary: Unsubscribe from push notifications
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endpoint
 *             properties:
 *               endpoint:
 *                 type: string
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 */
pushRouter.post(
  '/unsubscribe',
  authenticate,
  validate({ body: z.object({ endpoint: z.string() }) }),
  pushController.unsubscribe
);

/**
 * @swagger
 * /api/push/broadcast:
 *   post:
 *     summary: Broadcast notification to all users (admin only)
 *     tags: [Push Notifications]
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
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Broadcast sent
 */
pushRouter.post(
  '/broadcast',
  authenticate,
  authorize('admin'),
  validate({
    body: z.object({
      title: z.string().min(1),
      body: z.string().min(1),
      url: z.string().optional(),
    }),
  }),
  pushController.broadcast
);
