'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTradingData } from '@/context/TradingDataContext';
import { ShieldCheck, X, ArrowRight, MessageCircle, Sparkles, Lock, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';

export function InvestorLoginModal() {
  const { isLoginModalOpen, setIsLoginModalOpen, loginAsGuest } = useAuth();
  const { data } = useTradingData();

  if (!isLoginModalOpen) return null;

  const handleEnterTerminal = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#00C087', '#FFFFFF'],
    });
    loginAsGuest();
  };

  const cleanNumber = data.botConfig.whatsappNumber ? data.botConfig.whatsappNumber.replace(/[^0-9]/g, '') : '';
  const waUrl = cleanNumber
    ? `https://wa.me/${cleanNumber}?text=Hi%2C%20I%20would%20like%20to%20request%20private%20MT5%20investor%20read-only%20credentials%20to%20audit%20Gold%20Star%20Bot.`
    : data.botConfig.whatsappUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-dark-card border border-gold-500/40 shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-gold-500/15 rounded-full blur-2xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mx-auto shadow-gold-subtle">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Audited Live Terminal
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            View live real-time equity curve, floating positions, and closed trade execution.
          </p>
        </div>

        {/* Instant Free Terminal Access */}
        <div className="space-y-4">
          <button
            onClick={handleEnterTerminal}
            type="button"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-base font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-subtle transition-all duration-200 hover:scale-[1.01]"
          >
            <Eye className="w-4 h-4" />
            <span>View Live Terminal (Free Web Access)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Investor Password Protection Notice */}
          <div className="p-4 rounded-2xl bg-dark-elevated/70 border border-dark-border text-left space-y-2">
            <div className="flex items-center gap-2 text-gold-300 font-semibold text-xs">
              <Lock className="w-3.5 h-3.5 text-gold-400" />
              <span>Direct MT5 Terminal Access Policy</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              To protect trading operations and prevent unauthorized execution, the MT5 investor password is not displayed publicly. Contact our quantitative desk on WhatsApp or Telegram to receive personal read-only MT5 credentials.
            </p>
          </div>

          {/* WhatsApp Direct Request */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Request MT5 Credentials on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
