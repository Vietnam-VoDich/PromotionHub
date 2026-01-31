import 'dotenv/config';
import { createServer } from 'http';
import { app } from './app.js';
import { logger } from './utils/logger.js';
import { prisma } from './lib/prisma.js';
import { initializeSocket } from './socket/index.js';

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Create HTTP server
    const server = createServer(app);

    // Initialize Socket.io
    initializeSocket(server);

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API docs available at http://localhost:${PORT}/api/docs`);
      logger.info('WebSocket server ready');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

main();
