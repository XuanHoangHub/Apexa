import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseConfig } from '@/lib/supabase/config';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        {
          error: {
            code: 'invalid_credentials',
            message: 'Vui lòng nhập đầy đủ email và mật khẩu.',
          },
        },
        { status: 400 },
      );
    }

    const { url, key } = supabaseConfig();
    const cookiesToSetLater: Array<{
      name: string;
      value: string;
      options?: Record<string, unknown>;
    }> = [];

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            cookiesToSetLater.push({ name, value, options });
          });
        },
      },
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        {
          error: {
            code: error.code || 'auth_failed',
            message: error.message,
          },
        },
        { status: 400 },
      );
    }

    const response = NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
    });

    cookiesToSetLater.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    return response;
  } catch (err) {
    console.error('API /api/auth/login error:', err);
    return NextResponse.json(
      {
        error: {
          code: 'server_error',
          message:
            'Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại sau.',
        },
      },
      { status: 500 },
    );
  }
}
