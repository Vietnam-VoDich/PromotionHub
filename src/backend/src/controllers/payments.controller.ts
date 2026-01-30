import type { Request, Response, NextFunction } from 'express';
import { paymentsService } from '../services/payments.service.js';
import type {
  CreatePaymentInput,
  PaymentWebhookInput,
  PaymentIdParams,
} from '../schemas/payments.schema.js';

export const paymentsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await paymentsService.create(req.body as CreatePaymentInput);
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as PaymentIdParams;
      const payment = await paymentsService.findById(id);
      res.json(payment);
    } catch (error) {
      next(error);
    }
  },

  async findByBookingId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params as { bookingId: string };
      const payments = await paymentsService.findByBookingId(bookingId);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  },

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await paymentsService.handleWebhook(req.body as PaymentWebhookInput);
      res.json({ success: true, payment });
    } catch (error) {
      next(error);
    }
  },

  async checkStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as PaymentIdParams;
      const payment = await paymentsService.checkAndUpdateStatus(id);
      res.json(payment);
    } catch (error) {
      next(error);
    }
  },
};
