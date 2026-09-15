'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Aperture,
  ArrowUpRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      <main className="auth-page" lang="vi">
        <section className="auth-art" aria-label="Apexa Creative Studio">
          <Link href="/" className="auth-brand" aria-label="Apexa — về studio">
            <Aperture size={30} />
            <span>
              apexa<span>.</span>
            </span>
          </Link>
          <div className="auth-art-grid" aria-hidden="true" />
          <motion.div
            className="auth-art-image"
            animate={
              reduced ? undefined : { scale: [1, 1.045, 1], y: [0, -12, 0] }
            }
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image
              src="/frame-chrome.png"
              alt="Tác phẩm chrome trừu tượng phản chiếu ánh sáng cyan"
              fill
              priority
              sizes="(max-width: 850px) 100vw, 56vw"
            />
          </motion.div>
          <div className="auth-art-shade" />
          <span className="auth-art-caption">
            <span /> APEXA ORIGINAL / 001
          </span>
          <div className="auth-floating-label">
            <Sparkles size={14} /> Một ý tưởng. Vô hạn khả năng.
          </div>
          <div className="auth-art-copy">
            <span className="auth-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
            <h2>
              Ý tưởng của bạn.
              <br />
              <span>Không giới hạn.</span>
            </h2>
            <p>
              Một không gian cho những ý tưởng táo bạo.
              <br />
              Bắt đầu hành trình sáng tạo cùng Apexa.
            </p>
            <div className="auth-art-bottom">
              <span>
                <i /> IMAGINE. CREATE. REPEAT.
              </span>
              <ArrowUpRight size={23} />
            </div>
          </div>
        </section>
        <section className="auth-panel">
          <header className="auth-panel-header">
            <Link href="/" className="auth-back">
              <ArrowLeft size={15} /> Về studio
            </Link>
            <span className="auth-header-note">
              Không gian sáng tạo của bạn
            </span>
          </header>
          <motion.div
            className="auth-content"
            key={pathname}
            initial={{ opacity: 0, y: reduced ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
          <footer className="auth-footer">
            <span>© {new Date().getFullYear()} Apexa</span>
            <span>
              <ShieldCheck size={14} /> Kết nối được bảo mật
            </span>
          </footer>
        </section>
      </main>
    </MotionConfig>
  );
}
