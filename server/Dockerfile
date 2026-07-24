# API image — Express + Mongoose
FROM node:22-alpine

WORKDIR /app

# Install production dependencies against the lockfile first for better caching.
# `npm ci` is preferred for reproducibility; fall back to `npm install` if the
# lockfile hasn't been regenerated after dependency changes yet.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY src ./src

ENV NODE_ENV=production
EXPOSE 5000

# Run as the unprivileged built-in user.
USER node

# Node receives SIGTERM as PID 1 and shuts down gracefully (see src/server.js).
CMD ["node", "src/server.js"]
