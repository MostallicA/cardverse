/**
 * Controller Utilities
 * Helper functions for consistent controller responses
 */

import { Response } from 'express';

import { ResponseHelper } from './response.js';

/**
 * Send a success response with data and optional message
 */
export const sendSuccess = <T>(res: Response, data: T, message?: string): Response => {
  return res.status(200).json(ResponseHelper.success(data, message ? { message } : undefined));
};

/**
 * Send a created response with data and optional message
 */
export const sendCreated = <T>(res: Response, data: T, message?: string): Response => {
  return res.status(201).json(ResponseHelper.success(data, message ? { message } : undefined));
};

/**
 * Send an error response with status code
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  details?: unknown
): Response => {
  const codeMap: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
  };
  return res
    .status(statusCode)
    .json(ResponseHelper.error(codeMap[statusCode] || 'ERROR', message, details));
};

/**
 * Send a no content response
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).json(ResponseHelper.noContent());
};

/**
 * Get string from params (handles string | string[])
 */
export const getParamString = (param: string | string[] | undefined): string | undefined => {
  if (!param) return undefined;
  if (Array.isArray(param)) return param[0];
  return param;
};

/**
 * Get string from params (throws if undefined)
 */
export const getRequiredParamString = (
  param: string | string[] | undefined,
  name: string
): string => {
  const value = getParamString(param);
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};
