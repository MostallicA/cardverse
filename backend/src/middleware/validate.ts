/**
 * Request validation middleware
 * Follows API.md Input Validation standards
 * All requests must be validated before reaching business logic
 */

import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response.js';

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
}

export interface ValidationSchema {
  body?: Record<string, ValidationRule>;
  query?: Record<string, ValidationRule>;
  params?: Record<string, ValidationRule>;
}

// Type for Joi-like schema - using any to avoid ESLint unused parameter error
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JoiLikeSchema = {
  validate: (data: any) => {
    error?: { details?: Array<{ message: string }> };
    value: any;
  };
};

/**
 * Check if schema is a Joi-like schema (has validate method)
 */
function isJoiLikeSchema(schema: unknown): schema is JoiLikeSchema {
  return typeof schema === 'object' && schema !== null && typeof (schema as Record<string, unknown>).validate === 'function';
}

export const validate = (schema: ValidationSchema | unknown, source?: 'body' | 'query' | 'params') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if schema is a Joi-like schema
    if (isJoiLikeSchema(schema)) {
      const requestData = source === 'params' ? req.params : source === 'query' ? req.query : req.body;
      const result = (schema as JoiLikeSchema).validate(requestData);
      if (result.error) {
        res.status(400).json(
          ResponseHelper.error('VALIDATION_ERROR', result.error.details?.[0]?.message || 'Validation failed')
        );
        return;
      }
      // Replace with validated data - using type assertion for Express compatibility
      if (source === 'params') {
        req.params = result.value as typeof req.params;
      } else if (source === 'query') {
        req.query = result.value as typeof req.query;
      } else {
        req.body = result.value as typeof req.body;
      }
      next();
      return;
    }

    // Custom ValidationSchema
    const errors: string[] = [];
    const customSchema = schema as ValidationSchema;
    const sources = source ? [source] : (['body', 'query', 'params'] as const);

    for (const src of sources) {
      const rules = customSchema[src];
      if (!rules) continue;

      const values = src === 'body' ? req.body : src === 'query' ? req.query : req.params;

      for (const field of Object.keys(rules)) {
        const rule = rules[field];
        const value = values[field];

        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push(rule.message || `${field} is required`);
          continue;
        }

        if (rule.type && value !== undefined && value !== null) {
          if (rule.type === 'array' && !Array.isArray(value)) {
            errors.push(rule.message || `${field} must be an array`);
          } else if (rule.type !== 'array' && typeof value !== rule.type) {
            errors.push(rule.message || `${field} must be of type ${rule.type}`);
          }
        }

        if (rule.min !== undefined && value !== undefined) {
          if (typeof value === 'string' && value.length < rule.min) {
            errors.push(rule.message || `${field} must be at least ${rule.min} characters`);
          } else if (typeof value === 'number' && value < rule.min) {
            errors.push(rule.message || `${field} must be at least ${rule.min}`);
          }
        }

        if (rule.max !== undefined && value !== undefined) {
          if (typeof value === 'string' && value.length > rule.max) {
            errors.push(rule.message || `${field} must be at most ${rule.max} characters`);
          } else if (typeof value === 'number' && value > rule.max) {
            errors.push(rule.message || `${field} must be at most ${rule.max}`);
          }
        }

        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          errors.push(rule.message || `${field} format is invalid`);
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json(ResponseHelper.error('VALIDATION_ERROR', 'Validation failed', errors));
      return;
    }

    next();
  };
};