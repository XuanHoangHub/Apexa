'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Aperture,
  Clapperboard,
  Bookmark,
  FolderOpen,
  UserRound,
  Cloud,
  Sliders,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthModal } from './auth-modal-context';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/radix-dropdown';

export default function AccountMenu() {
  const router = useRouter();
  const { user, isLoading: authLoading, openAuthModal } = useAuthModal();
  const [signingOut, setSigningOut] = useState(false);
  const [counts] = useState(() => {
    if (typeof window === 'undefined') return { drafts: 0, saved: 0 };
    try {
      const raw =
        localStorage.getItem('apexa-local-v1') ||
        localStorage.getItem('frame-local-v1');
      if (raw) {
        const p = JSON.parse(raw);
        return {
          drafts: Array.isArray(p.drafts) ? p.drafts.length : 0,
          saved: Array.isArray(p.saved) ? p.saved.length : 0,
        };
      }
    } catch {}
    return { drafts: 0, saved: 0 };
  });

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: 'local' });
      router.push('/login');
    } catch {
      setSigningOut(false);
    }
  };

  if (authLoading)
    return (
      <span className="avatar small" aria-label="Đang tải tài khoản">
        …
      </span>
    );

  if (!user)
    return (
      <div className="header-guest-cta">
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="btn-guest-login"
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => openAuthModal('signup')}
          className="btn-guest-signup"
        >
          <Sparkles size={12} />
          <span>Đăng ký</span>
        </button>
      </div>
    );

  const meta = user.user_metadata || {};
  const name =
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    user.email?.split('@')[0] ||
    'Nhà sáng tạo';

  const avatarUrl =
    (typeof meta.avatar_url === 'string' && meta.avatar_url.trim()) ||
    (typeof meta.picture === 'string' && meta.picture.trim()) ||
    null;

  const role =
    (typeof meta.role === 'string' && meta.role.trim()) || 'Apexa Creator';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="avatar small account-trigger"
          aria-label={`Tài khoản của ${name}`}
          style={{
            overflow: 'hidden',
            cursor: 'pointer',
            border: '1.5px solid rgba(114, 232, 246, 0.4)',
            boxShadow: '0 0 10px rgba(114, 232, 246, 0.15)',
            position: 'relative',
          }}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={28}
              height={28}
              unoptimized
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            name.slice(0, 1).toUpperCase()
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 bg-[#14181b]/98 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl p-2 text-neutral-100 z-50"
      >
        {/* User Identity Header */}
        <div className="flex items-center gap-3 p-2.5 pb-3 border-b border-white/8">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-[#72e8f6]/40 shadow-[0_0_12px_rgba(114,232,246,0.2)] bg-[#1c2227] flex items-center justify-center font-bold text-sm text-[#72e8f6]">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={name}
                width={40}
                height={40}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              name.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-white truncate max-w-[130px]">
                {name}
              </span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#72e8f6]/15 text-[#72e8f6] font-semibold border border-[#72e8f6]/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 truncate mt-0.5">
              {user.email}
            </p>
            <span className="text-[10px] text-[#72e8f6]/80 flex items-center gap-1 mt-0.5">
              <Sparkles size={10} /> {role}
            </span>
          </div>
        </div>

        {/* Studio & Creative Navigation */}
        <div className="py-1">
          <DropdownMenuItem asChild>
            <Link
              href="/"
              className="flex items-center gap-2.5 px-2.5 py-2 text-xs text-neutral-200 hover:text-white rounded-lg hover:bg-white/8 transition cursor-pointer"
            >
              <Aperture size={14} className="text-[#72e8f6]" />
              <span className="flex-1">Không gian sáng tạo</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/production"
              className="flex items-center gap-2.5 px-2.5 py-2 text-xs text-neutral-200 hover:text-white rounded-lg hover:bg-white/8 transition cursor-pointer"
            >
              <Clapperboard size={14} className="text-amber-400" />
              <span className="flex-1">Production Suite</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/#library"
              className="flex items-center gap-2.5 px-2.5 py-2 text-xs text-neutral-200 hover:text-white rounded-lg hover:bg-white/8 transition cursor-pointer"
            >
              <FolderOpen size={14} className="text-sky-400" />
              <span className="flex-1">Bản nháp của tôi</span>
              {counts.drafts > 0 && (
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full font-mono text-neutral-300">
                  {counts.drafts}
                </span>
              )}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/#saved"
              className="flex items-center gap-2.5 px-2.5 py-2 text-xs text-neutral-200 hover:text-white rounded-lg hover:bg-white/8 transition cursor-pointer"
            >
              <Bookmark size={14} className="text-violet-400" />
              <span className="flex-1">Tác phẩm đã lưu</span>
              {counts.saved > 0 && (
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full font-mono text-neutral-300">
                  {counts.saved}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-1 bg-white/8" />

        {/* Account Management Links */}
        <div className="py-1">
          <DropdownMenuItem asChild>
            <Link
              href="/account?tab=profile"
              className="flex items-center gap-2.5 px-2.5 py-2 text-xs text-neutral-200 hover:text-white rounded-lg hover:bg-white/8 transition cursor-pointer"
            >
              <UserRound size={14} className="text-neutral-400" />
              <span>Hồ sơ & Passport</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/account?tab=cloud"
              className="flex items-center gap-2.5 px-2.5 py-2 text-xs text-neutral-200 hover:text-white rounded-lg hover:bg-white/8 transition cursor-pointer"
            >
              <Cloud size={14} className="text-neutral-400" />
              <span>Đồng bộ Đám mây</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/account?tab=preferences"
              className="flex items-center gap-2.5 px-2.5 py-2 text-xs text-neutral-200 hover:text-white rounded-lg hover:bg-white/8 transition cursor-pointer"
            >
              <Sliders size={14} className="text-neutral-400" />
              <span>Tùy chọn Studio & AI</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/account?tab=security"
              className="flex items-center gap-2.5 px-2.5 py-2 text-xs text-neutral-200 hover:text-white rounded-lg hover:bg-white/8 transition cursor-pointer"
            >
              <ShieldCheck size={14} className="text-neutral-400" />
              <span>Bảo mật & Mật khẩu</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-1 bg-white/8" />

        {/* Sign out */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut size={14} />
            <span>
              {signingOut ? 'Đang đăng xuất...' : 'Đăng xuất khỏi thiết bị'}
            </span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
