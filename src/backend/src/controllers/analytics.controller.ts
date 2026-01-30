import type { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';

interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

export const analyticsController = {
  async getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await analyticsService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  async getBookingsTimeSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query as DateRangeQuery;
      const data = await analyticsService.getBookingsTimeSeries({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async getRevenueTimeSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query as DateRangeQuery;
      const data = await analyticsService.getRevenueTimeSeries({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async getUsersTimeSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query as DateRangeQuery;
      const data = await analyticsService.getUsersTimeSeries({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async getTopListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await analyticsService.getTopListings(limit);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async getQuartierStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getQuartierStats();
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async getUsersByRole(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getUsersByRole();
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async getBookingsByStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getBookingsByStatus();
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async getPaymentMethodStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getPaymentMethodStats();
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};
