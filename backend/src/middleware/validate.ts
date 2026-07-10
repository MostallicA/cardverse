// Request validation middleware
// Follows API.md Input Validation standards
// All requests must be validated before reaching business logic

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

// Support both (schema) and (schema, source) signatures
export const validate = (schema: any, source?: 'body' | 'query' | 'params') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // If schema has a validate method (Joi schema)
    if (schema && typeof schema.validate === 'function') {
      const data = source === 'params' ? req.params : source === 'query' ? req.query : req.body;
      const { error, value } = schema.validate(data);
      if (error) {
        res
          .status(400)
          .json(
            ResponseHelper.error(
              'VALIDATION_ERROR',
              error.details?.[0]?.message || 'Validation failed'
            )
          );
        return;
      }
      // Replace with validated data
      if (source === 'params') req.params = value;
      else if (source === 'query') req.query = value;
      else req.body = value;
      next();
      return;
    }

    // If schema is our custom ValidationSchema
    const errors: string[] = [];

    // If source is specified, only validate that source
    const sourcesToValidate = source ? [source] : (['body', 'query', 'params'] as const);

    for (const src of sourcesToValidate) {
      const rules = (schema as ValidationSchema)[src];
      if (!rules) continue;

      const data = src === 'body' ? req.body : src === 'query' ? req.query : req.params;

      Object.keys(rules).forEach((field) => {
        const rule = rules[field];
        const value = data[field];

        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push(rule.message || `${field} is required`);
          return;
        }

        if (rule.type && value !== undefined && value !== null) {
          if (rule.type === 'array') {
            if (!Array.isArray(value)) {
              errors.push(rule.message || `${field} must be an array`);
            }
          } else if (typeof value !== rule.type) {
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
      });
    }

    if (errors.length > 0) {
      res.status(400).json(ResponseHelper.error('VALIDATION_ERROR', 'Validation failed', errors));
      return;
    }

    next();
  };
};
