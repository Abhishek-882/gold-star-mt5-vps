'use client';

import React, { useEffect, useState } from 'react';

export function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const progress = Number((currentScroll / scrollHeight).toFixed(4));
        setScrollProgress(Math.min(100, Math.max(0, progress * 100)));
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollProgress();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] bg-dark-border/40 pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-amber-500 via-gold-400 to-yellow-200 transition-[width] duration-75 ease-out shadow-[0_0_12px_rgba(255,215,0,0.8)] relative"
        style={{ width: `${scrollProgress}%` }}
      >
        {/* Glowing tip indicator */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-100 shadow-[0_0_8px_#FFF] -mr-1"></div>
      </div>
    </div>
  );
}
