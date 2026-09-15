'use client';

import * as React from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { cn } from '@/lib/utils';
import { Sparkles, Wand2, Camera, Compass } from 'lucide-react';
import type { Work } from '@/lib/studio-data';

export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export const HoverCardContent = React.forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = 'center', sideOffset = 8, ...props }, ref) => (
  <HoverCardPrimitive.Portal>
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-80 rounded-xl border border-white/10 bg-[#191a1d]/95 p-4 text-[#f2f2f3] shadow-2xl backdrop-blur-xl outline-none transition-all duration-200 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </HoverCardPrimitive.Portal>
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

/**
 * Modern AI Artwork Inspector Card
 */
export function ArtworkInspectorCard({
  work,
  onRemix,
  children,
}: {
  work: Work;
  onRemix?: (w: Work) => void;
  children: React.ReactNode;
}) {
  return (
    <HoverCard openDelay={250} closeDelay={150}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side="top" className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00d2ff]/20 text-[#00d2ff]">
              <Sparkles size={12} />
            </span>
            <span className="text-xs font-semibold tracking-wider text-[#00d2ff] uppercase">
              {work.category}
            </span>
          </div>
          <span className="text-[11px] text-white/50">{work.author}</span>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">
            {work.title}
          </h4>
          <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-white/70 italic">
            &ldquo;{work.prompt}&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] p-2 text-[11px] text-white/70">
          <div className="flex items-center gap-1.5">
            <Camera size={12} className="text-[#00d2ff]" />
            <span>35mm Anamorphic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Compass size={12} className="text-[#00d2ff]" />
            <span>Volumetric Light</span>
          </div>
        </div>

        {onRemix && (
          <button
            onClick={() => onRemix(work)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00d2ff] px-3 py-1.5 text-xs font-semibold text-[#03131e] transition hover:bg-[#38dcff] active:scale-[0.98]"
          >
            <Wand2 size={13} />
            Instant Remix Prompt
          </button>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
