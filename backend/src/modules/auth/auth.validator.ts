// Authentication Validators
// Request validation schemas for auth endpoints
// Follows API.md Input Validation standards

import { ValidationSchema } from '../../middleware/validate.js';

export const guestAuthSchema: ValidationSchema = {
  body: {
    deviceId: {
      required: true,
      type: 'string',
      min: 1,
      max: 255,
      message: 'deviceId is required and must be a string (1-255 characters)',
    },
  },
};

export const googleAuthSchema: ValidationSchema = {
  body: {
    idToken: {
      required: true,
      type: 'string',
      min: 1,
      message: 'idToken is required and must be a non-empty string',
    },
  },
};

export const upgradeSchema: ValidationSchema = {
  body: {
    deviceId: {
      required: true,
      type: 'string',
      min: 1,
      max: 255,
      message: 'deviceId is required and must be a string (1-255 characters)',
    },
    idToken: {
      required: true,
      type: 'string',
      min: 1,
      message: 'idToken is required and must be a non-empty string',
    },
  },
};
