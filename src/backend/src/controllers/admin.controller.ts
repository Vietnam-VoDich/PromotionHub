import type { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import type {
  AdminUsersQuery,
  AdminUpdateUserInput,
  AdminListingsQuery,
  AdminStatsQuery,
} from '../schemas/admin.schema.js';

export const adminController = {
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as AdminStatsQuery;
      const stats = await adminService.getDashboardStats(query);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as AdminUsersQuery;
      const result = await adminService.getUsers(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await adminService.getUserById(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as AdminUpdateUserInput;
      const user = await adminService.updateUser(id, data);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async getListings(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as AdminListingsQuery;
      const result = await adminService.getListings(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateListingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body as { status: 'active' | 'inactive' };
      const listing = await adminService.updateListingStatus(id, status);
      res.json(listing);
    } catch (error) {
      next(error);
    }
  },

  async getPendingVerifications(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await adminService.getPendingVerifications(page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const activity = await adminService.getRecentActivity(limit);
      res.json(activity);
    } catch (error) {
      next(error);
    }
  },
};
