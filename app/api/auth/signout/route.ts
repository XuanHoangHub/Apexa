import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseConfig } from '@/lib/supabase/config';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
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

    await supabase.auth.signOut();

    const response = NextResponse.json({ success: true });
    cookiesToSetLater.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    request.cookies.getAll().forEach((c) => {
      if (c.name.startsWith('sb-')) {
        response.cookies.set(c.name, '', { maxAge: 0, path: '/' });
      }
    });

    return response;
  } catch (err) {
    console.error('API /api/auth/signout error:', err);
    return NextResponse.json({ success: true });
  }
}
