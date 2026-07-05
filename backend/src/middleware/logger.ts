import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';

// Morgan logger middleware
export const logger = morgan('combined');

// Custom request logger
export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.log('[' + new Date().toISOString() + '] ' + req.method + ' ' + req.path);
  next();
};
