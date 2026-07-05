// CardVerse Backend Entry Point

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { APP_NAME, APP_VERSION, DEFAULT_PORT } from '@cardverse/shared';

const app = express();
const port = process.env.PORT || DEFAULT_PORT;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: APP_NAME,
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CardVerse API',
    version: APP_VERSION,
    endpoints: {
      health: '/health',
    },
  });
});

// Start server
app.listen(port, () => {
  console.log(
    '\x1b[32m%s\x1b[0m',
    '\u2714 ' + APP_NAME + ' v' + APP_VERSION + ' - Backend Service'
  );
  console.log('\x1b[36m%s\x1b[0m', '\u25B6 Server running on http://localhost:' + port);
  console.log('\x1b[36m%s\x1b[0m', '\u25B6 Health check: http://localhost:' + port + '/health');
});
