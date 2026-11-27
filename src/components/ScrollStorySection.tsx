'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { createScope, createTimeline, svg, stagger } from 'animejs';
import { ShieldCheck, Cpu, Lock, Star, ArrowRight, Activity } from 'lucide-react';
import { useTradingData } from '@/context/TradingDataContext';

export function ScrollStorySection() {
  const { data } = useTradingData();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    let rafId = 0;
    let targetProgress = 0;
    let currentProgress = 0;
    let isVisible = false;

    const scope = createScope({
      root,
      mediaQueries: {
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
    });

    let timeline: ReturnType<typeof createTimeline> | null = null;

    scope.add((self) => {
      if (self?.matches?.reduceMotion) return;

      const tl = createTimeline({
        autoplay: false,
      });

      // 1. Gentle 3D Vault Card unfold (GPU transform only, no backdrop-blur stall)
      tl.add(
        '.vault-core-card',
        {
          rotateX: [14, 0],
          rotateY: [-8, 0],
          scale: [0.92, 1],
          opacity: [0.75, 1],
          duration: 350,
          ease: 'outCubic',
        },
        0
      )
        // 2. Dual orbital rings counter-rotate smoothly
        .add(
          '.orbital-ring-outer',
          {
            rotate: [0, 120],
            scale: [0.92, 1.04],
            opacity: [0.25, 0.6],
            duration: 1000,
            ease: 'linear',
          },
          0
        )
        .add(
          '.orbital-ring-inner',
          {
            rotate: [0, -90],
            scale: [0.94, 1.02],
            opacity: [0.25, 0.7],
            duration: 1000,
            ease: 'linear',
          },
          0
        )
        // 3. Self-drawing SVG Equity Curve
        .add(
          svg.createDrawable('.scroll-equity-line'),
          {
            draw: ['0 0', '0 1'],
            duration: 500,
            ease: 'inOutQuad',
          },
          100
        )
        // 4. Orbital feature pills
        .add(
          '.orbit-pill',
          {
            y: [22, 0],
            scale: [0.94, 1],
            opacity: [0, 1],
            delay: stagger(60),
            duration: 240,
            ease: 'outCubic',
          },
          180
        )
        // 5. 5-Strategy Desk chips
        .add(
          '.desk-chip',
          {
            y: [12, 0],
            opacity: [0.25, 1],
            delay: stagger(40),
            duration: 180,
            ease: 'outQuad',
          },
          420
        )
        // 6. Scroll progress rail fills 0 -> 100%
        .add(
          '.scroll-scrub-fill',
          {
            scaleX: [0, 1],
            duration: 1000,
            ease: 'linear',
          },
          0
        );

      timeline = tl;
    });

    const computeTarget = () => {
      const rect = root.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) {
        targetProgress = 1;
        return;
      }
      // Start slightly before top hits 0 so entry feels seamless, finish at bottom
      const scrolled = -rect.top + window.innerHeight * 0.15;
      const range = totalScrollable + window.innerHeight * 0.15;
      targetProgress = Math.max(0, Math.min(1, scrolled / range));
    };

    const tick = () => {
      if (timeline && isVisible) {
        // Exponential lerp: glides smoothly through fast wheel flicks without skipping
        currentProgress += (targetProgress - currentProgress) * 0.14;
        if (Math.abs(targetProgress - currentProgress) < 0.0005) {
          currentProgress = targetProgress;
        }
        timeline.seek(timeline.duration * currentProgress);
      }
      if (isVisible) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          computeTarget();
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(rafId);
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(root);
    window.addEventListener('scroll', computeTarget, { passive: true });
    window.addEventListener('resize', computeTarget, { passive: true });
    computeTarget();

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('scroll', computeTarget);
      window.removeEventListener('resize', computeTarget);
      scope.revert();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      aria-label="Scroll-Scrubbed Institutional Architecture"
      className="scroll-stage-track relative w-full min-h-[220vh]"
    >
      {/* Pinned Stage below sticky top bar */}
      <div className="sticky top-12 h-[calc(100vh-3rem)] w-full overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Ambient Radial Spotlight */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-[480px] h-[480px] rounded-full bg-gold-500/8 blur-3xl" />
          <div className="orbital-ring-outer will-change-transform absolute w-[480px] h-[480px] sm:w-[620px] sm:h-[620px] rounded-full border border-dashed border-gold-500/25" />
          <div className="orbital-ring-inner will-change-transform absolute w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] rounded-full border border-gold-500/20" />
        </div>

        <div className="relative z-10 max-w-6xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-[11px] font-mono font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-gold-400" />
              <span>Scroll-Scrubbed 3D Execution Engine</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Inside the <span className="text-gold-400">Gold Star</span> Architecture
            </h2>
          </div>

          {/* 3D Perspective Stage */}
          <div style={{ perspective: '1200px' }} className="relative">
            <div className="vault-core-card will-change-transform rounded-3xl bg-gradient-to-br from-dark-elevated via-dark-card to-dark-base border border-gold-500/35 p-5 sm:p-8 shadow-gold-glow gold-border-beam">
              {/* Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-dark-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gold-500/15 border border-gold-500/40 flex items-center justify-center text-gold-400">
                    <Star className="w-4 h-4 fill-gold-400" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white tracking-tight">
                      GOLD STAR EXECUTION VAULT
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {data.botConfig.broker} • {data.botConfig.server}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-fintech-greenSoft border border-fintech-green/30 text-fintech-green font-bold">
                    {data.botConfig.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-dark-base border border-dark-border text-gold-300 font-bold">
                    {data.metrics.winRate.toFixed(1)}% WIN
                  </span>
                </div>
              </div>

              {/* Center: Self-Drawing SVG Equity Path + Orbital Telemetry Pills */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* SVG Drawable Curve */}
                <div className="lg:col-span-7 rounded-2xl bg-dark-base/80 border border-dark-border p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                    <span>EQUITY TRAJECTORY (SCROLL-SCRUBBED)</span>
                    <span className="text-fintech-green font-bold">
                      +${data.metrics.closedPnl.toFixed(2)} NET
                    </span>
                  </div>
                  <svg
                    viewBox="0 0 520 150"
                    className="w-full h-32 sm:h-36 overflow-visible"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="goldCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#B88B36" />
                        <stop offset="60%" stopColor="#E6C27A" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="35" x2="520" y2="35" stroke="#232632" strokeDasharray="4 4" />
                    <line x1="0" y1="75" x2="520" y2="75" stroke="#232632" strokeDasharray="4 4" />
                    <line x1="0" y1="115" x2="520" y2="115" stroke="#232632" strokeDasharray="4 4" />
                    <path
                      className="scroll-equity-line"
                      d="M 8 128 C 65 126, 95 112, 145 104 C 195 96, 225 92, 270 76 C 320 58, 360 60, 410 38 C 450 22, 485 18, 512 12"
                      fill="none"
                      stroke="url(#goldCurveGrad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* 4 Orbital Risk & Architecture Pills */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-3 font-mono">
                  <div className="orbit-pill will-change-transform p-3.5 rounded-xl bg-dark-base/90 border border-dark-border">
                    <ShieldCheck className="w-4 h-4 text-fintech-green mb-1.5" />
                    <div className="text-[10px] text-slate-500 uppercase">Hard Stop Loss</div>
                    <div className="text-xs font-bold text-white mt-0.5">25–45 Pips</div>
                  </div>
                  <div className="orbit-pill will-change-transform p-3.5 rounded-xl bg-dark-base/90 border border-dark-border">
                    <Lock className="w-4 h-4 text-gold-400 mb-1.5" />
                    <div className="text-[10px] text-slate-500 uppercase">Martingale</div>
                    <div className="text-xs font-bold text-fintech-green mt-0.5">0.00% (OFF)</div>
                  </div>
                  <div className="orbit-pill will-change-transform p-3.5 rounded-xl bg-dark-base/90 border border-dark-border">
                    <Cpu className="w-4 h-4 text-gold-400 mb-1.5" />
                    <div className="text-[10px] text-slate-500 uppercase">MT5 Terminals</div>
                    <div className="text-xs font-bold text-white mt-0.5">2 Live Desks</div>
                  </div>
                  <div className="orbit-pill will-change-transform p-3.5 rounded-xl bg-dark-base/90 border border-dark-border">
                    <Star className="w-4 h-4 text-gold-400 fill-gold-400 mb-1.5" />
                    <div className="text-[10px] text-slate-500 uppercase">Live Equity</div>
                    <div className="text-xs font-bold text-gold-300 mt-0.5">
                      ${data.metrics.equity.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: 5-Strategy Desk Strip + Scrub Progress */}
              <div className="mt-5 pt-4 border-t border-dark-border space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                    {['Valen Prime ★', 'Valen Edge', 'Valen Triad', 'Valen Arc', 'Valen Pulse'].map(
                      (name, i) => (
                        <span
                          key={name}
                          className={`desk-chip will-change-transform px-2.5 py-1 rounded-lg border ${
                            i === 0
                              ? 'bg-gold-500/20 border-gold-500/40 text-gold-300 font-bold'
                              : 'bg-dark-base border-dark-border text-slate-300'
                          }`}
                        >
                          {name}
                        </span>
                      )
                    )}
                  </div>

                  <Link
                    href="/terminal"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-base font-bold text-xs tactile-press"
                  >
                    <span>Open Live Terminal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Scrub Progress Bar */}
                <div className="w-full h-1 bg-dark-base rounded-full overflow-hidden">
                  <div
                    className="scroll-scrub-fill will-change-transform h-full bg-gradient-to-r from-gold-600 via-gold-400 to-fintech-green origin-left"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
