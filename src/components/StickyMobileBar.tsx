'use client';

import React from 'react';
import { useTradingData } from '@/context/TradingDataContext';
import { Send, MessageCircle, Instagram } from 'lucide-react';

export function StickyMobileBar() {
  const { data } = useTradingData();
  const { botConfig } = data;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2.5 bg-dark-base/90 backdrop-blur-xl border-t border-dark-border sm:hidden shadow-2xl">
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {/* Telegram */}
        <a
          href={botConfig.telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-[#229ED9]/20 hover:bg-[#229ED9]/30 border border-[#229ED9]/40 text-[#229ED9] text-xs font-bold transition-all active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Telegram</span>
        </a>

        {/* WhatsApp */}
        <a
          href={botConfig.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-bold transition-all active:scale-95 shadow-green-glow"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>

        {/* Instagram */}
        <a
          href={botConfig.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#833AB4]/20 to-[#FD1D1D]/20 hover:from-[#833AB4]/30 hover:to-[#FD1D1D]/30 border border-pink-500/40 text-pink-300 text-xs font-bold transition-all active:scale-95"
        >
          <Instagram className="w-3.5 h-3.5" />
          <span>Instagram</span>
        </a>
      </div>
    </div>
  );
}
