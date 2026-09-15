'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function signOut() {
    setBusy(true);
    setError('');
    try {
      const { error } = await createClient().auth.signOut({ scope: 'local' });
      if (error) throw error;
      window.location.assign('/login');
    } catch {
      setError('Chưa thể đăng xuất. Vui lòng thử lại.');
      setBusy(false);
    }
  }
  return (
    <>
      <button className="auth-account-logout" disabled={busy} onClick={signOut}>
        {busy ? 'Đang đăng xuất…' : 'Đăng xuất khỏi thiết bị này'}
      </button>
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
