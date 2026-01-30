import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import type { Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: Role;
  };
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No authorization header');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedError('Invalid authorization format');
    }

    const payload = authService.verifyAccessToken(token);

    (req as AuthenticatedRequest).user = payload;

    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return next(new UnauthorizedError('Not authenticated'));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}
