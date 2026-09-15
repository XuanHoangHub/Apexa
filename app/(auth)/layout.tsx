import type { Metadata } from 'next';
import AuthShell from '@/components/auth/auth-shell';
import './auth.css';

// Auth responses may refresh cookies and must never be shared by a CDN cache.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tài khoản — Apexa',
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}
