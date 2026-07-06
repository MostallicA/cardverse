// User Management Validators
// Request validation schemas for user endpoints
// Follows API.md Input Validation standards

import { ValidationSchema } from '../../middleware/validate.js';

export const updateProfileSchema: ValidationSchema = {
  body: {
    username: {
      required: false,
      type: 'string',
      min: 3,
      max: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
      message: 'Username must be 3-20 characters (letters, numbers, underscores only)',
    },
    avatar: {
      required: false,
      type: 'string',
      message: 'Avatar must be a string',
    },
    avatarFrame: {
      required: false,
      type: 'string',
      message: 'Avatar frame must be a string',
    },
    countryFlag: {
      required: false,
      type: 'string',
      min: 2,
      max: 2,
      message: 'Country flag must be a 2-letter code',
    },
  },
};

export const searchUsersSchema: ValidationSchema = {
  query: {
    username: {
      required: false,
      type: 'string',
      message: 'Username search term must be a string',
    },
  },
};
