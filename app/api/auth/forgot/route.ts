import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseConfig } from '@/lib/supabase/config';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const callback = typeof body?.callback === 'string' ? body.callback : '';

    if (!email) {
      return NextResponse.json(
        {
          error: {
            code: 'invalid_parameters',
            message: 'Vui lòng cung cấp email.',
          },
        },
        { status: 400 },
      );
    }

    const { url, key } = supabaseConfig();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callback || undefined,
    });

    if (error) {
      return NextResponse.json(
        {
          error: {
            code: error.code || 'reset_failed',
            message: error.message,
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API /api/auth/forgot error:', err);
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
