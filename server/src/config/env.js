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

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 5000),
  mongodbUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:5174',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: process.env.JWT_COOKIE_NAME || 'cms_token',
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
  },
};
