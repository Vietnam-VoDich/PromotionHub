import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  logger.error({ err }, 'Error occurred');

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      statusCode: err.statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid request data',
      statusCode: 400,
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code?: string };
    if (prismaError.code === 'P2002') {
      res.status(409).json({
        error: 'ConflictError',
        message: 'A record with this value already exists',
        statusCode: 409,
      });
      return;
    }
    if (prismaError.code === 'P2025') {
      res.status(404).json({
        error: 'NotFoundError',
        message: 'Record not found',
        statusCode: 404,
      });
      return;
    }
  }

  // Default error
  res.status(500).json({
    error: 'InternalServerError',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    statusCode: 500,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
