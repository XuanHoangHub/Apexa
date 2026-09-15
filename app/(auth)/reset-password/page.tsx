import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AuthForm from '@/components/auth/auth-form';

export default async function ResetPassword() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect('/forgot-password');
  return <AuthForm mode="reset" />;
}
