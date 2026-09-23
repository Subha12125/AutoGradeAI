const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../../src/app');

describe('Hardcore Backend API Integration Test Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('GET /api/health returns 200 OK with valid status and timestamp', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.ok(data.timestamp);
  });

  test('POST /api/auth/login rejects empty body with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error || data.message);
  });

  test('POST /api/auth/register rejects missing fields with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    assert.equal(res.status, 400);
  });

  test('Protected endpoint /api/exams rejects request with missing token (401)', async () => {
    const res = await fetch(`${baseUrl}/api/exams`);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.match(data.error || data.message, /token/i);
  });

  test('Protected endpoint /api/exams rejects invalid/malformed Bearer token (401)', async () => {
    const res = await fetch(`${baseUrl}/api/exams`, {
      headers: { Authorization: 'Bearer this-is-not-a-valid-jwt-token' },
    });
    assert.equal(res.status, 401);
  });

  test('GET 404 handler returns structured error for non-existent routes', async () => {
    const res = await fetch(`${baseUrl}/api/non-existent-endpoint-xyz`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.match(data.error, /not found/i);
  });
});
