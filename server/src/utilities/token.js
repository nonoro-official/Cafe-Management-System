import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Signs a JWT for an authenticated principal.
 *
 * @param {{ id: string, role: string }} payload
 * @returns {string}
 */
export const signToken = (payload) =>
  jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

/**
 * Verifies and decodes a JWT, throwing on invalid/expired tokens.
 *
 * @param {string} token
 * @returns {{ id: string, role: string, iat: number, exp: number }}
 */
export const verifyToken = (token) => jwt.verify(token, env.jwt.secret);
