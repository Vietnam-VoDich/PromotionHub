import type { Request, Response, NextFunction } from 'express';
import { usersService } from '../services/users.service.js';
import type { UpdateUserInput, UserIdParams } from '../schemas/users.schema.js';
import type { Role } from '@prisma/client';

interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

export const usersController = {
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const result = await usersService.getUserById(user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req: Request<UserIdParams>, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await usersService.getUserById(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateUser(
    req: Request<UserIdParams, unknown, UpdateUserInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const result = await usersService.updateUser(req.params.id, req.body, user.userId, user.role);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
