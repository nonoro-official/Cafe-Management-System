import { getHealthStatus } from '../services/health.service.js';

export const getHealth = async (req, res) => {
  const health = await getHealthStatus();

  res.status(200).json({
    success: true,
    data: health,
  });
};
