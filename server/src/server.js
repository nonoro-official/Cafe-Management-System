import mongoose from 'mongoose';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utilities/logger.js';

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(env.port, () => {
      logger.info(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    });

    // Graceful shutdown: Docker/orchestrators send SIGTERM on stop, terminals
    // send SIGINT (Ctrl+C). Stop accepting new connections, then close the DB
    // so in-flight writes are not cut off mid-operation.
    const shutdown = (signal) => {
      logger.info(`${signal} received, shutting down gracefully`);
      server.close(() => {
        mongoose.connection
          .close(false)
          .then(() => {
            logger.info('HTTP server and MongoDB connection closed');
            process.exit(0);
          })
          .catch((error) => {
            logger.error('Error during shutdown', { message: error.message });
            process.exit(1);
          });
      });

      // Failsafe: force-exit if graceful close hangs.
      setTimeout(() => {
        logger.error('Graceful shutdown timed out, forcing exit');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', { message: error.message });
    process.exit(1);
  }
};

startServer();
