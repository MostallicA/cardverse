// CardVerse Backend Entry Point

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { APP_NAME, APP_VERSION } from '@cardverse/shared';

import { config } from './config/index.js';
import { logger, requestLogger } from './middleware/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import v1Routes from './routes/v1/index.js';

const app: Express = express();
const port = config.port;

// Global Middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(compression());
app.use(logger);
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use(config.apiPrefix, v1Routes);

// Root redirect
app.get('/', (_req, res) => {
  res.json({
    message: `Welcome to ${APP_NAME} API`,
    version: APP_VERSION,
    documentation: '/api/v1',
    health: '/api/v1/health',
  });
});

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Server Startup
app.listen(port, () => {
  console.log('='.repeat(50));
  console.log(`${APP_NAME} v${APP_VERSION} - Backend Service`);
  console.log(`Server: http://localhost:${port}`);
  console.log(`Health: http://localhost:${port}/api/v1/health`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log('='.repeat(50));
});

export default app;
