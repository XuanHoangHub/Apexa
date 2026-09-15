'use client';

import * as React from 'react';
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  type HTMLMotionProps,
  type Transition,
} from 'framer-motion';
import { cn } from '@/lib/utils';

export { motion, AnimatePresence, LayoutGroup };

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
};

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 24,
};

/**
 * High-performance interactive spring button
 */
export const MotionButton = React.forwardRef<
  HTMLButtonElement,
  HTMLMotionProps<'button'>
>(({ className, children, ...props }, ref) => (
  <motion.button
    ref={ref}
    whileHover={{ scale: 1.025 }}
    whileTap={{ scale: 0.96 }}
    transition={springTransition}
    className={cn(className)}
    {...props}
  >
    {children}
  </motion.button>
));
MotionButton.displayName = 'MotionButton';

/**
 * Shared layout sliding pill indicator for tabs and navs
 */
export function SlidingActivePill({
  layoutId,
  className,
}: {
  layoutId: string;
  className?: string;
}) {
  return (
    <motion.span
      layoutId={layoutId}
      className={cn(
        'absolute inset-0 rounded-[inherit] pointer-events-none -z-1',
        className,
      )}
      transition={{
        type: 'spring',
        stiffness: 480,
        damping: 36,
      }}
    />
  );
}

/**
 * Animated Toast Popup with spring entry and exit
 */
export function MotionToast({
  children,
  onDismiss,
}: {
  children: React.ReactNode;
  onDismiss?: () => void;
}) {
  return (
    <motion.output
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.94 }}
      transition={gentleSpring}
      className="toast"
      onClick={onDismiss}
    >
      {children}
    </motion.output>
  );
}
