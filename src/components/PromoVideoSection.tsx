'use client';

import React, { useRef, useState, useEffect } from 'react';

export function PromoVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── autoplay when scrolled into view ── */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().then(() => setIsPlaying(true)).catch(() => {});
        } else {
          el.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── progress bar ── */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onTime = () => setProgress((el.currentTime / el.duration) * 100 || 0);
    el.addEventListener('timeupdate', onTime);
    return () => el.removeEventListener('timeupdate', onTime);
  }, []);

  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) { el.play(); setIsPlaying(true); }
    else { el.pause(); setIsPlaying(false); }
  }

  function toggleMute() {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  }

  function toggleFullscreen() {
    const c = containerRef.current;
    if (!c) return;
    if (!document.fullscreenElement) {
      c.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }

  function seekTo(e: React.MouseEvent<HTMLDivElement>) {
    const el = videoRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    el.currentTime = pct * el.duration;
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Section header */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-3 py-1 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-widest">
            Live Promo
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          See Gold Star MT5 in Action
        </h2>
        <p className="text-sm text-slate-400">
          13 seconds · 5 strategies · Zero Martingale · Read-only verified
        </p>
      </div>

      {/* Video card */}
      <div
        ref={containerRef}
        className="relative mx-auto max-w-4xl rounded-2xl overflow-hidden border border-dark-border bg-dark-card shadow-2xl shadow-black/40 group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Gold glow ring on hover */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500 z-10"
          style={{
            boxShadow: hovered ? '0 0 0 1.5px #D4A853, 0 0 32px 4px rgba(212,168,83,0.15)' : 'none',
          }}
        />

        {/* Video element */}
        <video
          ref={videoRef}
          src="/promo/gold-star-promo-master.mp4"
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full aspect-video object-cover block"
          onClick={togglePlay}
          style={{ cursor: 'pointer' }}
        />

        {/* Centre play/pause overlay — fades out when playing + not hovered */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none z-20 ${
            !isPlaying || hovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            className="pointer-events-auto w-16 h-16 rounded-full bg-black/60 border border-gold-500/40 flex items-center justify-center backdrop-blur-sm hover:bg-gold-500/20 hover:border-gold-400 transition-all"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              /* Pause icon */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="4" width="4" height="16" rx="1" fill="#D4A853" />
                <rect x="15" y="4" width="4" height="16" rx="1" fill="#D4A853" />
              </svg>
            ) : (
              /* Play icon */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M6 4.5L19.5 12 6 19.5V4.5Z" fill="#D4A853" />
              </svg>
            )}
          </button>
        </div>

        {/* Bottom controls bar — slides up on hover */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-30 transition-transform duration-300 ${
            hovered ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Progress bar */}
          <div
            className="h-1 bg-white/10 cursor-pointer"
            onClick={seekTo}
          >
            <div
              className="h-full bg-gold-400 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-t from-black/90 to-black/60 backdrop-blur-sm">
            {/* Left: play + mute */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="text-white hover:text-gold-400 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="5" y="4" width="4" height="16" rx="1" />
                    <rect x="15" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4.5L19.5 12 6 19.5V4.5Z" />
                  </svg>
                )}
              </button>

              <button
                onClick={toggleMute}
                className="text-white hover:text-gold-400 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 5L6 9H2v6h4l5 4V5zm8.07 2.93a9 9 0 010 12.74M15.54 9.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/>
                    <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                  </svg>
                )}
              </button>

              <span className="text-[10px] text-slate-400 font-mono">
                {isMuted ? 'Click 🔊 for audio' : '🔊 Audio on'}
              </span>
            </div>

            {/* Right: label + fullscreen */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-gold-400 font-semibold uppercase tracking-wider hidden sm:block">
                Gold Star MT5 · Official Promo
              </span>
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gold-400 transition-colors"
                aria-label="Fullscreen"
              >
                {isFullscreen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Top badge — always visible */}
        <div className="absolute top-3 left-3 z-20">
          <span className="inline-flex items-center gap-1.5 bg-black/70 border border-gold-500/30 rounded-full px-2.5 py-1 text-[10px] font-semibold text-gold-400 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE · 13s PROMO
          </span>
        </div>
      </div>

      {/* Below-video CTA strip */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
        <a
          href="https://wa.me/919963303115?text=Hi%2C%20I%20saw%20your%20Gold%20Star%20MT5%20promo%20and%20want%20investor%20access."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-gold-500/20 tactile-press"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.561 4.14 1.535 5.874L.057 23.886a.75.75 0 00.937.937l5.994-1.479A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75A9.712 9.712 0 016.59 20.1l-.428-.255-4.459 1.1 1.117-4.344-.279-.453A9.713 9.713 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
          </svg>
          WhatsApp +91 9963303115
        </a>
        <a
          href="https://t.me/Chinna119"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-slate-600 hover:border-gold-500/50 text-slate-300 hover:text-gold-400 font-semibold text-sm px-6 py-3 rounded-xl transition-all tactile-press"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.993 13.42l-2.957-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.953l.32-.814z"/>
          </svg>
          Telegram @Chinna119
        </a>
        <a
          href="/terminal"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-gold-400 font-semibold text-sm px-4 py-3 transition-colors"
        >
          View Live Terminal →
        </a>
      </div>
    </section>
  );
}
