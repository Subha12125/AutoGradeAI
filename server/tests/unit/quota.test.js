const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const QuotaModel = require('../../src/models/quota.model');

describe('Hardcore Quota & Subscription Model Tests', () => {
  test('QuotaModel exposes required methods including invalidate', () => {
    assert.equal(typeof QuotaModel.checkQuota, 'function');
    assert.equal(typeof QuotaModel.getSubscription, 'function');
    assert.equal(typeof QuotaModel.applyPromo, 'function');
    assert.equal(typeof QuotaModel.invalidate, 'function');
  });

  test('QuotaModel.invalidate clears user cache without throwing', () => {
    assert.doesNotThrow(() => {
      QuotaModel.invalidate('test-user-id');
      QuotaModel.invalidate(); // clear all
    });
  });

  test('getLimit returns free tier defaults when user has no active subscription', async () => {
    const originalGetSubscription = QuotaModel.getSubscription;
    QuotaModel.getSubscription = async () => null;

    try {
      const limitInfo = await QuotaModel.getLimit('user-without-sub');
      assert.equal(limitInfo.plan, 'free');
      assert.equal(limitInfo.limit, 3);
      assert.equal(limitInfo.isMonthly, false);
      assert.equal(limitInfo.subscription, null);
    } finally {
      QuotaModel.getSubscription = originalGetSubscription;
    }
  });

  test('getLimit returns plan limit when user has an active professional subscription', async () => {
    const originalGetSubscription = QuotaModel.getSubscription;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    QuotaModel.getSubscription = async () => ({
      plan: 'professional',
      daily_limit: 500,
      active: true,
      expires_at: futureDate.toISOString(),
    });

    try {
      const limitInfo = await QuotaModel.getLimit('user-with-pro-sub');
      assert.equal(limitInfo.plan, 'professional');
      assert.equal(limitInfo.limit, 500);
      assert.equal(limitInfo.isMonthly, true);
    } finally {
      QuotaModel.getSubscription = originalGetSubscription;
    }
  });

  test('checkQuota caches results for subsequent calls', async () => {
    const originalGetLimit = QuotaModel.getLimit;
    const originalGetTodayUsage = QuotaModel.getTodayUsage;

    let getTodayUsageCalls = 0;
    QuotaModel.getLimit = async () => ({ limit: 3, plan: 'free', isMonthly: false, subscription: null });
    QuotaModel.getTodayUsage = async () => {
      getTodayUsageCalls++;
      return 1;
    };

    const testUserId = 'cache-test-user-999';
    QuotaModel.invalidate(testUserId);

    try {
      const first = await QuotaModel.checkQuota(testUserId);
      assert.equal(first.remaining, 2);
      assert.equal(getTodayUsageCalls, 1);

      // Second call should return cached data without calling getTodayUsage again
      const second = await QuotaModel.checkQuota(testUserId);
      assert.equal(second.remaining, 2);
      assert.equal(getTodayUsageCalls, 1); // Still 1 call! 0ms cache hit

      // After invalidate, next call should re-fetch
      QuotaModel.invalidate(testUserId);
      const third = await QuotaModel.checkQuota(testUserId);
      assert.equal(third.remaining, 2);
      assert.equal(getTodayUsageCalls, 2); // Incremented
    } finally {
      QuotaModel.getLimit = originalGetLimit;
      QuotaModel.getTodayUsage = originalGetTodayUsage;
      QuotaModel.invalidate(testUserId);
    }
  });
});
