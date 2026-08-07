import { Request, Response } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (err: AppError, _req: Request, res: Response) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  console.error('[ERROR] ' + err.message);

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message,
      status: status,
      statusCode: statusCode,
    },
  });
};
