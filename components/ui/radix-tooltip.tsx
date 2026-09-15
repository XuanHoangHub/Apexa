'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-md border border-white/10 bg-[#191a1d]/95 px-3 py-1.5 text-xs text-[#f2f2f3] shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
        className,
      )}
      {...props}
    >
      {children}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * Convenient wrapper for instant tooltip with optional keyboard shortcut tag
 */
export function StudioTooltip({
  content,
  kbd,
  side = 'top',
  children,
  delayDuration = 180,
}: {
  content: React.ReactNode;
  kbd?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  children: React.ReactNode;
  delayDuration?: number;
}) {
  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className="flex items-center gap-2">
        <span>{content}</span>
        {kbd && (
          <kbd className="ml-1 rounded border border-white/20 bg-white/5 px-1 py-0.5 text-[10px] font-mono text-[#00d2ff]">
            {kbd}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
