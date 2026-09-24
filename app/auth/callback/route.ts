import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get('code');
  const tokenHash = params.get('token_hash');
  const type = params.get('type');
  const oauthError = params.get('error');

  const host =
    request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto =
    request.headers.get('x-forwarded-proto') ||
    (request.url.startsWith('https') ? 'https' : 'http');
  const origin = host ? `${proto}://${host}` : request.nextUrl.origin;

  if (oauthError) {
    const response = NextResponse.redirect(
      new URL('/login?error=oauth', origin),
    );
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  }

  const supabase = await createClient();
  let success = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    success = !error;
  } else if (
    tokenHash &&
    (type === 'signup' || type === 'recovery' || type === 'email')
  ) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    success = !error;
  }

  const nextParam = params.get('next');
  const isSafeLocal =
    nextParam &&
    nextParam.startsWith('/') &&
    !nextParam.startsWith('//') &&
    !nextParam.includes('\\');

  const destination = success
    ? nextParam === '/reset-password' || type === 'recovery'
      ? '/reset-password'
      : isSafeLocal
        ? nextParam
        : '/account'
    : '/login?error=callback';
  const response = NextResponse.redirect(new URL(destination, origin));
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}
