import type { Request, Response, NextFunction } from 'express';
import { messagesService } from '../services/messages.service.js';
import type { CreateMessageInput, MessagesQuery } from '../schemas/messages.schema.js';

interface AuthUser {
  userId: string;
  email: string;
  role: 'owner' | 'advertiser' | 'admin';
}

export const messagesController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const data = req.body as CreateMessageInput;
      const message = await messagesService.create(data, user.userId);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  },

  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const conversations = await messagesService.getConversations(user.userId);
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  },

  async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { recipientId } = req.params;
      const query = req.query as unknown as MessagesQuery;
      const result = await messagesService.getConversation(user.userId, recipientId, query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { id } = req.params;
      const message = await messagesService.markAsRead(id, user.userId);
      res.json(message);
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const result = await messagesService.getUnreadCount(user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
