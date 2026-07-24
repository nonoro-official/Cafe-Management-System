import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utilities/logger.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Connects to MongoDB with a bounded retry loop. In a Docker Compose setup the
 * API container frequently boots before Mongo is accepting connections, so a
 * few retries prevent an unnecessary crash-and-restart cycle.
 */
export const connectDatabase = async () => {
  mongoose.set('strictQuery', true);

  const maxAttempts = env.db.maxRetries;
  const delayMs = env.db.retryDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(env.mongodbUri, {
        serverSelectionTimeoutMS: env.db.serverSelectionTimeoutMs,
      });
      logger.info('MongoDB connected successfully');
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        logger.error(`MongoDB connection failed after ${maxAttempts} attempts`, {
          message: error.message,
        });
        throw error;
      }
      logger.warn(
        `MongoDB connection attempt ${attempt}/${maxAttempts} failed, retrying in ${delayMs}ms`,
        { message: error.message },
      );
      await sleep(delayMs);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('MongoDB connection error', { message: error.message });
});
