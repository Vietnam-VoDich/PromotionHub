import type { Request, Response, NextFunction } from 'express';
import { pushService } from '../services/push.service.js';
import type { Role } from '@prisma/client';

interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

interface SubscriptionBody {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const pushController = {
  async getVapidPublicKey(_req: Request, res: Response): Promise<void> {
    const key = pushService.getVapidPublicKey();
    if (!key) {
      res.status(503).json({ error: 'Push notifications not configured' });
      return;
    }
    res.json({ publicKey: key });
  },

  async subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const subscription = req.body as SubscriptionBody;

      await pushService.subscribe(user.userId, subscription);
      res.status(201).json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  async unsubscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { endpoint } = req.body as { endpoint: string };
      await pushService.unsubscribe(endpoint);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  // admin only: send broadcast notification
  async broadcast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, body, url } = req.body as { title: string; body: string; url?: string };

      const count = await pushService.broadcast({ title, body, url });
      res.json({ success: true, sentCount: count });
    } catch (error) {
      next(error);
    }
  },
};
