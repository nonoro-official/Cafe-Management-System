import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, fallback) => {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

export const env = {
  nodeEnv,
  port: toNumber(process.env.PORT, 5000),
  mongodbUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:5174',
  isProduction,
  isTest: nodeEnv === 'test',

  db: {
    maxRetries: toNumber(process.env.DB_MAX_RETRIES, 10),
    retryDelayMs: toNumber(process.env.DB_RETRY_DELAY_MS, 3000),
    serverSelectionTimeoutMs: toNumber(process.env.DB_SERVER_SELECTION_TIMEOUT_MS, 5000),
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: process.env.JWT_COOKIE_NAME || 'cms_token',
  },

  // Cookie security is decoupled from NODE_ENV so the app can run over plain
  // HTTP on an isolated LAN. Secure cookies require HTTPS; SameSite=None
  // requires Secure, so both default to a same-origin, HTTP-safe posture.
  cookie: {
    secure: toBoolean(process.env.COOKIE_SECURE, false),
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
  },

  bcryptSaltRounds: toNumber(process.env.BCRYPT_SALT_ROUNDS, 12),
  taxRate: toNumber(process.env.TAX_RATE, 0),

  business: {
    name: process.env.BUSINESS_NAME || 'Cafe Management System',
    address: process.env.BUSINESS_ADDRESS || '',
    phone: process.env.BUSINESS_PHONE || '',
    currency: process.env.BUSINESS_CURRENCY || 'USD',
  },

  seed: {
    adminName: process.env.SEED_ADMIN_NAME || 'Administrator',
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@cafe.test',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
    kioskName: process.env.SEED_KIOSK_NAME || 'Self-Service Kiosk',
    kioskEmail: process.env.SEED_KIOSK_EMAIL || 'kiosk@cafe.test',
    kioskPassword: process.env.SEED_KIOSK_PASSWORD || 'Kiosk123!',
  },
};
