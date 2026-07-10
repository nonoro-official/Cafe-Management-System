import { env } from '../config/env.js';

/**
 * Minimal structured logger. Kept dependency-free so it can be swapped for a
 * transport-based logger (pino, winston) later without touching call sites.
 */
const format = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] ${level.toUpperCase()} ${message}`;
  if (meta === undefined) {
    return base;
  }
  return `${base} ${typeof meta === 'string' ? meta : JSON.stringify(meta)}`;
};

export const logger = {
  info(message, meta) {
    console.log(format('info', message, meta));
  },
  warn(message, meta) {
    console.warn(format('warn', message, meta));
  },
  error(message, meta) {
    console.error(format('error', message, meta));
  },
  debug(message, meta) {
    if (!env.isProduction) {
      console.debug(format('debug', message, meta));
    }
  },
};
