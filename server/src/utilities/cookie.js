import { env } from '../config/env.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const baseOptions = () => ({
  httpOnly: true,
  secure: env.cookie.secure,
  sameSite: env.cookie.sameSite,
  path: '/',
});

export const setAuthCookie = (res, token) => {
  res.cookie(env.jwt.cookieName, token, { ...baseOptions(), maxAge: SEVEN_DAYS_MS });
};

export const clearAuthCookie = (res) => {
  res.clearCookie(env.jwt.cookieName, baseOptions());
};
