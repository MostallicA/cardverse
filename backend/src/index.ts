import { createServer } from 'http';

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import v1Routes from './routes/v1';
import { initSocketIO } from './socket';

const app: Express = express();
const server = createServer(app);
const logger = console;

// Socket.IO initialization
initSocketIO(server);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1', v1Routes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: (config as any).version ?? 'unknown',
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
