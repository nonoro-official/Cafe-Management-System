import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { env } from './config/env.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

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

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
