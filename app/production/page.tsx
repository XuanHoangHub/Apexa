import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProductionSuite from '@/components/production/production-suite';
import './production.css';

export const metadata: Metadata = {
  title: 'Production Suite — Apexa',
  description:
    'Từ kịch bản đến ngày bấm máy. Không gian quản lý sản xuất của Apexa.',
};

export default async function ProductionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/production');
  }

  return <ProductionSuite />;
}
