const { PORT } = require('./config/env');
const app = require('./app');
const logger = require('./utils/logger');
const { ensureQuotaTables } = require('./config/setupQuota');

app.listen(PORT, async () => {
  logger.info(`🚀 AutoGrade Ai server running on port ${PORT}`);
  logger.info(`📡 Health check: http://localhost:${PORT}/api/health`);
  await ensureQuotaTables();
});
