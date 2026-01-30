import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { messagesController } from '../controllers/messages.controller.js';
import { validate } from '../middleware/validate.js';
import {
  createMessageSchema,
  messagesQuerySchema,
  conversationParamsSchema,
  messageIdParamsSchema,
} from '../schemas/messages.schema.js';

export const messagesRouter = Router();

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *                 format: uuid
 *               bookingId:
 *                 type: string
 *                 format: uuid
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *       404:
 *         description: Recipient not found
 */
messagesRouter.post(
  '/',
  authenticate,
  validate({ body: createMessageSchema }),
  messagesController.create
);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get all conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 */
messagesRouter.get('/conversations', authenticate, messagesController.getConversations);

/**
 * @swagger
 * /api/messages/unread:
 *   get:
 *     summary: Get unread message count
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
messagesRouter.get('/unread', authenticate, messagesController.getUnreadCount);

/**
 * @swagger
 * /api/messages/conversation/{recipientId}:
 *   get:
 *     summary: Get conversation with a specific user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: bookingId
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
 *         description: Conversation messages
 */
messagesRouter.get(
  '/conversation/:recipientId',
  authenticate,
  validate({ params: conversationParamsSchema, query: messagesQuerySchema }),
  messagesController.getConversation
);

/**
 * @swagger
 * /api/messages/{id}/read:
 *   put:
 *     summary: Mark message as read
 *     tags: [Messages]
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
 *         description: Message marked as read
 */
messagesRouter.put(
  '/:id/read',
  authenticate,
  validate({ params: messageIdParamsSchema }),
  messagesController.markAsRead
);
