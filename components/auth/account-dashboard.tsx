'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserRound,
  Sparkles,
  Cloud,
  CloudUpload,
  CloudDownload,
  ShieldCheck,
  Sliders,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  Bookmark,
  Eye,
  EyeOff,
  AlertCircle,
  Download,
  Upload,
  Layers,
  Clapperboard,
  Aperture,
  Palette,
  CheckCircle2,
  Mail,
  KeyRound,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import SignOutButton from '@/components/auth/sign-out-button';
import { labels, type Draft } from '@/lib/studio-data';

export const AVATAR_PRESETS = [
  {
    id: 'chrome',
    name: 'Liquid Chrome',
    url: '/frame-chrome.png',
  },
  {
    id: 'red',
    name: 'Cinematic Red',
    url: 'https://images.unsplash.com/photo-1742163512400-7af30b2d17cc?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'dune',
    name: 'Desert Mirage',
    url: 'https://images.unsplash.com/photo-1564107628966-daff03746bee?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'future',
    name: 'Architecture',
    url: 'https://images.unsplash.com/photo-1515986503437-c617811ba008?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'bloom',
    name: 'Cyber Flora',
    url: 'https://images.unsplash.com/photo-1746126087099-e3e743d42f70?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'speed',
    name: 'Neon Velocity',
    url: 'https://images.unsplash.com/photo-1683916136420-f0981b6dd5dd?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'aurora',
    name: 'Cosmic Aurora',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'monolith',
    name: 'Obsidian Flow',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
  },
];

type TabId = 'profile' | 'cloud' | 'preferences' | 'security';

interface AccountDashboardProps {
  initialUser: User;
}

export default function AccountDashboard({
  initialUser,
}: AccountDashboardProps) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabId) || 'profile';

  const [tab, setTab] = useState<TabId>(initialTab);
  const [user, setUser] = useState<User>(initialUser);

  // Profile fields
  const meta = user.user_metadata || {};
  const [fullName, setFullName] = useState(
    meta.full_name || meta.name || user.email?.split('@')[0] || 'Nhà sáng tạo',
  );
  const initial = (fullName.trim()[0] || 'A').toUpperCase();
  const [avatarUrl, setAvatarUrl] = useState(
    meta.avatar_url || meta.picture || '/frame-chrome.png',
  );
  const [bio, setBio] = useState(
    meta.bio ||
      'Nhà làm phim AI & Thiết kế ý tưởng kỹ thuật số tại Apexa Studio',
  );
  const [role, setRole] = useState(meta.role || 'Senior Creative Director');
  const [website, setWebsite] = useState(meta.website || '');
  const [customAvatarInput, setCustomAvatarInput] = useState('');

  // Preferences fields
  const [defaultMode, setDefaultMode] = useState<string>(
    meta.preferences?.defaultMode || 'explore',
  );
  const [defaultRatio, setDefaultRatio] = useState<string>(
    meta.preferences?.defaultRatio || '16:9',
  );
  const [defaultModel, setDefaultModel] = useState<string>(
    meta.preferences?.defaultModel || 'Apexa Image v2',
  );
  const [aiEndpoint, setAiEndpoint] = useState<string>(
    meta.preferences?.aiEndpoint || '',
  );
  const [aiToken, setAiToken] = useState<string>(
    meta.preferences?.aiToken || '',
  );

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [busy, setBusy] = useState(false);
  const [toastMsg, setToastMsg] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);

  // Cloud Sync state
  const [localDrafts, setLocalDrafts] = useState<Draft[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw =
        localStorage.getItem('apexa-local-v1') ||
        localStorage.getItem('frame-local-v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.drafts)) return parsed.drafts;
      }
    } catch {}
    return [];
  });
  const [localSaved, setLocalSaved] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw =
        localStorage.getItem('apexa-local-v1') ||
        localStorage.getItem('frame-local-v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.saved)) return parsed.saved;
      }
    } catch {}
    return [];
  });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(
    meta.apexa_cloud_backup?.lastSynced || null,
  );
  const [cloudDraftCount, setCloudDraftCount] = useState<number>(
    meta.apexa_cloud_backup?.drafts?.length || 0,
  );
  const [cloudSavedCount, setCloudSavedCount] = useState<number>(
    meta.apexa_cloud_backup?.saved?.length || 0,
  );

  // Toast feedback helper
  const notify = useCallback(
    (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToastMsg({ text: msg, type });
      setTimeout(() => setToastMsg(null), 4500);
    },
    [],
  );

  // Update tab in URL without full reload
  const handleTabChange = (nextTab: TabId) => {
    setTab(nextTab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', nextTab);
    window.history.replaceState({}, '', url.toString());
  };

  // 1. Save Profile info
  const handleSaveProfile = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          name: fullName.trim(),
          avatar_url: avatarUrl,
          bio: bio.trim(),
          role: role.trim(),
          website: website.trim(),
        },
      });
      if (error) throw error;
      if (data.user) setUser(data.user);
      notify('Đã cập nhật hồ sơ sáng tạo thành công!');
    } catch (err: unknown) {
      notify(
        err instanceof Error
          ? err.message
          : 'Không thể lưu hồ sơ. Thử lại sau.',
        'error',
      );
    } finally {
      setBusy(false);
    }
  };

  // 2. Save Preferences
  const handleSavePreferences = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const supabase = createClient();
      const newPrefs = {
        defaultMode,
        defaultRatio,
        defaultModel,
        aiEndpoint: aiEndpoint.trim(),
        aiToken: aiToken.trim(),
      };
      const { data, error } = await supabase.auth.updateUser({
        data: {
          preferences: newPrefs,
        },
      });
      if (error) throw error;
      if (data.user) setUser(data.user);
      // Also save to localStorage for fast access in Studio
      try {
        localStorage.setItem(
          'apexa-user-preferences',
          JSON.stringify(newPrefs),
        );
      } catch {}
      notify('Đã lưu tùy chọn trải nghiệm và AI thành công!');
    } catch (err: unknown) {
      notify(
        err instanceof Error ? err.message : 'Lỗi khi lưu cài đặt.',
        'error',
      );
    } finally {
      setBusy(false);
    }
  };

  // 3. Update Password
  const handleUpdatePassword = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      notify('Mật khẩu mới phải có ít nhất 8 ký tự.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify('Mật khẩu xác nhận không khớp.', 'error');
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      notify('Mật khẩu của bạn đã được cập nhật an toàn!');
    } catch (err: unknown) {
      notify(
        err instanceof Error ? err.message : 'Không thể cập nhật mật khẩu.',
        'error',
      );
    } finally {
      setBusy(false);
    }
  };

  // 4. Cloud Sync: Push local storage to Cloud
  const handleSyncToCloud = async () => {
    setBusy(true);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      const backupData = {
        drafts: localDrafts,
        saved: localSaved,
        lastSynced: now,
      };
      const { data, error } = await supabase.auth.updateUser({
        data: {
          apexa_cloud_backup: backupData,
        },
      });
      if (error) throw error;
      if (data.user) setUser(data.user);
      setLastSyncTime(now);
      setCloudDraftCount(localDrafts.length);
      setCloudSavedCount(localSaved.length);
      notify(
        `Đã đồng bộ ${localDrafts.length} bản nháp và ${localSaved.length} tác phẩm lên Cloud!`,
      );
    } catch (err: unknown) {
      notify(
        err instanceof Error
          ? err.message
          : 'Đồng bộ thất bại. Vui lòng thử lại.',
        'error',
      );
    } finally {
      setBusy(false);
    }
  };

  // 5. Cloud Sync: Pull Cloud to local storage
  const handleRestoreFromCloud = () => {
    const backup = meta.apexa_cloud_backup;
    if (!backup || (!backup.drafts?.length && !backup.saved?.length)) {
      notify('Tài khoản chưa có dữ liệu sao lưu trên đám mây.', 'info');
      return;
    }
    try {
      const currentRaw = localStorage.getItem('apexa-local-v1');
      const current = currentRaw
        ? JSON.parse(currentRaw)
        : { saved: [], drafts: [] };

      // Merge unique drafts
      const existingDraftIds = new Set(
        (current.drafts || []).map((d: Draft) => d.id),
      );
      const newDrafts = (backup.drafts || []).filter(
        (d: Draft) => !existingDraftIds.has(d.id),
      );
      const mergedDrafts = [...(current.drafts || []), ...newDrafts];

      // Merge unique saved works
      const existingSavedIds = new Set(current.saved || []);
      const newSaved = (backup.saved || []).filter(
        (id: string) => !existingSavedIds.has(id),
      );
      const mergedSaved = [...(current.saved || []), ...newSaved];

      const mergedData = { saved: mergedSaved, drafts: mergedDrafts };
      localStorage.setItem('apexa-local-v1', JSON.stringify(mergedData));
      setLocalDrafts(mergedDrafts);
      setLocalSaved(mergedSaved);
      notify(
        `Đã khôi phục thành công ${newDrafts.length} bản nháp mới và ${newSaved.length} tác phẩm!`,
      );
    } catch {
      notify('Không thể khôi phục dữ liệu cục bộ.', 'error');
    }
  };

  // 6. Export JSON backup
  const handleExportJson = () => {
    const exportData = {
      version: 'apexa-backup-v1',
      exportedAt: new Date().toISOString(),
      user: {
        email: user.email,
        name: fullName,
      },
      drafts: localDrafts,
      saved: localSaved,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apexa-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Đã xuất tệp sao lưu JSON thành công!');
  };

  // 7. Import JSON backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed.drafts) && !Array.isArray(parsed.saved)) {
          notify('Tệp JSON không đúng định dạng sao lưu của Apexa.', 'error');
          return;
        }
        const updatedDrafts = Array.isArray(parsed.drafts) ? parsed.drafts : [];
        const updatedSaved = Array.isArray(parsed.saved) ? parsed.saved : [];
        const dataToSave = {
          saved: [...new Set([...localSaved, ...updatedSaved])],
          drafts: [...localDrafts, ...updatedDrafts],
        };
        localStorage.setItem('apexa-local-v1', JSON.stringify(dataToSave));
        setLocalDrafts(dataToSave.drafts);
        setLocalSaved(dataToSave.saved);
        notify(
          `Đã nhập ${updatedDrafts.length} bản nháp và ${updatedSaved.length} tác phẩm thành công!`,
        );
      } catch {
        notify('Không thể đọc tệp JSON. Vui lòng kiểm tra lại.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 8. Resend email confirmation
  const handleResendConfirmation = async () => {
    if (!user.email) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      if (error) throw error;
      notify(
        'Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư đến và thư rác.',
      );
    } catch (err: unknown) {
      notify(
        err instanceof Error ? err.message : 'Không thể gửi email lúc này.',
        'error',
      );
    } finally {
      setBusy(false);
    }
  };

  // Copy UUID
  const handleCopyUid = () => {
    void navigator.clipboard.writeText(user.id);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  // Password strength check
  const pwChecks = [
    newPassword.length >= 8,
    /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
    /[0-9]/.test(newPassword),
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
  ];
  const pwScore = pwChecks.filter(Boolean).length;

  return (
    <div className="account-hub">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            className={`account-toast ${toastMsg.type}`}
          >
            {toastMsg.type === 'success' && <CheckCircle2 size={16} />}
            {toastMsg.type === 'error' && <AlertCircle size={16} />}
            {toastMsg.type === 'info' && <Sparkles size={16} />}
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Navigation */}
      <div className="account-topbar">
        <Link href="/" className="account-back-btn">
          <ArrowLeft size={16} />
          <span>Về Studio</span>
        </Link>
        <div className="account-quick-links">
          <Link href="/#library" className="account-pill-link">
            <FolderOpen size={13} />
            <span>Bản nháp ({localDrafts.length})</span>
          </Link>
          <Link href="/#saved" className="account-pill-link">
            <Bookmark size={13} />
            <span>Đã lưu ({localSaved.length})</span>
          </Link>
          <Link href="/production" className="account-pill-link highlight">
            <Clapperboard size={13} />
            <span>Production Suite</span>
          </Link>
        </div>
      </div>

      {/* ── Grid Layout: Sidebar Navigation & Main Panel ── */}
      <div className="account-grid">
        {/* Cột trái: Creator Passport Card & Tabs */}
        <aside className="account-sidebar">
          {/* Creator Virtual Passport Card */}
          <div className="creator-id-card">
            <div className="card-ambient-glow" aria-hidden="true" />
            <div className="card-chip-badge">
              <span className="chip-dot" />
              <span>APEXA ID</span>
            </div>

            <div className="card-avatar-wrapper">
              <div className="card-avatar-ring">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={fullName}
                    width={84}
                    height={84}
                    unoptimized
                    className="card-avatar-img"
                  />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
              <span className="card-online-badge" />
            </div>

            <h2 className="card-user-name">{fullName}</h2>
            <span className="card-user-role">{role}</span>
            <p className="card-user-email">{user.email}</p>

            <div className="card-bio-quote">
              <p>&ldquo;{bio}&rdquo;</p>
            </div>

            <div className="card-metrics-grid">
              <div className="metric-box">
                <span className="metric-num">{localDrafts.length}</span>
                <span className="metric-label">Bản nháp</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">{localSaved.length}</span>
                <span className="metric-label">Đã bookmark</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">PRO</span>
                <span className="metric-label">Cấp độ</span>
              </div>
            </div>

            <div className="card-footer-info">
              <div className="card-footer-item">
                <span>Trạng thái:</span>
                <strong
                  className={
                    user.email_confirmed_at ? 'text-cyan' : 'text-amber'
                  }
                >
                  {user.email_confirmed_at ? 'Đã xác thực' : 'Chưa xác thực'}
                </strong>
              </div>
              <div className="card-footer-item">
                <span>Gia nhập:</span>
                <strong>
                  {new Date(user.created_at).toLocaleDateString('vi-VN', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </strong>
              </div>
            </div>

            <div className="card-actions">
              <Link href="/" className="button primary full-width">
                <span>Vào Studio Sáng Tạo</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Interactive Control Hub Tabs */}
        <main className="account-main">
          {/* Tabs Header */}
          <nav className="account-tabs-nav" aria-label="Cài đặt tài khoản">
            <button
              type="button"
              className={`account-tab-btn ${tab === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              <UserRound size={15} />
              <span>Hồ sơ</span>
              {tab === 'profile' && (
                <motion.div
                  layoutId="accountTabActive"
                  className="tab-indicator"
                />
              )}
            </button>
            <button
              type="button"
              className={`account-tab-btn ${tab === 'cloud' ? 'active' : ''}`}
              onClick={() => handleTabChange('cloud')}
            >
              <Cloud size={15} />
              <span>Đồng bộ Cloud</span>
              {cloudDraftCount > 0 && (
                <span className="tab-badge">{cloudDraftCount}</span>
              )}
              {tab === 'cloud' && (
                <motion.div
                  layoutId="accountTabActive"
                  className="tab-indicator"
                />
              )}
            </button>
            <button
              type="button"
              className={`account-tab-btn ${tab === 'preferences' ? 'active' : ''}`}
              onClick={() => handleTabChange('preferences')}
            >
              <Sliders size={15} />
              <span>Tùy chọn AI</span>
              {tab === 'preferences' && (
                <motion.div
                  layoutId="accountTabActive"
                  className="tab-indicator"
                />
              )}
            </button>
            <button
              type="button"
              className={`account-tab-btn ${tab === 'security' ? 'active' : ''}`}
              onClick={() => handleTabChange('security')}
            >
              <ShieldCheck size={15} />
              <span>Bảo mật</span>
              {tab === 'security' && (
                <motion.div
                  layoutId="accountTabActive"
                  className="tab-indicator"
                />
              )}
            </button>
          </nav>

          {/* TAB 1: PROFILE */}
          {tab === 'profile' && (
            <motion.section
              key="tab-profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="tab-panel"
            >
              <div className="panel-header">
                <h2>Hồ sơ Nhà Sáng Tạo</h2>
                <p>
                  Thông tin này được hiển thị trong không gian làm việc và tác
                  phẩm của bạn.
                </p>
              </div>

              {/* Avatar Preset Selector */}
              <div className="setting-group">
                <label className="setting-label">
                  <Palette size={15} />
                  <span>Chọn ảnh đại diện phong cách AI</span>
                </label>
                <div className="avatar-preset-grid">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = avatarUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setAvatarUrl(preset.url)}
                        className={`avatar-preset-item ${isSelected ? 'selected' : ''}`}
                        title={preset.name}
                      >
                        <Image
                          src={preset.url}
                          alt={preset.name}
                          width={52}
                          height={52}
                          unoptimized
                          className="preset-img"
                        />
                        {isSelected && (
                          <span className="preset-check">
                            <Check size={12} />
                          </span>
                        )}
                        <span className="preset-name">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Avatar URL */}
                <div className="custom-avatar-row">
                  <input
                    type="url"
                    placeholder="Hoặc dán liên kết ảnh tùy chỉnh (https://...)"
                    value={customAvatarInput}
                    onChange={(e) => setCustomAvatarInput(e.target.value)}
                    className="account-input"
                  />
                  <button
                    type="button"
                    className="button secondary"
                    disabled={!customAvatarInput.trim()}
                    onClick={() => {
                      if (customAvatarInput.trim()) {
                        setAvatarUrl(customAvatarInput.trim());
                        setCustomAvatarInput('');
                        notify('Đã chọn ảnh đại diện từ đường dẫn tùy chỉnh.');
                      }
                    }}
                  >
                    Áp dụng
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="account-form">
                <div className="form-row-2">
                  <div className="form-field">
                    <label>Tên hiển thị</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="account-input"
                      placeholder="Ví dụ: Hoàng Benjamin"
                    />
                  </div>
                  <div className="form-field">
                    <label>Chức danh / Nghề nghiệp</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="account-input"
                      placeholder="Ví dụ: AI Visual Artist"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Châm ngôn sáng tạo (Bio)</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="account-input textarea"
                    placeholder="Mô tả ngắn gọn về niềm đam mê sáng tạo của bạn..."
                  />
                </div>

                <div className="form-field">
                  <label>Liên kết Portfolio / Mạng xã hội</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="account-input"
                    placeholder="https://behance.net/username hoặc https://x.com/username"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={busy}
                    className="button primary"
                  >
                    {busy ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </form>
            </motion.section>
          )}

          {/* TAB 2: CLOUD SYNC & ASSETS */}
          {tab === 'cloud' && (
            <motion.section
              key="tab-cloud"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="tab-panel"
            >
              <div className="panel-header">
                <h2>Đồng Bộ Đám Mây & Sao Lưu Tác Phẩm</h2>
                <p>
                  Bảo vệ an toàn các ý tưởng, kịch bản, bản nháp và bookmark của
                  bạn. Dữ liệu được lưu trữ gắn liền với tài khoản Apexa để bạn
                  có thể tiếp tục làm việc trên bất kỳ máy tính nào.
                </p>
              </div>

              {/* Status Box */}
              <div className="cloud-status-card">
                <div className="cloud-status-icon">
                  <CloudUpload size={28} />
                </div>
                <div className="cloud-status-body">
                  <div className="cloud-status-title">
                    <span>Trạng thái sao lưu tài khoản</span>
                    <span className="status-badge-live">Sẵn sàng</span>
                  </div>
                  <p className="cloud-status-desc">
                    {lastSyncTime
                      ? `Lần đồng bộ gần nhất: ${new Date(lastSyncTime).toLocaleString('vi-VN')}`
                      : 'Chưa có bản đồng bộ nào lên đám mây.'}
                  </p>
                  <div className="cloud-stats-inline">
                    <span>
                      Trên thiết bị: <strong>{localDrafts.length}</strong> bản
                      nháp, <strong>{localSaved.length}</strong> bookmark
                    </span>
                    <span className="dot-divider" />
                    <span>
                      Trên Đám mây: <strong>{cloudDraftCount}</strong> bản nháp,{' '}
                      <strong>{cloudSavedCount}</strong> bookmark
                    </span>
                  </div>
                </div>
                <div className="cloud-status-action">
                  <button
                    type="button"
                    onClick={handleSyncToCloud}
                    disabled={busy}
                    className="button primary"
                  >
                    <RefreshCw
                      size={14}
                      className={busy ? 'animate-spin' : ''}
                    />
                    <span>
                      {busy ? 'Đang đồng bộ...' : 'Đồng Bộ Lên Cloud'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="cloud-tools-grid">
                <div className="cloud-tool-box">
                  <div className="tool-box-header">
                    <CloudDownload size={18} className="text-cyan" />
                    <h4>Khôi phục từ Đám mây</h4>
                  </div>
                  <p>
                    Tải về các bản nháp và bookmark đã lưu trên tài khoản vào
                    trình duyệt hiện tại.
                  </p>
                  <button
                    type="button"
                    onClick={handleRestoreFromCloud}
                    className="button secondary sm"
                  >
                    Tải về trình duyệt này
                  </button>
                </div>

                <div className="cloud-tool-box">
                  <div className="tool-box-header">
                    <Download size={18} className="text-cyan" />
                    <h4>Xuất tệp sao lưu JSON</h4>
                  </div>
                  <p>
                    Tải toàn bộ dữ liệu sáng tạo về máy tính dưới dạng tệp tin
                    JSON độc lập.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="button secondary sm"
                  >
                    Tải tệp .json về máy
                  </button>
                </div>

                <div className="cloud-tool-box">
                  <div className="tool-box-header">
                    <Upload size={18} className="text-cyan" />
                    <h4>Nhập từ tệp JSON</h4>
                  </div>
                  <p>
                    Khôi phục lại dữ liệu từ tệp tin sao lưu trước đây của bạn.
                  </p>
                  <label className="button secondary sm upload-label">
                    <span>Chọn tệp JSON...</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportJson}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              {/* Drafts Quick List */}
              <div className="recent-drafts-section">
                <div className="section-title-row">
                  <h3>
                    Danh sách Bản nháp trên thiết bị ({localDrafts.length})
                  </h3>
                  <Link href="/#library" className="view-all-link">
                    Xem trong Library <ExternalLink size={12} />
                  </Link>
                </div>

                {localDrafts.length === 0 ? (
                  <div className="empty-cloud-box">
                    <FolderOpen size={24} />
                    <span>
                      Chưa có bản nháp nào trên thiết bị này. Hãy tạo dự án mới
                      trong Studio!
                    </span>
                  </div>
                ) : (
                  <div className="drafts-mini-list">
                    {localDrafts.slice(0, 5).map((d) => (
                      <div key={d.id} className="draft-mini-row">
                        <div className="draft-mini-icon">
                          <Layers size={14} />
                        </div>
                        <div className="draft-mini-content">
                          <span className="draft-mini-title">{d.title}</span>
                          <span className="draft-mini-meta">
                            {labels[d.mode]} · {d.model} · {d.ratio}
                          </span>
                        </div>
                        <Link
                          href={`/#${d.mode}`}
                          className="button secondary xs"
                          title="Mở trong Studio"
                        >
                          Mở Studio
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {/* TAB 3: PREFERENCES */}
          {tab === 'preferences' && (
            <motion.section
              key="tab-preferences"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="tab-panel"
            >
              <div className="panel-header">
                <h2>Tùy Chọn Trải Nghiệm Studio & AI</h2>
                <p>
                  Cấu hình mặc định để tối ưu hóa luồng sáng tạo hàng ngày của
                  bạn.
                </p>
              </div>

              <form onSubmit={handleSavePreferences} className="account-form">
                <div className="setting-group">
                  <label className="setting-label">
                    <Aperture size={15} />
                    <span>Không gian mở đầu mặc định (Default View)</span>
                  </label>
                  <div className="radio-pill-grid">
                    {[
                      { id: 'explore', label: 'Explore (Cảm hứng)' },
                      { id: 'image', label: 'Image Generation' },
                      { id: 'video', label: 'Video Generation' },
                      { id: 'cinema', label: 'Cinema Studio' },
                      { id: 'get', label: 'Get Media Downloader' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDefaultMode(item.id)}
                        className={`radio-pill ${defaultMode === item.id ? 'active' : ''}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <Sliders size={15} />
                    <span>Tỷ lệ khung hình ưa thích</span>
                  </label>
                  <div className="radio-pill-grid">
                    {['16:9', '9:16', '1:1', '4:5', '21:9'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setDefaultRatio(r)}
                        className={`radio-pill ${defaultRatio === r ? 'active' : ''}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <Sparkles size={15} />
                    <span>Mô hình AI mặc định</span>
                  </label>
                  <div className="radio-pill-grid">
                    {[
                      'Apexa Image v2',
                      'Apexa Video Motion',
                      'Flux 1.1 Pro Ultra',
                      'Stable Diffusion XL Cinema',
                    ].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDefaultModel(m)}
                        className={`radio-pill ${defaultModel === m ? 'active' : ''}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divider-line" />

                <div className="setting-group">
                  <div className="panel-header" style={{ marginBottom: 12 }}>
                    <h3>Cấu Hình AI Endpoint Cá Nhân (Tùy chọn)</h3>
                    <p>
                      Nếu bạn sử dụng API riêng hoặc máy chủ tự host (ComfyUI /
                      Automatic1111 / Custom Endpoint), hãy cấu hình tại đây.
                    </p>
                  </div>
                  <div className="form-field">
                    <label>Custom AI Endpoint URL</label>
                    <input
                      type="url"
                      value={aiEndpoint}
                      onChange={(e) => setAiEndpoint(e.target.value)}
                      placeholder="https://api.your-ai-server.com/v1/generate"
                      className="account-input"
                    />
                  </div>
                  <div className="form-field">
                    <label>Personal API Token / Key</label>
                    <input
                      type="password"
                      value={aiToken}
                      onChange={(e) => setAiToken(e.target.value)}
                      placeholder="Bearer sk-..."
                      className="account-input"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={busy}
                    className="button primary"
                  >
                    {busy ? 'Đang lưu...' : 'Lưu Tùy Chọn Studio'}
                  </button>
                </div>
              </form>
            </motion.section>
          )}

          {/* TAB 4: SECURITY */}
          {tab === 'security' && (
            <motion.section
              key="tab-security"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="tab-panel"
            >
              <div className="panel-header">
                <h2>Bảo Mật & Xác Thực Tài Khoản</h2>
                <p>
                  Quản lý mật khẩu, trạng thái xác thực và các phiên làm việc
                  của bạn.
                </p>
              </div>

              {/* Account Details Box */}
              <div className="security-info-grid">
                <div className="security-card">
                  <div className="sec-card-icon">
                    <Mail size={18} />
                  </div>
                  <div className="sec-card-body">
                    <span className="sec-label">Địa chỉ Email</span>
                    <strong className="sec-val">{user.email}</strong>
                    <div className="sec-status-row">
                      <span
                        className={`status-pill ${
                          user.email_confirmed_at ? 'verified' : 'unverified'
                        }`}
                      >
                        {user.email_confirmed_at
                          ? 'Đã xác nhận'
                          : 'Chưa xác nhận'}
                      </span>
                      {!user.email_confirmed_at && (
                        <button
                          type="button"
                          onClick={handleResendConfirmation}
                          disabled={busy}
                          className="resend-link"
                        >
                          Gửi lại email xác nhận
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="security-card">
                  <div className="sec-card-icon">
                    <KeyRound size={18} />
                  </div>
                  <div className="sec-card-body">
                    <span className="sec-label">
                      Mã định danh User ID (UUID)
                    </span>
                    <div className="sec-uid-row">
                      <code className="sec-uid">{user.id}</code>
                      <button
                        type="button"
                        onClick={handleCopyUid}
                        className="icon-copy-btn"
                        title="Sao chép ID"
                      >
                        {copiedUid ? (
                          <Check size={14} className="text-cyan" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                    <span className="sec-sub">
                      Phương thức đăng nhập:{' '}
                      {user.app_metadata?.provider === 'google'
                        ? 'Google OAuth'
                        : 'Email & Mật khẩu'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Password Change Form */}
              <div className="divider-line" />
              <div className="panel-header" style={{ marginBottom: 16 }}>
                <h3>Đổi Mật Khẩu</h3>
                <p>
                  Mật khẩu mới cần có ít nhất 8 ký tự, bao gồm chữ hoa, chữ
                  thường và chữ số.
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="account-form">
                <div className="form-field">
                  <label>Mật khẩu mới</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới an toàn..."
                      className="account-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="toggle-pw-btn"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="password-strength-bar">
                      <div className="strength-track">
                        <div
                          className={`strength-fill strength-${pwScore}`}
                          style={{ width: `${(pwScore / 4) * 100}%` }}
                        />
                      </div>
                      <span className="strength-text">
                        Độ an toàn:{' '}
                        {
                          ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Rất mạnh'][
                            pwScore
                          ]
                        }
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label>Xác nhận mật khẩu mới</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="account-input"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={busy || !newPassword || pwScore < 2}
                    className="button primary"
                  >
                    {busy ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                  </button>
                </div>
              </form>

              {/* Danger Zone: Sign Out */}
              <div className="divider-line danger" />
              <div className="danger-zone-box">
                <div>
                  <h4>Đăng xuất tài khoản</h4>
                  <p>Kết thúc phiên làm việc trên trình duyệt thiết bị này.</p>
                </div>
                <SignOutButton />
              </div>
            </motion.section>
          )}
        </main>
      </div>
    </div>
  );
}
