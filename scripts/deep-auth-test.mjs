import assert from 'node:assert/strict';

const origin = process.env.AUTH_TEST_ORIGIN || 'http://localhost:3010';
const results = [];

async function test(name, fn) {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
    console.log(`✅ PASS: ${name}`);
  } catch (err) {
    results.push({ name, status: 'FAIL', error: err.message });
    console.error(`❌ FAIL: ${name} -> ${err.message}`);
  }
}

async function run() {
  console.log(
    '=== BẮT ĐẦU KIỂM TRA CHUYÊN SÂU TÍNH NĂNG AUTH & ĐĂNG NHẬP ===\n',
  );

  // 1. Kiểm tra các trang công khai (Render & Cache-Control)
  for (const path of ['/login', '/signup', '/forgot-password']) {
    await test(`Trang ${path} render 200 và Cache-Control private/no-store`, async () => {
      const res = await fetch(origin + path);
      assert.equal(res.status, 200);
      const cc = res.headers.get('cache-control') || '';
      assert.match(cc, /no-store/);
      const html = await res.text();
      assert.ok(
        html.includes('Chào mừng') ||
          html.includes('Sáng tạo') ||
          html.includes('Quên mật khẩu') ||
          html.includes('form') ||
          html.includes('auth'),
      );
    });
  }

  // 2. Chặn truy cập trang yêu cầu đăng nhập khi chưa có session
  for (const [path, expectedRedirect] of [
    ['/account', '/login'],
    ['/reset-password', '/forgot-password'],
  ]) {
    await test(`Trang bảo vệ ${path} từ chối anonymous và chuyển hướng sang ${expectedRedirect}`, async () => {
      const res = await fetch(origin + path, { redirect: 'manual' });
      assert.equal(res.status, 307);
      const loc = new URL(res.headers.get('location'), origin);
      assert.equal(loc.pathname, expectedRedirect);
    });
  }

  // 3. Chống giả mạo session token
  await test('Chống giả mạo cookie session truy cập /account', async () => {
    const res = await fetch(origin + '/account', {
      redirect: 'manual',
      headers: {
        cookie:
          'sb-njrbrhkxpsbqehlpcfdy-auth-token=base64-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWYiOiJmb3JnZWQifQ.fake',
      },
    });
    assert.equal(res.status, 307);
    const loc = new URL(res.headers.get('location'), origin);
    assert.equal(loc.pathname, '/login');
  });

  // 4. Kiểm tra Auth Callback và chống Open Redirect
  await test('Callback chặn Open Redirect sang domain ngoài (https://evil.com)', async () => {
    const res = await fetch(origin + '/auth/callback?next=https://evil.com', {
      redirect: 'manual',
    });
    assert.equal(res.status, 307);
    const loc = new URL(res.headers.get('location'), origin);
    assert.equal(loc.origin, origin);
    assert.equal(loc.pathname, '/login');
    assert.equal(loc.searchParams.get('error'), 'callback');
  });

  await test('Callback chặn Open Redirect dạng protocol-relative (//evil.com)', async () => {
    const res = await fetch(origin + '/auth/callback?next=//evil.com', {
      redirect: 'manual',
    });
    assert.equal(res.status, 307);
    const loc = new URL(res.headers.get('location'), origin);
    assert.equal(loc.origin, origin);
    assert.equal(loc.pathname, '/login');
  });

  await test('Callback báo lỗi khi có OAuth error param', async () => {
    const res = await fetch(origin + '/auth/callback?error=access_denied', {
      redirect: 'manual',
    });
    assert.equal(res.status, 307);
    const loc = new URL(res.headers.get('location'), origin);
    assert.equal(loc.origin, origin);
    assert.equal(loc.pathname, '/login');
    assert.equal(loc.searchParams.get('error'), 'oauth');
  });

  // 5. Kiểm tra API POST /api/auth/login
  await test('API /api/auth/login: trả lỗi 400 khi body rỗng', async () => {
    const res = await fetch(origin + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.error?.code, 'invalid_credentials');
  });

  await test('API /api/auth/login: xử lý an toàn khi body sai định dạng JSON', async () => {
    const res = await fetch(origin + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json{',
    });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.ok(json.error);
  });

  await test('API /api/auth/login: từ chối thông tin đăng nhập sai từ máy chủ Supabase', async () => {
    const res = await fetch(origin + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-user-nonexistent@example.com',
        password: 'WrongPassword123!',
      }),
    });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.error?.code, 'invalid_credentials');
    assert.equal(json.error?.message, 'Invalid login credentials');
  });

  // 6. Kiểm tra API POST /api/auth/signup
  await test('API /api/auth/signup: trả lỗi 400 khi thiếu email hoặc password', async () => {
    const res = await fetch(origin + '/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.error?.code, 'invalid_parameters');
  });

  // 7. Kiểm tra API POST /api/auth/otp & forgot
  await test('API /api/auth/otp: trả lỗi 400 khi thiếu email', async () => {
    const res = await fetch(origin + '/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.error?.code, 'invalid_parameters');
  });

  await test('API /api/auth/forgot: trả lỗi 400 khi thiếu email', async () => {
    const res = await fetch(origin + '/api/auth/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.error?.code, 'invalid_parameters');
  });

  // 8. Kiểm tra API POST /api/auth/signout
  await test('API /api/auth/signout: trả về success và header xoá cookie', async () => {
    const res = await fetch(origin + '/api/auth/signout', {
      method: 'POST',
      headers: {
        cookie: 'sb-njrbrhkxpsbqehlpcfdy-auth-token=test-token; sb-temp=123',
      },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    const setCookie = res.headers.get('set-cookie') || '';
    assert.ok(
      setCookie.includes('Max-Age=0') || setCookie.includes('Expires='),
    );
  });

  // 9. Kiểm tra các route API được bảo vệ bằng Auth
  await test('API POST /api/get: chặn người dùng chưa đăng nhập (401)', async () => {
    const res = await fetch(origin + '/api/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }),
    });
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.ok(json.error.includes('Vui lòng đăng nhập'));
  });

  await test('API GET /api/get/download: chặn tải file khi chưa đăng nhập (401)', async () => {
    const res = await fetch(
      origin + '/api/get/download?url=https://example.com/video.mp4',
    );
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.ok(json.error.includes('Vui lòng đăng nhập'));
  });

  await test('API POST /api/generate: chặn tạo AI khi chưa đăng nhập (401)', async () => {
    const res = await fetch(origin + '/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'cinematic video of cyberpunk city' }),
    });
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.ok(json.error.includes('Vui lòng đăng nhập'));
  });

  console.log('\n=== TỔNG KẾT KIỂM TRA ===');
  console.log(`Tổng bài test: ${results.length}`);
  const passCount = results.filter((r) => r.status === 'PASS').length;
  console.log(`Thành công: ${passCount}/${results.length}`);

  if (passCount !== results.length) {
    process.exit(1);
  }
}

await run();
