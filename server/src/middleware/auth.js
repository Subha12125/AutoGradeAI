const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { JWT_SECRET } = require('../config/env');
const logger = require('../utils/logger');

// In-memory cache for user sessions (5 min TTL) to avoid hitting Supabase on every single HTTP request
const userCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Authentication middleware - verifies JWT token.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      // Support token via query param for SSE (EventSource can't set headers)
      token = req.query.token;
    }

    if (!token) {
      logger.warn('Authentication failed: No token provided');
      return res.status(401).json({ error: 'No token provided', message: 'Authentication required. Please log in.' });
    }
    
    // Verify JWT token signed by our server
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload', message: 'Session invalid. Please log in again.' });
    }

    // Check fast in-memory cache first (0ms latency, immune to Supabase drops)
    const cached = userCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      req.user = cached.user;
      return next();
    }

    // Query database for current user details
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', userId)
      .maybeSingle();

    if (user) {
      // Cache valid user for 5 minutes
      userCache.set(userId, {
        user,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      req.user = user;
      return next();
    }

    // If Supabase has a network or connection error (not just user not found)
    if (error) {
      logger.warn(`Supabase lookup error during auth for user ${userId}: ${error.message}. Falling back to verified JWT claims.`);
      // If we have verified token claims from a cryptographically valid JWT, fall back to them
      if (decoded.email || decoded.name || decoded.role) {
        const fallbackUser = {
          id: userId,
          email: decoded.email || '',
          name: decoded.name || 'User',
          role: decoded.role || 'faculty',
        };
        req.user = fallbackUser;
        return next();
      }
      return res.status(503).json({ error: 'Authentication service temporarily unavailable', message: 'Unable to verify session due to a temporary service issue. Please try again.' });
    }

    // User was explicitly not found in DB
    logger.error('User not found for token', { userId });
    return res.status(401).json({ error: 'User not found', message: 'User account not found. Please log in again.' });
  } catch (err) {
    logger.error('Auth middleware error', { error: err.message });

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', message: 'Your session has expired. Please log in again.' });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token', message: 'Invalid session token. Please log in again.' });
    }

    return res.status(401).json({ error: 'Authentication failed', message: 'Authentication failed. Please log in again.' });
  }
}

/**
 * Role-based authorization middleware.
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

/**
 * Optional authentication middleware - attaches req.user if valid token provided, but does not block if absent.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) return next();

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    if (userId) {
      const cached = userCache.get(userId);
      if (cached && cached.expiresAt > Date.now()) {
        req.user = cached.user;
      } else {
        const { data: user } = await supabase.from('users').select('id, email, name, role').eq('id', userId).maybeSingle();
        if (user) {
          userCache.set(userId, { user, expiresAt: Date.now() + CACHE_TTL_MS });
          req.user = user;
        } else if (decoded.email) {
          req.user = { id: userId, email: decoded.email, name: decoded.name || 'User', role: decoded.role || 'student' };
        }
      }
    }
  } catch {
    // Ignore invalid tokens in optional auth
  }
  next();
}

module.exports = { authenticate, authorize, optionalAuth };
