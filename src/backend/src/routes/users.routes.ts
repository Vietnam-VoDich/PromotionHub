import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { usersController } from '../controllers/users.controller.js';
import { validate } from '../middleware/validate.js';
import { updateUserSchema, userIdParamsSchema } from '../schemas/users.schema.js';

export const usersRouter = Router();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
usersRouter.get('/me', authenticate, usersController.getCurrentUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User profile
 *       404:
 *         description: User not found
 */
usersRouter.get(
  '/:id',
  authenticate,
  validate({ params: userIdParamsSchema }),
  usersController.getUserById
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
usersRouter.put(
  '/:id',
  authenticate,
  validate({ params: userIdParamsSchema, body: updateUserSchema }),
  usersController.updateUser
);
