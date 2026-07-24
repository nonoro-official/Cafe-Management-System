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

/**
 * Guards the public (unauthenticated) kiosk ordering endpoint against abuse
 * while still allowing a busy kiosk to submit orders at a natural pace.
 */
export const kioskOrderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many kiosk orders in a short time, please wait a moment' },
  ...standardOptions,
});
