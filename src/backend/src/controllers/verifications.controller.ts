import type { Request, Response, NextFunction } from 'express';
import { verificationsService } from '../services/verifications.service.js';
import type {
  CreateVerificationPhotoInput,
  UpdateVerificationStatusInput,
  VerificationsQuery,
} from '../schemas/verifications.schema.js';

interface AuthUser {
  userId: string;
  email: string;
  role: 'owner' | 'advertiser' | 'admin';
}

export const verificationsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const data = req.body as CreateVerificationPhotoInput;
      const verification = await verificationsService.create(data, user.userId);
      res.status(201).json(verification);
    } catch (error) {
      next(error);
    }
  },

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const query = req.query as unknown as VerificationsQuery;
      const result = await verificationsService.findAll(query, user.userId, user.role);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { id } = req.params;
      const verification = await verificationsService.findById(id, user.userId, user.role);
      res.json(verification);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { id } = req.params;
      const data = req.body as UpdateVerificationStatusInput;
      const verification = await verificationsService.updateStatus(id, data, user.userId, user.role);
      res.json(verification);
    } catch (error) {
      next(error);
    }
  },

  async getBookingVerifications(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { bookingId } = req.params;
      const verifications = await verificationsService.getBookingVerifications(
        bookingId,
        user.userId,
        user.role
      );
      res.json(verifications);
    } catch (error) {
      next(error);
    }
  },
};
