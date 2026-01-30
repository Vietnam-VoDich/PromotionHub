import type { Request, Response, NextFunction } from 'express';
import { reviewsService } from '../services/reviews.service.js';
import { reviewFlowService } from '../services/review-flow.service.js';
import type { CreateReviewInput, UpdateReviewInput, ReviewsQuery } from '../schemas/reviews.schema.js';

interface AuthUser {
  userId: string;
  email: string;
  role: 'owner' | 'advertiser' | 'admin';
}

export const reviewsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const data = req.body as CreateReviewInput;
      const review = await reviewsService.create(data, user.userId);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  },

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as ReviewsQuery;
      const result = await reviewsService.findAll(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const review = await reviewsService.findById(id);
      res.json(review);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { id } = req.params;
      const data = req.body as UpdateReviewInput;
      const review = await reviewsService.update(id, data, user.userId, user.role);
      res.json(review);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { id } = req.params;
      const result = await reviewsService.delete(id, user.userId, user.role);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getListingStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { listingId } = req.params;
      const stats = await reviewsService.getListingStats(listingId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Smart review submission with routing:
   * - 4-5 stars → Save + redirect to Google Reviews
   * - 1-3 stars → Save + offer WhatsApp support
   */
  async submitSmart(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { listingId, rating, comment } = req.body as CreateReviewInput;

      const result = await reviewFlowService.processReview({
        listingId,
        reviewerId: user.userId,
        rating,
        comment,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get review sentiment stats (for admin dashboard)
   */
  async getSentimentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { listingId } = req.query;
      const stats = await reviewFlowService.getReviewStats(listingId as string | undefined);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },
};
