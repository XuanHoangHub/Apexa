'use client';

import { useCallback } from 'react';
import gsap from 'gsap';

interface TiltOptions {
  maxRotation?: number;
  scale?: number;
  perspective?: number;
  speed?: number;
}

export function useGsapTilt(options: TiltOptions = {}) {
  const {
    maxRotation = 8,
    scale = 1.02,
    perspective = 1000,
    speed = 0.4,
  } = options;

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width - 0.5) * 2; // -1 to 1
      const normY = (y / rect.height - 0.5) * 2; // -1 to 1

      // Set CSS variables for radial flashlight/reflection
      target.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      target.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);

      gsap.to(target, {
        rotateY: normX * maxRotation,
        rotateX: -normY * maxRotation,
        scale,
        transformPerspective: perspective,
        transformStyle: 'preserve-3d',
        duration: speed,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    },
    [maxRotation, scale, perspective, speed],
  );

  const onMouseLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    gsap.to(target, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.6,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  }, []);

  return { onMouseMove, onMouseLeave };
}
