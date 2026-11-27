'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTradingData } from '@/context/TradingDataContext';
import { ShieldCheck, X, ArrowRight, MessageCircle, Lock, Eye, KeyRound, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';

export function InvestorLoginModal() {
  const router = useRouter();
  const { isLoginModalOpen, setIsLoginModalOpen, loginAsGuest, loginWithEmail, loginWithPassword } = useAuth();
  const { data } = useTradingData();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isLoginModalOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#D4A853', '#10B981', '#FFFFFF'],
    });
  };

  const handleEnterTerminal = () => {
    triggerConfetti();
    loginAsGuest();
    router.push('/terminal');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError('Please enter a valid Gmail / email address.');
      return;
    }

    setIsEmailLoading(true);
    try {
      const res = await fetch(`/api/profile?email=${encodeURIComponent(cleanEmail)}`);
      const json = await res.json();
      if (json.success && json.profile) {
        localStorage.setItem('gs_profile', JSON.stringify(json.profile));
      } else {
        localStorage.setItem('gs_profile', JSON.stringify({ name: '', gmail: cleanEmail, phone: '' }));
      }
      loginWithEmail(cleanEmail);
      setEmail('');
      triggerConfetti();
      router.push('/profile');
    } catch {
      setEmailError('Could not load profile. Please try again.');
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = loginWithPassword(password);
    if (result === 'invalid') {
      setError('Invalid investor or admin password.');
      return;
    }
    setPassword('');
    triggerConfetti();
    router.push('/terminal');
  };

  const rawDigits = data.botConfig.whatsappNumber ? data.botConfig.whatsappNumber.replace(/[^0-9]/g, '') : '';
  const cleanNumber = rawDigits.length >= 10 ? rawDigits : '919963303115';
  const waUrl = `https://wa.me/${cleanNumber}?text=Hi%2C%20I%20would%20like%20to%20request%20private%20MT5%20investor%20read-only%20credentials%20to%20audit%20Gold%20Star%20Bot.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="modal-spring-in relative w-full max-w-md rounded-3xl bg-dark-card border border-gold-500/40 shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[92vh] overflow-y-auto">
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
        <div className="text-center space-y-2 mb-5">
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
        <div className="space-y-3.5">
          <button
            onClick={handleEnterTerminal}
            type="button"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-base font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-subtle transition-all duration-200 hover:scale-[1.01]"
          >
            <Eye className="w-4 h-4" />
            <span>View Live Terminal (Free Web Access)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* User Login by Email Only (No Password) */}
          <form onSubmit={handleEmailSubmit} className="p-3.5 rounded-2xl bg-dark-elevated/70 border border-gold-500/25 space-y-2.5">
            <div className="flex items-center gap-2 text-gold-300 font-semibold text-xs">
              <Mail className="w-3.5 h-3.5 text-gold-400" />
              <span>User Profile Login (Email Only — No Password)</span>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="yourname@gmail.com"
                className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-dark-base border border-dark-border text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-gold-500"
              />
              <button
                type="submit"
                disabled={isEmailLoading}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-colors disabled:opacity-50 shrink-0"
              >
                {isEmailLoading ? '...' : 'Sign In'}
              </button>
            </div>
            {emailError && <p className="text-[11px] text-fintech-red font-mono">{emailError}</p>}
          </form>

          {/* Investor / Admin Password Login */}
          <form onSubmit={handlePasswordSubmit} className="p-3.5 rounded-2xl bg-dark-elevated/70 border border-dark-border space-y-2.5">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
              <KeyRound className="w-3.5 h-3.5 text-gold-400" />
              <span>Admin / Investor Access</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter access password..."
                className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-dark-base border border-dark-border text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-gold-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/40 text-gold-300 text-xs font-bold transition-colors shrink-0"
              >
                Unlock
              </button>
            </div>
            {error && <p className="text-[11px] text-fintech-red font-mono">{error}</p>}
          </form>

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
