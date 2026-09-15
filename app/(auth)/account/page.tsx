import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { ArrowRight, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/auth/sign-out-button';

export default async function Account() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect('/login');
  const user = data.user;
  const meta = user.user_metadata ?? {};
  const name =
    typeof meta.full_name === 'string' && meta.full_name.trim()
      ? meta.full_name.trim()
      : typeof meta.name === 'string' && meta.name.trim()
        ? meta.name.trim()
        : user.email?.split('@')[0] || 'Nhà sáng tạo';
  const avatarUrl =
    typeof meta.avatar_url === 'string' && meta.avatar_url.trim()
      ? meta.avatar_url.trim()
      : typeof meta.picture === 'string' && meta.picture.trim()
        ? meta.picture.trim()
        : null;
  const provider =
    user.app_metadata?.provider === 'google'
      ? 'Google'
      : user.app_metadata?.provider === 'facebook'
        ? 'Facebook'
        : 'Email & Mật khẩu';

  return (
    <>
      <div className={`auth-mark ${avatarUrl ? 'auth-mark-avatar' : ''}`}>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={48}
            height={48}
            unoptimized
          />
        ) : (
          <UserRound size={24} />
        )}
      </div>
      <div className="auth-heading">
        <h1>Tài khoản của bạn.</h1>
        <p>Rất vui được gặp bạn, {name}.</p>
      </div>
      <dl className="auth-account-details">
        <div>
          <dt>Tên hiển thị</dt>
          <dd>{name}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>Phương thức đăng nhập</dt>
          <dd>{provider}</dd>
        </div>
        <div>
          <dt>Trạng thái</dt>
          <dd>
            {user.email_confirmed_at
              ? 'Email đã được xác nhận'
              : 'Chưa xác nhận email'}
          </dd>
        </div>
      </dl>
      <div className="auth-account-actions">
        <Link href="/" className="auth-submit">
          Tiếp tục sáng tạo
          <ArrowRight size={18} />
        </Link>
        <Link href="/reset-password">Đổi mật khẩu</Link>
        <SignOutButton />
      </div>
      <p className="auth-account-note">
        Bản nháp và tác phẩm đã lưu hiện vẫn nằm trên thiết bị này; chưa được
        đồng bộ vào tài khoản.
      </p>
    </>
  );
}
