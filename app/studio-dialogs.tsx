'use client';
import NextImage from 'next/image';
import {
  Aperture,
  ArrowUpRight,
  Sparkles,
  Bookmark,
  Check,
  Zap,
  Film,
  Clapperboard,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuthModal } from '@/components/auth/auth-modal-context';
import type { Work } from '@/lib/studio-data';
type Props = {
  detail: Work | null;
  setDetail: (value: Work | null) => void;
  help: boolean;
  setHelp: (value: boolean) => void;
  saved: string[];
  remix: (work: Work) => void;
  onAnimateWork?: (work: Work) => void;
  onAddToStoryboardWork?: (work: Work) => void;
  onUseAsReference?: (work: Work) => void;
  toggleSave: (id: string) => void;
};
export default function StudioDialogs({
  detail,
  setDetail,
  help,
  setHelp,
  saved,
  remix,
  onAnimateWork,
  onAddToStoryboardWork,
  onUseAsReference,
  toggleSave,
}: Props) {
  const { requireAuth } = useAuthModal();

  return (
    <>
      {' '}
      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="detail-dialog">
          {detail && (
            <>
              <NextImage
                className="detail-image"
                width={900}
                height={1100}
                sizes="(max-width: 767px) 90vw, 460px"
                src={detail.image}
                alt={detail.title}
              />
              <div className="detail-body">
                <span className="eyebrow">{detail.category}</span>
                <DialogTitle>{detail.title}</DialogTitle>
                <DialogDescription>
                  {detail.author} ·{' '}
                  {detail.source
                    ? 'Creative reference inspiration'
                    : 'Apexa original AI artwork'}
                </DialogDescription>
                <span className="field-label">Suggested prompt</span>
                <p className="detail-prompt">{detail.prompt}</p>
                <div className="detail-actions">
                  <button
                    className="button primary"
                    onClick={() =>
                      requireAuth(
                        () => remix(detail),
                        'Vui lòng đăng nhập để sử dụng prompt này trong Studio.',
                      )
                    }
                  >
                    <Sparkles size={16} />
                    Remix as Image
                  </button>
                  {onAnimateWork && (
                    <button
                      className="button secondary"
                      onClick={() =>
                        requireAuth(
                          () => onAnimateWork(detail),
                          'Vui lòng đăng nhập để animate hình ảnh này.',
                        )
                      }
                      title="Animate this inspiration in Video Studio"
                    >
                      <Film size={15} />
                      Animate in Video
                    </button>
                  )}
                  {onAddToStoryboardWork && (
                    <button
                      className="button secondary"
                      onClick={() =>
                        requireAuth(
                          () => onAddToStoryboardWork(detail),
                          'Vui lòng đăng nhập để thêm cảnh vào Storyboard.',
                        )
                      }
                      title="Add to Cinema Storyboard"
                    >
                      <Clapperboard size={15} />
                      Add to Storyboard
                    </button>
                  )}
                  {onUseAsReference && (
                    <button
                      className="button secondary"
                      onClick={() =>
                        requireAuth(
                          () => onUseAsReference(detail),
                          'Vui lòng đăng nhập để dùng ảnh làm tham chiếu.',
                        )
                      }
                      title="Set as reference image"
                    >
                      <ImageIcon size={15} />
                      Use Reference
                    </button>
                  )}
                  <button
                    className="button secondary"
                    onClick={() =>
                      requireAuth(
                        () => toggleSave(detail.id),
                        'Vui lòng đăng nhập để lưu tác phẩm vào bộ sưu tập.',
                      )
                    }
                  >
                    <Bookmark size={16} />
                    {saved.includes(detail.id) ? 'Saved' : 'Save concept'}
                  </button>
                </div>
                {detail.source && (
                  <a
                    className="source-link"
                    href={detail.source}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View original on Unsplash <ArrowUpRight size={12} />
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="help-dialog">
          <div className="header-brand">
            <Aperture />
            <span>
              apexa<span className="brand-dot">.</span>
            </span>
          </div>
          <DialogTitle>A creative space for your ideas.</DialogTitle>
          <DialogDescription>
            Apexa is an independent creative studio. This preview emphasizes
            production workflows and creative exploration.
          </DialogDescription>
          <div className="help-feature">
            <Check />
            Explore, remix prompts, and bookmark inspiration.
          </div>
          <div className="help-feature">
            <Check />
            Upload imagery, adjust color grades, and export PNGs locally.
          </div>
          <div className="help-feature">
            <Check />
            Author storyboards, export creative briefs, and audition speech.
          </div>
          <div className="help-shortcuts">
            <b>Keyboard Shortcuts</b>
            <div className="shortcut-row">
              <span>Quick Command Palette</span>
              <kbd>Ctrl+K / ⌘K</kbd>
            </div>
            <div className="shortcut-row">
              <span>Switch Modes (1–9)</span>
              <kbd>1 – 9</kbd>
            </div>
            <div className="shortcut-row">
              <span>Search Inspiration</span>
              <kbd>/</kbd>
            </div>
            <div className="shortcut-row">
              <span>New Project</span>
              <kbd>N</kbd>
            </div>
          </div>
          <div className="connection-note">
            <Zap size={18} />
            <div>
              <b>AI Integration</b>
              <p>
                Generating images and video requires a configured AI provider
                endpoint. No model is currently connected. No credits or fees
                are charged.
              </p>
            </div>
          </div>
          <p className="field-hint">
            Drafts and saved works are retained only in this browser session.
            Account authentication is powered by Supabase; drafts are not yet
            synced to the cloud. Reference photography is credited to Unsplash
            contributors; chrome artwork is original. Apexa has no affiliation
            with third-party providers.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
