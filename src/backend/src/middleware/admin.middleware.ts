import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './authenticate.js';

/**
 * Middleware to check if user is admin
 * Must be used after authenticate middleware
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user) {
    res.status(401).json({ error: 'Non authentifié' });
    return;
  }

  if (authReq.user.role !== 'admin') {
    res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    return;
  }

  next();
}
