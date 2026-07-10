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

const app = express();

// Trust the first proxy so client IPs (used by the rate limiter) are accurate
// behind reverse proxies such as Nginx or a cloud load balancer.
app.set('trust proxy', 1);

app.use(helmet());

const allowedOrigins = [env.clientUrl, env.adminUrl];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
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

app.use('/api', apiLimiter, routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
