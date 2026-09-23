const { PORT } = require('./config/env');
const app = require('./app');
const logger = require('./utils/logger');
const { ensureQuotaTables } = require('./config/setupQuota');

const port = PORT || process.env.PORT || 5000;

app.listen(port, '0.0.0.0', async () => {
  logger.info(`🚀 AutoGrade Ai server running on port ${port}`);
  logger.info(`📡 Health check: http://localhost:${port}/api/health`);
  try {
    await ensureQuotaTables();
  } catch (err) {
    logger.warn(`Quota tables initialization notice: ${err.message}`);
  }
});
