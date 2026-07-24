import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Trust the first proxy so client IPs (used by the rate limiter) are accurate
// behind reverse proxies such as Nginx or a cloud load balancer.
app.set('trust proxy', 1);

app.use(helmet());

// In the isolated-LAN deployment the SPAs and API are served from a single
// origin behind nginx, so CORS is never triggered. The allowlist still matters
// for local development, where the customer/admin dev servers run on separate
// ports. Disallowed origins are rejected cleanly (no thrown 500).
const allowedOrigins = [env.clientUrl, env.adminUrl];

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (!env.isProduction) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cafe Management System API',
    documentation: '/api/health',
  });
});

// Product/inventory images are stored on disk under server/public/images and
// referenced by the DB `image` field as `/api/images/...`. Mounting them under
// /api means the existing Vite (dev) and nginx (prod) proxies route them to the
// backend with no extra config. Registered before apiLimiter so image loads
// (many per page) are never rate-limited.
app.use(
  '/api/images',
  express.static(path.join(__dirname, '../public/images'), { maxAge: '30d' }),
);

app.use('/api', apiLimiter, routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
