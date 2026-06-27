export const getHealthStatus = async () => {
  return {
    status: 'ok',
    service: 'cafe-management-api',
    timestamp: new Date().toISOString(),
  };
};
