'use client';

import { useState, type SubmitEvent, type KeyboardEvent } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  UserRound,
  LoaderCircle,
  Check,
  CircleAlert,
  MailCheck,
  Aperture,
  ArrowUpSquare,
  Wand2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

type Mode = 'login' | 'signup' | 'forgot' | 'reset';
const copy = {
  login: {
    label: 'WELCOME BACK',
    title: 'Chào mừng trở lại.',
    subtitle: 'Những ý tưởng tiếp theo đang chờ bạn.',
    button: 'Đăng nhập',
  },
  signup: {
    label: 'START SOMETHING GREAT',
    title: 'Sáng tạo từ đây.',
    subtitle: 'Tạo tài khoản và mở ra không gian của riêng bạn.',
    button: 'Tạo tài khoản',
  },
  forgot: {
    label: 'A FRESH START',
    title: 'Quên mật khẩu?',
    subtitle: 'Nhập email để nhận liên kết đặt lại mật khẩu.',
    button: 'Gửi liên kết khôi phục',
  },
  reset: {
    label: 'MAKE IT YOURS',
    title: 'Mật khẩu mới.',
    subtitle: 'Chọn một mật khẩu an toàn cho tài khoản của bạn.',
    button: 'Cập nhật mật khẩu',
  },
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.02h3.86c2.26-2.09 3.68-5.17 3.68-9.12z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3.02c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.12C3.25 21.27 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.61H1.26C.46 8.22 0 10.05 0 12s.46 3.78 1.26 5.39l4.01-3.12z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.73 1.26 6.61l4.01 3.12c.95-2.85 3.6-4.98 6.73-4.98z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

export function authError(error: { code?: string; message: string }) {
  const messages: Record<string, string> = {
    invalid_credentials: 'Email hoặc mật khẩu chưa đúng. Vui lòng thử lại.',
    email_not_confirmed:
      'Vui lòng xác nhận email trước khi đăng nhập. Kiểm tra cả thư mục spam.',
    user_already_exists:
      'Email này đã được đăng ký. Hãy đăng nhập hoặc khôi phục mật khẩu.',
    weak_password:
      'Mật khẩu chưa đủ mạnh. Hãy thêm chữ hoa, chữ thường, số và ký tự đặc biệt.',
    same_password: 'Mật khẩu mới cần khác mật khẩu hiện tại.',
    over_email_send_rate_limit:
      'Đã gửi quá nhiều email. Vui lòng đợi vài phút rồi thử lại.',
    over_request_rate_limit:
      'Có quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.',
    signup_disabled: 'Đăng ký đang tạm đóng. Vui lòng quay lại sau.',
    email_address_invalid: 'Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.',
    provider_disabled:
      'Phương thức đăng nhập này chưa được kích hoạt trong hệ thống. Vui lòng kiểm tra cấu hình nhà cung cấp.',
    access_denied:
      'Yêu cầu đăng nhập đã bị từ chối hoặc bị hủy. Vui lòng thử lại.',
  };
  return (
    messages[error.code ?? ''] ??
    error.message ??
    'Không thể hoàn tất yêu cầu. Vui lòng kiểm tra kết nối và thử lại sau.'
  );
}

export default function AuthForm({
  mode: initialMode = 'login',
  initialError,
  inModal = false,
  onSuccess,
  onClose,
  onModeChange,
}: {
  mode?: Mode;
  initialError?: string;
  inModal?: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
  onModeChange?: (mode: Mode) => void;
}) {
  const [currentMode, setCurrentMode] = useState<Mode>(initialMode);
  const mode = inModal ? currentMode : initialMode;

  function switchMode(nextMode: Mode) {
    if (inModal) {
      setCurrentMode(nextMode);
      setError('');
      setPassword('');
      setConfirmation('');
      setMagicLink(false);
      onModeChange?.(nextMode);
    }
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyOAuth, setBusyOAuth] = useState<'google' | 'facebook' | null>(
    null,
  );
  const [error, setError] = useState(initialError ?? '');
  const [success, setSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [capsLock, setCapsLock] = useState(false);
  const [magicLink, setMagicLink] = useState(false);

  const content = copy[mode];
  const newPassword = mode === 'signup' || mode === 'reset';
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const strengthLabels = ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Rất mạnh'];
  const strengthColors = [
    '#454d54',
    '#ff786e',
    '#ffaa47',
    '#72e8f6',
    '#4ce29a',
  ];

  function handleKeyModifiers(e: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(e.getModifierState('CapsLock'));
  }

  async function handleOAuth(provider: 'google' | 'facebook') {
    if (busy || busyOAuth !== null) return;
    setError('');
    setBusyOAuth(provider);
    try {
      const supabase = createClient();
      const nextQuery =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('next') || '/'
          : '/';
      const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextQuery)}`;
      const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callback,
          ...(provider === 'google'
            ? {
                queryParams: {
                  prompt: 'select_account',
                  access_type: 'offline',
                },
              }
            : {}),
        },
      });
      if (oauthErr) {
        setError(authError(oauthErr));
        setBusyOAuth(null);
        return;
      }
      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch {
      setError('Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại sau.');
      setBusyOAuth(null);
    }
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || busyOAuth !== null) return;
    setError('');

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Vui lòng nhập tên của bạn.');
        return;
      }
      if (score < 3) {
        setError('Mật khẩu cần đạt ít nhất 3/4 tiêu chuẩn an toàn.');
        return;
      }
      if (password !== confirmation) {
        setError('Mật khẩu xác nhận chưa khớp. Vui lòng kiểm tra lại.');
        return;
      }
    }

    if (mode === 'reset') {
      if (score < 3) {
        setError('Mật khẩu mới cần đạt ít nhất 3/4 tiêu chuẩn an toàn.');
        return;
      }
      if (password !== confirmation) {
        setError('Hai mật khẩu chưa khớp. Vui lòng kiểm tra lại.');
        return;
      }
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const nextQuery =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('next') || '/'
          : '/';
      const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextQuery)}`;

      if (mode === 'login') {
        if (magicLink) {
          const { error: magicErr } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
              emailRedirectTo: callback,
            },
          });
          if (magicErr) {
            setError(authError(magicErr));
            return;
          }
          setSuccess(true);
          return;
        }

        const { error: loginErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (loginErr) {
          setError(authError(loginErr));
          return;
        }
        if (inModal && onSuccess) {
          onSuccess();
        } else {
          window.location.assign(nextQuery);
        }
      } else if (mode === 'signup') {
        const { data, error: signupErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: callback,
          },
        });
        if (signupErr) {
          setError(authError(signupErr));
          return;
        }
        if (data.session) {
          if (inModal && onSuccess) {
            onSuccess();
          } else {
            window.location.assign(nextQuery);
          }
        } else {
          setPassword('');
          setConfirmation('');
          setSuccess(true);
        }
      } else if (mode === 'forgot') {
        const { error: forgotErr } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: `${callback}?next=/reset-password` },
        );
        if (forgotErr) {
          setError(authError(forgotErr));
          return;
        }
        setSuccess(true);
      } else {
        const { error: updateErr } = await supabase.auth.updateUser({
          password,
        });
        if (updateErr) {
          setError(authError(updateErr));
          return;
        }
        setPassword('');
        setConfirmation('');
        setSuccess(true);
      }
    } catch {
      setError('Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.');
    } finally {
      setBusy(false);
    }
  }

  if (success)
    return (
      <motion.div
        className="auth-success"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        aria-live="polite"
      >
        <div className="auth-success-icon">
          {mode === 'reset' ? <Check size={30} /> : <MailCheck size={30} />}
        </div>
        <span className="auth-eyebrow">
          {mode === 'reset' ? 'ALL SET' : 'CHECK YOUR INBOX'}
        </span>
        <h1>
          {mode === 'reset'
            ? 'Đã cập nhật mật khẩu.'
            : magicLink
              ? 'Liên kết đã được gửi.'
              : 'Kiểm tra email nhé.'}
        </h1>
        <p>
          {mode === 'reset' ? (
            'Mật khẩu mới đã sẵn sàng. Tiếp tục hành trình sáng tạo của bạn.'
          ) : magicLink ? (
            <>
              Chúng tôi đã gửi liên kết đăng nhập an toàn đến{' '}
              <strong>{email}</strong>. Nhấn vào liên kết trong email để vào
              studio ngay lập tức mà không cần mật khẩu.
            </>
          ) : (
            <>
              Nếu địa chỉ <strong>{email}</strong> đủ điều kiện, bạn sẽ nhận
              được{' '}
              {mode === 'signup'
                ? 'email xác nhận tài khoản'
                : 'liên kết khôi phục mật khẩu'}
              . Hãy kiểm tra hộp thư và thư mục spam, rồi mở liên kết trong
              trình duyệt này.
            </>
          )}
        </p>
        {inModal ? (
          <button
            type="button"
            className="auth-submit"
            onClick={() => {
              if (mode === 'reset') {
                if (onClose) onClose();
                else switchMode('login');
              } else {
                switchMode('login');
                setSuccess(false);
              }
            }}
          >
            <span>{mode === 'reset' ? 'Đóng' : 'Về đăng nhập'}</span>
            <ArrowRight size={18} />
          </button>
        ) : (
          <Link
            className="auth-submit"
            href={mode === 'reset' ? '/' : '/login'}
          >
            {mode === 'reset' ? 'Vào studio' : 'Về đăng nhập'}
            <ArrowRight size={18} />
          </Link>
        )}
        {mode !== 'reset' && (
          <button
            className="auth-text-button"
            onClick={() => setSuccess(false)}
          >
            Nhập lại địa chỉ email
          </button>
        )}
      </motion.div>
    );

  return (
    <>
      <div className="auth-mark">
        <Aperture size={25} />
      </div>
      <div className="auth-heading">
        <span className="auth-eyebrow">{content.label}</span>
        <h1>{content.title}</h1>
        <p>{content.subtitle}</p>
      </div>
      {(mode === 'login' || mode === 'signup') && (
        <nav className="auth-tabs" aria-label="Tài khoản">
          {(['login', 'signup'] as const).map((tab) =>
            inModal ? (
              <button
                key={tab}
                type="button"
                onClick={() => switchMode(tab)}
                aria-current={mode === tab ? 'page' : undefined}
                className={mode === tab ? 'active' : ''}
              >
                {mode === tab && (
                  <motion.span
                    layoutId={inModal ? 'auth-modal-tab' : 'auth-tab'}
                    className="auth-tab-active"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span>{tab === 'login' ? 'Đăng nhập' : 'Đăng ký'}</span>
              </button>
            ) : (
              <Link
                key={tab}
                href={`/${tab}`}
                aria-current={mode === tab ? 'page' : undefined}
                className={mode === tab ? 'active' : ''}
              >
                {mode === tab && (
                  <motion.span
                    layoutId="auth-tab"
                    className="auth-tab-active"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span>{tab === 'login' ? 'Đăng nhập' : 'Đăng ký'}</span>
              </Link>
            ),
          )}
        </nav>
      )}
      {(mode === 'login' || mode === 'signup') && (
        <>
          <div className="auth-oauth-group">
            <button
              type="button"
              className="auth-oauth-btn"
              onClick={() => handleOAuth('google')}
              disabled={busy || busyOAuth !== null}
              aria-label="Tiếp tục với Google"
            >
              {busyOAuth === 'google' ? (
                <LoaderCircle className="auth-spinner" size={18} />
              ) : (
                <GoogleIcon className="auth-oauth-icon" />
              )}
              <span>Google</span>
            </button>
            <button
              type="button"
              className="auth-oauth-btn"
              onClick={() => handleOAuth('facebook')}
              disabled={busy || busyOAuth !== null}
              aria-label="Tiếp tục với Facebook"
            >
              {busyOAuth === 'facebook' ? (
                <LoaderCircle className="auth-spinner" size={18} />
              ) : (
                <FacebookIcon className="auth-oauth-icon" />
              )}
              <span>Facebook</span>
            </button>
          </div>
          <div className="auth-divider">
            <span>hoặc bằng email</span>
          </div>
        </>
      )}
      <form
        className="auth-form"
        onSubmit={submit}
        aria-busy={busy || busyOAuth !== null}
      >
        <fieldset disabled={busy || busyOAuth !== null}>
          {mode === 'signup' && (
            <label className="auth-field" htmlFor="full-name">
              <span>Tên của bạn</span>
              <div className="auth-input">
                <UserRound size={18} />
                <input
                  id="full-name"
                  name="name"
                  autoComplete="name"
                  placeholder="Bạn muốn được gọi là gì?"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </label>
          )}
          {mode !== 'reset' && (
            <label className="auth-field" htmlFor="email">
              <span>Email</span>
              <div className="auth-input">
                <Mail size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ban@example.com"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </label>
          )}
          {mode !== 'forgot' && (!magicLink || mode !== 'login') && (
            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="password">
                  {mode === 'reset' ? 'Mật khẩu mới' : 'Mật khẩu'}
                </label>
              </div>
              <div className="auth-input">
                <LockKeyhole size={18} />
                <input
                  id="password"
                  name="password"
                  type={visible ? 'text' : 'password'}
                  autoComplete={
                    newPassword ? 'new-password' : 'current-password'
                  }
                  placeholder={
                    newPassword
                      ? 'Tạo mật khẩu an toàn'
                      : 'Nhập mật khẩu của bạn'
                  }
                  required
                  minLength={newPassword ? 8 : 1}
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyModifiers}
                  onKeyUp={handleKeyModifiers}
                  aria-describedby={newPassword ? 'password-rules' : undefined}
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setVisible(!visible)}
                  aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  aria-pressed={visible}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {capsLock && (
                <div className="auth-caps-warning">
                  <ArrowUpSquare size={13} />
                  <span>Đang bật Caps Lock</span>
                </div>
              )}
            </div>
          )}

          {/* Ghi nhớ đăng nhập & Quên mật khẩu trên Login */}
          {mode === 'login' && !magicLink && (
            <div className="auth-label-row" style={{ marginTop: 2 }}>
              <label className="auth-check-row">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span
                  className="auth-check-box"
                  data-checked={rememberMe}
                  aria-hidden="true"
                >
                  {rememberMe && <Check size={12} strokeWidth={3} />}
                </span>
                <span>Ghi nhớ đăng nhập</span>
              </label>
              {inModal ? (
                <button
                  type="button"
                  className="auth-inline-link"
                  onClick={() => switchMode('forgot')}
                >
                  Quên mật khẩu?
                </button>
              ) : (
                <Link href="/forgot-password">Quên mật khẩu?</Link>
              )}
            </div>
          )}

          {/* Độ mạnh mật khẩu cho Signup & Reset */}
          {newPassword && (
            <div className="auth-strength" id="password-rules">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                  fontSize: 11,
                  color: '#8b97a2',
                }}
              >
                <span>Độ mạnh mật khẩu:</span>
                <span
                  style={{
                    color: strengthColors[score],
                    fontWeight: 600,
                  }}
                >
                  {password ? strengthLabels[score] : 'Chưa nhập'}
                </span>
              </div>
              <div className="auth-strength-bars" aria-hidden="true">
                {checks.map((_, i) => (
                  <span
                    key={i}
                    data-filled={i < score}
                    style={{
                      backgroundColor:
                        i < score ? strengthColors[score] : undefined,
                    }}
                  />
                ))}
              </div>
              <div className="auth-rules">
                {['8+ ký tự', 'Hoa & thường', 'Có số', 'Ký tự đặc biệt'].map(
                  (rule, i) => (
                    <span key={rule} data-met={checks[i]}>
                      <Check size={11} />
                      {rule}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Ô xác nhận mật khẩu cho Signup & Reset */}
          {newPassword && (
            <div className="auth-field">
              <label htmlFor="confirm-password">
                <span>Xác nhận mật khẩu</span>
              </label>
              <div className="auth-input">
                <LockKeyhole size={18} />
                <input
                  id="confirm-password"
                  name="confirmation"
                  type={visible ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Nhập lại mật khẩu"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  onKeyDown={handleKeyModifiers}
                  onKeyUp={handleKeyModifiers}
                />
              </div>
              {confirmation.length > 0 && (
                <div
                  className="auth-match-status"
                  data-matched={password === confirmation}
                >
                  {password === confirmation ? (
                    <>
                      <Check size={12} />
                      <span>Mật khẩu trùng khớp hoàn toàn</span>
                    </>
                  ) : (
                    <>
                      <CircleAlert size={12} />
                      <span>Mật khẩu chưa khớp</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Magic Link toggle cho Login */}
          {mode === 'login' && (
            <button
              type="button"
              className="auth-magic-toggle"
              onClick={() => {
                setMagicLink(!magicLink);
                setError('');
              }}
            >
              <Wand2 size={14} />
              <span>
                {magicLink
                  ? 'Đăng nhập thông thường bằng mật khẩu'
                  : 'Đăng nhập nhanh bằng Magic Link (không cần mật khẩu)'}
              </span>
            </button>
          )}
        </fieldset>

        <AnimatePresence>
          {error && (
            <motion.div
              className="auth-error"
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <CircleAlert size={17} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="auth-submit"
          type="submit"
          disabled={busy || busyOAuth !== null}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.985 }}
        >
          <span>
            {busy
              ? 'Đang xử lý…'
              : magicLink && mode === 'login'
                ? 'Gửi liên kết đăng nhập'
                : content.button}
          </span>
          {busy ? (
            <LoaderCircle className="auth-spinner" size={18} />
          ) : (
            <ArrowRight size={18} />
          )}
        </motion.button>
      </form>

      <p className="auth-switch">
        {mode === 'login' ? (
          <>
            Chưa có tài khoản?{' '}
            {inModal ? (
              <button
                type="button"
                className="auth-inline-link"
                onClick={() => switchMode('signup')}
              >
                Bắt đầu miễn phí <ArrowRight size={13} />
              </button>
            ) : (
              <Link href="/signup">
                Bắt đầu miễn phí <ArrowRight size={13} />
              </Link>
            )}
          </>
        ) : mode === 'signup' ? (
          <>
            Đã có tài khoản?{' '}
            {inModal ? (
              <button
                type="button"
                className="auth-inline-link"
                onClick={() => switchMode('login')}
              >
                Đăng nhập <ArrowRight size={13} />
              </button>
            ) : (
              <Link href="/login">
                Đăng nhập <ArrowRight size={13} />
              </Link>
            )}
          </>
        ) : inModal ? (
          <button
            type="button"
            className="auth-inline-link"
            onClick={() => switchMode('login')}
          >
            <ArrowLeft size={14} /> Trở về đăng nhập
          </button>
        ) : (
          <Link href="/login">
            <ArrowLeft size={14} /> Trở về đăng nhập
          </Link>
        )}
      </p>

      <div className="auth-fine-print">
        <span /> Không gian riêng. Tự do sáng tạo. <span />
      </div>
    </>
  );
}
