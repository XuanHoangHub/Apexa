'use client';

import { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X, Aperture, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import AuthForm from '@/components/auth/auth-form';
import { useAuthModal } from './auth-modal-context';

export default function AuthModal() {
  const { isOpen, mode, closeAuthModal, setMode } = useAuthModal();
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Close on Escape key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    },
    [closeAuthModal],
  );

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-modal-backdrop"
          className="auth-modal-backdrop"
          aria-modal="true"
          aria-label={mode === 'signup' ? 'Đăng ký tài khoản' : 'Đăng nhập'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeAuthModal();
            }
          }}
        >
          <motion.div
            ref={panelRef}
            className="auth-modal-panel"
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
          >
            {/* Cột trái: Artwork 3D Chrome của Apexa */}
            <div className="auth-modal-art">
              <div className="auth-modal-art-grid" aria-hidden="true" />
              <motion.div
                className="auth-modal-art-image"
                animate={
                  reduced ? undefined : { scale: [1, 1.05, 1], y: [0, -10, 0] }
                }
                transition={{
                  duration: 16,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Image
                  src="/frame-chrome.png"
                  alt="Apexa Chrome 3D Art"
                  fill
                  priority
                  sizes="(max-width: 820px) 0vw, 380px"
                />
              </motion.div>
              <div className="auth-modal-art-shade" />

              <div className="auth-modal-art-header">
                <div className="auth-modal-brand">
                  <Aperture size={24} />
                  <span>
                    apexa<span>.</span>
                  </span>
                </div>
                <span className="auth-modal-art-tag">STUDIO AI</span>
              </div>

              <div className="auth-modal-art-footer">
                <span className="auth-modal-art-eyebrow">
                  {mode === 'signup'
                    ? 'START SOMETHING GREAT'
                    : mode === 'forgot'
                      ? 'ACCOUNT RECOVERY'
                      : 'WELCOME BACK'}
                </span>
                <h2 className="auth-modal-art-quote">
                  {mode === 'signup' ? (
                    <>
                      Sáng tạo từ đây.
                      <br />
                      <span>Không giới hạn.</span>
                    </>
                  ) : mode === 'forgot' ? (
                    <>
                      Khôi phục tài khoản.
                      <br />
                      <span>An toàn & nhanh chóng.</span>
                    </>
                  ) : (
                    <>
                      Chào mừng trở lại.
                      <br />
                      <span>Ý tưởng đang chờ bạn.</span>
                    </>
                  )}
                </h2>
                <p className="auth-modal-art-sub">
                  {mode === 'signup'
                    ? 'Tạo tài khoản để lưu trữ prompt, đồng bộ tác phẩm và mở khóa mô hình AI cao cấp.'
                    : mode === 'forgot'
                      ? 'Nhận liên kết khôi phục mật khẩu an toàn để tiếp tục quản lý không gian sáng tạo.'
                      : 'Đồng bộ không gian làm việc và tiếp tục sáng tạo các tác phẩm hình ảnh và video đỉnh cao.'}
                </p>
                <div className="auth-modal-art-pills">
                  <span className="auth-modal-art-pill">
                    <Sparkles size={13} /> GenAI Studio
                  </span>
                  <span className="auth-modal-art-pill">
                    <Zap size={13} /> Tốc độ cao
                  </span>
                  <span className="auth-modal-art-pill">
                    <ShieldCheck size={13} /> Bảo mật
                  </span>
                </div>
              </div>
            </div>

            {/* Cột phải: Form xác thực */}
            <div className="auth-modal-body">
              <div className="auth-modal-glow" aria-hidden="true" />
              <button
                type="button"
                className="auth-modal-close"
                onClick={closeAuthModal}
                aria-label="Đóng popup"
              >
                <X size={16} />
              </button>
              <AuthForm
                key={mode}
                mode={mode}
                inModal={true}
                onModeChange={setMode}
                onSuccess={closeAuthModal}
                onClose={closeAuthModal}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
