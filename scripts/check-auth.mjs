import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';

// Non-destructive smoke checks: no signup, outgoing email, or user mutation.
const origin = process.env.AUTH_TEST_ORIGIN ?? 'http://localhost:3010';
let serverReachable = false;
try {
  await fetch(origin, { signal: AbortSignal.timeout(2000) });
  serverReachable = true;
} catch {
  console.log(
    `INFO: Server at ${origin} is not running. Skipped live auth route checks.`,
  );
}

if (serverReachable) {
  const request = (path, options = {}) =>
    fetch(new URL(path, origin), {
      redirect: 'manual',
      signal: AbortSignal.timeout(30000),
      ...options,
    });
  for (const path of ['/login', '/signup', '/forgot-password']) {
    const response = await request(path);
    assert.equal(response.status, 200, `${path} must render`);
    assert.match(response.headers.get('cache-control') ?? '', /no-store/);
    console.log(`PASS ${path}: renders with private cache policy`);
  }
  for (const [path, destination] of [
    ['/account', '/login'],
    ['/reset-password', '/forgot-password'],
  ]) {
    const response = await request(path);
    assert.equal(response.status, 307);
    assert.equal(
      new URL(response.headers.get('location'), origin).pathname,
      destination,
    );
    console.log(`PASS ${path}: anonymous access rejected`);
  }
  const forged = await request('/account', {
    headers: {
      cookie:
        'sb-njrbrhkxpsbqehlpcfdy-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJmYWtlIn0',
    },
  });
  assert.equal(forged.status, 307);
  assert.equal(
    new URL(forged.headers.get('location'), origin).pathname,
    '/login',
  );
  console.log('PASS forged session cannot access account');
  const callback = await request('/auth/callback?next=https://example.com');
  assert.equal(callback.status, 307);
  const target = new URL(callback.headers.get('location'), origin);
  assert.equal(target.origin, origin);
  assert.equal(target.pathname, '/login');
  console.log('PASS invalid callback stays on local error route');

  // Verify Auth API endpoints
  const emptyLogin = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(emptyLogin.status, 400);

  const emptySignup = await request('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(emptySignup.status, 400);

  const emptyForgot = await request('/api/auth/forgot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(emptyForgot.status, 400);

  const emptyOtp = await request('/api/auth/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(emptyOtp.status, 400);

  const signoutRes = await request('/api/auth/signout', {
    method: 'POST',
  });
  assert.equal(signoutRes.status, 200);
  const signoutJson = await signoutRes.json();
  assert.equal(signoutJson.success, true);
  console.log('PASS auth API endpoints input validation and signout');
}

if (process.env.AUTH_TEST_REMOTE === '1') {
  let localEnv = {};
  try {
    localEnv = parseEnv(await readFile('.env.local', 'utf8'));
  } catch {}
  const env = {
    ...localEnv,
    ...process.env,
  };
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL || 'https://njrbrhkxpsbqehlpcfdy.supabase.co',
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      'sb_publishable_U6YCeKfVJaVxQokPzOlZLw_SdXgeAST',
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `apexa-auth-check-${randomUUID()}@example.invalid`,
    password: randomUUID(),
  });
  assert.equal(error?.code, 'invalid_credentials');
  assert.equal(data.session, null);
  console.log(
    'PASS live Supabase rejects invalid credentials without creating a session',
  );
}
