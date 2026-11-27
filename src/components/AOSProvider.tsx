'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AOS from 'aos';
import 'aos/dist/aos.css';

export function AOSProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    AOS.init({
      duration: 550,
      offset: 80,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  useEffect(() => {
    const id = setTimeout(() => AOS.refresh(), 100);
    return () => clearTimeout(id);
  }, [pathname]);

  return <>{children}</>;
}
