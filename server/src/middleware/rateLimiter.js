import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const standardOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  // Disable limiting in test runs so it never interferes with automated checks.
  skip: () => env.isTest,
};

/**
 * General-purpose limiter applied to the whole API surface.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later' },
  ...standardOptions,
});

/**
 * Stricter limiter for authentication endpoints to slow down credential
 * stuffing and brute-force attempts.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many authentication attempts, please try again later' },
  ...standardOptions,
});
