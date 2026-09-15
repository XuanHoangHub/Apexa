'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useAuthModal } from './auth-modal-context';

export default function AccountMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready)
    return (
      <span className="avatar small" aria-label="Đang tải tài khoản">
        …
      </span>
    );

  if (!user)
    return (
      <button
        type="button"
        onClick={() => openAuthModal('login')}
        className="button secondary"
        style={{ padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}
      >
        Đăng nhập
      </button>
    );

  const name =
    typeof user.user_metadata.full_name === 'string'
      ? user.user_metadata.full_name
      : typeof user.user_metadata.name === 'string'
        ? user.user_metadata.name
        : user.email;

  const avatarUrl =
    typeof user.user_metadata.avatar_url === 'string'
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata.picture === 'string'
        ? user.user_metadata.picture
        : null;

  return (
    <Link
      href="/account"
      className="avatar small"
      aria-label="Tài khoản của bạn"
      style={{ overflow: 'hidden' }}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name ?? 'User'}
          width={28}
          height={28}
          unoptimized
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        (name ?? 'A').slice(0, 1).toUpperCase()
      )}
    </Link>
  );
}
