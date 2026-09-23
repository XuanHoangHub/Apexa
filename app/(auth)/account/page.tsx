import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import AccountDashboard from '@/components/auth/account-dashboard';

export const metadata: Metadata = {
  title: 'Hồ sơ & Tài khoản — Apexa',
  description:
    'Quản lý hồ sơ nhà sáng tạo, đồng bộ dữ liệu đám mây và tùy chọn studio.',
};

export default async function Account() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect('/login');

  return <AccountDashboard initialUser={data.user} />;
}
