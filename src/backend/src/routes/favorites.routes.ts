import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/authenticate.js';
import { favoritesService } from '../services/favorites.service.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

export const favoritesRouter = Router();

const listingIdSchema = z.object({
  listingId: z.string().uuid(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const checkFavoritesSchema = z.object({
  listingIds: z.array(z.string().uuid()).min(1).max(100),
});

// Helper to get user ID from request
const getUserId = (req: Request): string => (req as AuthenticatedRequest).user.userId;

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get user's favorite listings
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 */
favoritesRouter.get(
  '/',
  authenticate,
  validate({ query: paginationSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query as unknown as { page: number; limit: number };
      const result = await favoritesService.getUserFavorites(getUserId(req), { page, limit });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/favorites/ids:
 *   get:
 *     summary: Get list of favorite listing IDs
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 */
favoritesRouter.get(
  '/ids',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ids = await favoritesService.getFavoriteIds(getUserId(req));
      res.json({ favoriteIds: ids });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/favorites/check:
 *   post:
 *     summary: Check if listings are favorited
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 */
favoritesRouter.post(
  '/check',
  authenticate,
  validate({ body: checkFavoritesSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { listingIds } = req.body;
      const result = await favoritesService.checkFavorites(getUserId(req), listingIds);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/favorites/{listingId}:
 *   get:
 *     summary: Check if a listing is favorited
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 */
favoritesRouter.get(
  '/:listingId',
  authenticate,
  validate({ params: listingIdSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const favorited = await favoritesService.isFavorited(getUserId(req), req.params.listingId);
      res.json({ favorited });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/favorites/{listingId}:
 *   post:
 *     summary: Add listing to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 */
favoritesRouter.post(
  '/:listingId',
  authenticate,
  validate({ params: listingIdSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await favoritesService.addFavorite(getUserId(req), req.params.listingId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/favorites/{listingId}:
 *   delete:
 *     summary: Remove listing from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 */
favoritesRouter.delete(
  '/:listingId',
  authenticate,
  validate({ params: listingIdSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await favoritesService.removeFavorite(getUserId(req), req.params.listingId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/favorites/{listingId}/toggle:
 *   post:
 *     summary: Toggle favorite status
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 */
favoritesRouter.post(
  '/:listingId/toggle',
  authenticate,
  validate({ params: listingIdSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await favoritesService.toggleFavorite(getUserId(req), req.params.listingId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);
