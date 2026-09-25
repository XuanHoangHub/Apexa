import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseConfig } from '@/lib/supabase/config';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const callback = typeof body?.callback === 'string' ? body.callback : '';

    if (!email || !password) {
      return NextResponse.json(
        {
          error: {
            code: 'invalid_parameters',
            message: 'Vui lòng cung cấp email và mật khẩu.',
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: name ? { full_name: name } : undefined,
        emailRedirectTo: callback || undefined,
      },
    });

    if (error) {
      return NextResponse.json(
        {
          error: {
            code: error.code || 'signup_failed',
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
    console.error('API /api/auth/signup error:', err);
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
