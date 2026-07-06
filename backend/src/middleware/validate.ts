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

export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // Validate body
    if (schema.body) {
      Object.keys(schema.body).forEach((field) => {
        const rules = schema.body![field];
        const value = req.body[field];

        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push(rules.message || `${field} is required`);
        }

        if (rules.type && value !== undefined && value !== null) {
          if (rules.type === 'array') {
            if (!Array.isArray(value)) {
              errors.push(rules.message || `${field} must be an array`);
            }
          } else if (typeof value !== rules.type) {
            errors.push(rules.message || `${field} must be of type ${rules.type}`);
          }
        }

        if (rules.min !== undefined && value !== undefined) {
          if (typeof value === 'string' && value.length < rules.min) {
            errors.push(rules.message || `${field} must be at least ${rules.min} characters`);
          } else if (typeof value === 'number' && value < rules.min) {
            errors.push(rules.message || `${field} must be at least ${rules.min}`);
          }
        }

        if (rules.max !== undefined && value !== undefined) {
          if (typeof value === 'string' && value.length > rules.max) {
            errors.push(rules.message || `${field} must be at most ${rules.max} characters`);
          } else if (typeof value === 'number' && value > rules.max) {
            errors.push(rules.message || `${field} must be at most ${rules.max}`);
          }
        }

        if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
          errors.push(rules.message || `${field} format is invalid`);
        }
      });
    }

    // Validate query
    if (schema.query) {
      Object.keys(schema.query).forEach((field) => {
        const rules = schema.query![field];
        const value = req.query[field] as string;

        if (rules.required && !value) {
          errors.push(rules.message || `Query parameter ${field} is required`);
        }
      });
    }

    // Validate params
    if (schema.params) {
      Object.keys(schema.params).forEach((field) => {
        const rules = schema.params![field];
        const value = req.params[field];

        if (rules.required && !value) {
          errors.push(rules.message || `URL parameter ${field} is required`);
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
