const supabase = require('../config/supabase');

const FREE_DAILY_LIMIT = 3;

// Monthly evaluation limits per plan
const PLAN_LIMITS = {
  starter: 150,
  professional: 500,
  advanced: 1200,
};

// In-memory cache for user quota status (30s TTL) to eliminate redundant Supabase queries
const quotaCache = new Map();
const QUOTA_CACHE_TTL = 30 * 1000;

const QuotaModel = {
  /**
   * Invalidate cached quota for a user.
   */
  invalidate(userId) {
    if (userId) {
      quotaCache.delete(userId);
    } else {
      quotaCache.clear();
    }
  },

  /**
   * Get today's usage count for a user.
   * Counts evaluations created today for exams owned by this user.
   */
  async getTodayUsage(userId) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    try {
      // Get user's exam IDs
      const { data: exams, error: examErr } = await supabase
        .from('exams')
        .select('id')
        .eq('created_by', userId);

      if (examErr || !exams || exams.length === 0) return 0;

      const examIds = exams.map(e => e.id);

      const { count, error } = await supabase
        .from('evaluations')
        .select('id', { count: 'exact', head: true })
        .in('exam_id', examIds)
        .gte('created_at', todayStart.toISOString());

      if (error) return 0;
      return count || 0;
    } catch {
      return 0;
    }
  },

  /**
   * Get user's subscription info.
   * Returns { plan, promoApplied, expiresAt } or null if free tier.
   */
  async getSubscription(userId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Apply a promo code for a user.
   */
  async applyPromo(userId, code) {
    // Invalidate cached quota on change
    this.invalidate(userId);

    // Validate promo code
    const { data: promo, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .maybeSingle();

    if (promoError) throw promoError;
    if (!promo) return { success: false, message: 'Invalid or expired promo code' };

    // Check if already used by this user
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('promo_code', code.toUpperCase())
      .maybeSingle();

    if (existing) return { success: false, message: 'Promo code already used' };

    // Create subscription from promo
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (promo.duration_days || 30));

    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan: promo.plan || 'starter',
        promo_code: code.toUpperCase(),
        daily_limit: promo.daily_limit || 50,
        active: true,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (subError) throw subError;
    return { success: true, subscription: sub, message: `${promo.plan || 'Starter'} plan activated!` };
  },

  /**
   * Get this month's usage count for a user.
   */
  async getMonthUsage(userId) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    try {
      const { data: exams, error: examErr } = await supabase
        .from('exams')
        .select('id')
        .eq('created_by', userId);

      if (examErr || !exams || exams.length === 0) return 0;

      const examIds = exams.map(e => e.id);

      const { count, error } = await supabase
        .from('evaluations')
        .select('id', { count: 'exact', head: true })
        .in('exam_id', examIds)
        .gte('created_at', monthStart.toISOString());

      if (error) return 0;
      return count || 0;
    } catch {
      return 0;
    }
  },

  /**
   * Get limit for a user based on plan.
   * Free tier: 3 per day. Paid plans: monthly limit from PLAN_LIMITS.
   */
  async getLimit(userId) {
    const sub = await this.getSubscription(userId);
    if (sub && new Date(sub.expires_at) > new Date()) {
      return {
        limit: PLAN_LIMITS[sub.plan] || sub.daily_limit || 150,
        plan: sub.plan,
        isMonthly: true,
        subscription: sub,
      };
    }
    return { limit: FREE_DAILY_LIMIT, plan: 'free', isMonthly: false, subscription: null };
  },

  /**
   * Check if user can evaluate (has remaining quota).
   * Free tier: daily check. Paid plans: monthly check.
   * Returns { allowed, used, limit, remaining, plan, isMonthly, subscription, expiresAt }
   */
  async checkQuota(userId) {
    // Check in-memory cache first (0ms latency, immune to Supabase delay)
    const cached = quotaCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const limitInfo = await this.getLimit(userId);

    // Free tier uses daily usage, paid uses monthly
    const used = limitInfo.isMonthly
      ? await this.getMonthUsage(userId)
      : await this.getTodayUsage(userId);

    const result = {
      allowed: used < limitInfo.limit,
      used,
      limit: limitInfo.limit,
      remaining: Math.max(0, limitInfo.limit - used),
      plan: limitInfo.plan,
      isMonthly: limitInfo.isMonthly,
      subscription: limitInfo.subscription || null,
      expiresAt: limitInfo.subscription ? limitInfo.subscription.expires_at : null,
    };

    quotaCache.set(userId, {
      data: result,
      expiresAt: Date.now() + QUOTA_CACHE_TTL,
    });

    return result;
  },
};

module.exports = QuotaModel;
