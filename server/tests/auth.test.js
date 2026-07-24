import { describe, it, expect } from 'vitest';
import { api, registerCustomer } from './helpers.js';

describe('auth', () => {
  it('registers a new customer and returns a token', async () => {
    const { res, token } = await registerCustomer();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(token).toBeTruthy();
    expect(res.body.data.user.email).toBe('customer@test.io');
    expect(res.body.data.user.role).toBe('customer');
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('rejects a weak password', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ name: 'Weak', email: 'weak@test.io', password: 'short' });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects a duplicate email', async () => {
    await registerCustomer();
    const { res } = await registerCustomer();
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('logs in with valid credentials and rejects wrong ones', async () => {
    await registerCustomer({ email: 'login@test.io' });

    const ok = await api()
      .post('/api/auth/login')
      .send({ email: 'login@test.io', password: 'Password1' });
    expect(ok.status).toBe(200);
    expect(ok.body.data.token).toBeTruthy();

    const bad = await api()
      .post('/api/auth/login')
      .send({ email: 'login@test.io', password: 'WrongPass1' });
    expect(bad.status).toBe(401);
  });

  it('protects /api/auth/me', async () => {
    const anon = await api().get('/api/auth/me');
    expect(anon.status).toBe(401);

    const { token } = await registerCustomer({ email: 'me@test.io' });
    const res = await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('me@test.io');
  });
});
