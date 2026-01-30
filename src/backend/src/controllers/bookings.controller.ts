import type { Request, Response, NextFunction } from 'express';
import { bookingsService } from '../services/bookings.service.js';
import type {
  CreateBookingInput,
  UpdateBookingStatusInput,
  BookingsQuery,
  BookingIdParams,
} from '../schemas/bookings.schema.js';
import type { Role } from '@prisma/client';

interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

export const bookingsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const booking = await bookingsService.create(req.body as CreateBookingInput, user.userId);
      res.status(201).json(booking);
    } catch (error) {
      next(error);
    }
  },

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const result = await bookingsService.findAll(
        req.query as unknown as BookingsQuery,
        user.userId,
        user.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { id } = req.params as BookingIdParams;
      const booking = await bookingsService.findById(id, user.userId, user.role);
      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { id } = req.params as BookingIdParams;
      const { status } = req.body as UpdateBookingStatusInput;
      const booking = await bookingsService.updateStatus(id, status, user.userId, user.role);
      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  async signContract(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { id } = req.params as BookingIdParams;
      const booking = await bookingsService.signContract(id, user.userId);
      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  async getEarnings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const earnings = await bookingsService.getOwnerEarnings(user.userId);
      res.json(earnings);
    } catch (error) {
      next(error);
    }
  },
};
