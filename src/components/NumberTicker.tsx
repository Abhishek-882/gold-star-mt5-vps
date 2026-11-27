'use client';

import React, { useEffect, useRef, useState } from 'react';

interface NumberTickerProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  showSign?: boolean;
  durationMs?: number;
}

export function NumberTicker({
  value,
  decimals = 2,
  prefix = '',
  suffix = '',
  showSign = false,
  durationMs = 520,
}: NumberTickerProps) {
  const [display, setDisplay] = useState<number>(value);
  const prevRef = useRef<number>(value);

  useEffect(() => {
    const startVal = prevRef.current;
    const endVal = Number.isFinite(value) ? value : 0;
    if (Math.abs(endVal - startVal) < 0.0001) {
      setDisplay(endVal);
      prevRef.current = endVal;
      return;
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplay(endVal);
      prevRef.current = endVal;
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Expressive cubic-out deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * eased;
      setDisplay(current);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplay(endVal);
        prevRef.current = endVal;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      prevRef.current = endVal;
    };
  }, [value, durationMs]);

  const absFormatted = Math.abs(display).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const sign = showSign ? (display >= 0 ? '+' : '-') : display < 0 ? '-' : '';
  return (
    <>
      {sign}
      {prefix}
      {absFormatted}
      {suffix}
    </>
  );
}
