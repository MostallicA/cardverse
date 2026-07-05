// CardVerse Backend Entry Point

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { APP_NAME, APP_VERSION } from '@cardverse/shared';

import { config } from './config/index.js';
import { logger, requestLogger } from './middleware/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const port = config.port;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(compression());
app.use(logger);
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: APP_NAME,
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to CardVerse API',
    version: APP_VERSION,
    endpoints: {
      health: '/health',
      api: config.apiPrefix,
    },
  });
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(
    '\x1b[32m%s\x1b[0m',
    '\u2714 ' + APP_NAME + ' v' + APP_VERSION + ' - Backend Service'
  );
  console.log('\x1b[36m%s\x1b[0m', '\u25B6 Server running on http://localhost:' + port);
  console.log('\x1b[36m%s\x1b[0m', '\u25B6 Health check: http://localhost:' + port + '/health');
  console.log('\x1b[36m%s\x1b[0m', '\u25B6 Environment: ' + config.nodeEnv);
});
