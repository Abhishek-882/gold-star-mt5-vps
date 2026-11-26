'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTradingData } from '@/context/TradingDataContext';
import { Home, Activity, User, MessageCircle } from 'lucide-react';

export function StickyMobileBar() {
  const pathname = usePathname();
  const { data } = useTradingData();
  const { botConfig } = data;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 px-2.5 pt-2 safe-bottom-pad bg-dark-base/95 backdrop-blur-xl border-t border-dark-border sm:hidden shadow-2xl"
    >
      <div className="grid grid-cols-4 gap-1.5 max-w-md mx-auto">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-xl border text-[11px] font-bold transition-all active:scale-95 ${
            pathname === '/'
              ? 'bg-gold-500/20 border-gold-500/50 text-gold-300'
              : 'bg-dark-card border-dark-border text-slate-300'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Intro</span>
        </Link>

        <Link
          href="/terminal"
          className={`flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-xl border text-[11px] font-bold transition-all active:scale-95 ${
            pathname === '/terminal'
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
              : 'bg-dark-card border-dark-border text-slate-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Terminal</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-xl border text-[11px] font-bold transition-all active:scale-95 ${
            pathname === '/profile'
              ? 'bg-gold-500/20 border-gold-500/50 text-gold-300'
              : 'bg-dark-card border-dark-border text-slate-300'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </Link>

        <a
          href={
            (botConfig.whatsappNumber || '').replace(/[^0-9]/g, '').length >= 10
              ? `https://wa.me/${botConfig.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20would%20like%20to%20request%20Gold%20Star%20MT5%20Bot%20demo%20access.`
              : 'https://wa.me/919963303115?text=Hi%2C%20I%20would%20like%20to%20request%20Gold%20Star%20MT5%20Bot%20demo%20access.'
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-[11px] font-bold transition-all active:scale-95"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}
