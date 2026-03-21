import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AuthRequest } from './authMiddleware';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const tenantId = (req as AuthRequest).user?.tenantId;

    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ...(tenantId && { tenantId }),
    });
  });

  next();
};
