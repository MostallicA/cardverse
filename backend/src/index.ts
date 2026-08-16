import 'dotenv/config';

import { createServer } from 'http';

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import v1Routes from './routes/v1/index.js';
import { initSocketIO } from './socket/index.js';

const app: Express = express();
const server = createServer(app);
const logger = console;

// Socket.IO initialization
initSocketIO(server);

// Middleware
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Small interfaces for safer typing in this file
interface AppConfig {
  version?: string;
  nodeEnv?: string;
  port?: number;
  corsOrigin?: string;
}

// CORS configuration with whitelist for production
const corsOptions: cors.CorsOptions = {
  origin: (incomingOrigin, cb) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!incomingOrigin) {
      return cb(null, true);
    }

    // In development, allow all origins
    if (config.nodeEnv === 'development') {
      return cb(null, true);
    }

    // In production, check against whitelist
    const whitelist = [config.corsOrigin];
    if (whitelist.includes(incomingOrigin)) {
      return cb(null, true);
    }

    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(limiter);

// Request timeout (30 seconds)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setTimeout(30000, () => {
    const timeoutError = new Error('Request timeout');
    interface ErrorWithStatus extends Error {
      status?: number;
    }
    (timeoutError as ErrorWithStatus).status = 503;
    next(timeoutError);
  });
  next();
});

// API Routes
app.use('/api/v1', v1Routes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  const appConfig = config as AppConfig;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: appConfig.version ?? 'unknown',
  });
});

// 404 handler
const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
};
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port || 3000;
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 Socket.IO ready on /socket.io`);
  logger.info(`🌐 Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, closing server...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { app, server };
