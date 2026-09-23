const QuotaModel = require('../models/quota.model');
const logger = require('../utils/logger');

const FREE_DAILY_LIMIT = 3;

/**
 * GET /api/quota
 * Get current user's quota status.
 */
async function getQuota(req, res, next) {
  try {
    const quota = await QuotaModel.checkQuota(req.user.id);
    const subscription = quota.subscription;

    res.json({
      ...quota,
      plan: quota.plan || (subscription ? subscription.plan : 'free'),
      subscribed: !!subscription,
      expiresAt: quota.expiresAt || subscription?.expires_at || null,
    });
  } catch (err) {
    // If tables don't exist yet, return free tier defaults
    if (err.code === '42P01' || err.message?.includes('relation') ) {
      logger.warn('Quota tables missing — returning free tier defaults');
      return res.json({
        allowed: true,
        used: 0,
        limit: FREE_DAILY_LIMIT,
        remaining: FREE_DAILY_LIMIT,
        plan: 'free',
        subscribed: false,
        expiresAt: null,
      });
    }
    next(err);
  }
}

/**
 * POST /api/quota/promo
 * Apply a promo code.
 */
async function applyPromo(req, res, next) {
  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    const result = await QuotaModel.applyPromo(req.user.id, code.trim());

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    logger.info(`Promo ${code} applied for user ${req.user.id}`);
    res.json(result);
  } catch (err) {
    if (err.code === '42P01' || err.message?.includes('relation')) {
      return res.status(503).json({ 
        error: 'Promo system not set up yet. Run the migration SQL in Supabase SQL Editor.',
        migration: 'server/migrations/002_quota_subscriptions.sql'
      });
    }
    next(err);
  }
}

module.exports = { getQuota, applyPromo };
