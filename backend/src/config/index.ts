// Configuration

import { DEFAULT_PORT } from '@cardverse/shared';

export const config = {
  port: process.env.PORT || DEFAULT_PORT,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  logLevel: process.env.LOG_LEVEL || 'info',
  apiPrefix: '/api/v1',
};
