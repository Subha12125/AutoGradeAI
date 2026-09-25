const logger = require('../utils/logger');

/**
 * Global error handling middleware.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum 10MB allowed.' });
  }

  // Multer file count error
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json({ error: 'Too many files. Maximum 50 allowed.' });
  }

  // Multer filter error
  if (err.message && err.message.includes('not allowed')) {
    return res.status(415).json({ error: err.message });
  }

  // Supabase errors
  if (err.code && err.code.startsWith('PGRST')) {
    return res.status(400).json({ error: 'Database error', details: err.message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || (statusCode === 500 ? 'Internal server error' : 'Request failed'),
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
