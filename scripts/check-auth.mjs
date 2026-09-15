import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';

// Non-destructive smoke checks: no signup, outgoing email, or user mutation.
const origin = process.env.AUTH_TEST_ORIGIN ?? 'http://localhost:3010';
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
assert.equal(target.searchParams.get('error'), 'callback');
console.log('PASS invalid callback stays on local error route');

if (process.env.AUTH_TEST_REMOTE === '1') {
  const env = {
    ...parseEnv(await readFile('.env.local', 'utf8')),
    ...process.env,
  };
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
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
