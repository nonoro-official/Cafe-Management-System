import mongoose from 'mongoose';

const READY_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Reports service liveness plus the current MongoDB connection state so that
 * container healthchecks and the admin UI reflect real dependency status
 * rather than always returning "ok".
 */
export const getHealthStatus = async () => {
  const dbState = READY_STATES[mongoose.connection.readyState] || 'unknown';
  const dbConnected = mongoose.connection.readyState === 1;

  return {
    status: dbConnected ? 'ok' : 'degraded',
    service: 'cafe-management-api',
    database: dbState,
    timestamp: new Date().toISOString(),
  };
};
