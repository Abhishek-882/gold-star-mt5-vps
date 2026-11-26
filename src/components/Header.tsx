'use client';

import React from 'react';
import { useTradingData } from '@/context/TradingDataContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Star, ShieldCheck, RefreshCw, Settings, Globe, Radio, Lock } from 'lucide-react';

export function Header() {
  const { data, refreshData, isRefreshing, lastSyncFormatted, setIsSettingsOpen } = useTradingData();
  const { language, toggleLanguage, t } = useLanguage();
  const { logout } = useAuth();

  const isLive = data.botConfig.isLiveConnected && data.botConfig.status === 'LIVE';

  return (
    <header className="w-full bg-dark-card/90 backdrop-blur-xl border-b border-dark-border sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Bot Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 via-gold-500/10 to-transparent border border-gold-500/40 shadow-gold-subtle">
            <Star className="w-5 h-5 text-gold-400 fill-gold-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-gold-300 via-gold-400 to-amber-500 bg-clip-text text-transparent">
                GOLD STAR
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-dark-elevated text-gold-300 border border-gold-500/20 hidden sm:inline-block">
                MT5 BOT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Live Status & Investor Verified Badge */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Live Pulsing Dot Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-all ${
              isLive
                ? 'bg-fintech-greenSoft border-fintech-green/40 text-fintech-green'
                : 'bg-fintech-redSoft border-fintech-red/40 text-fintech-red'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isLive && (
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-fintech-green opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isLive ? 'bg-fintech-green' : 'bg-fintech-red'
                }`}
              ></span>
            </span>
            <span className="font-mono uppercase">{isLive ? t.liveBadge : t.pausedBadge}</span>
          </div>

          {/* Verified Investor Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-dark-elevated border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.verifiedInvestor}</span>
          </div>

          {/* Last Synced + Refresh Action */}
          <div className="flex items-center gap-1 bg-dark-elevated/70 border border-dark-border rounded-lg p-1 text-xs">
            <div className="px-2 py-0.5 text-slate-400 font-mono text-[11px] hidden sm:block">
              <span>{t.lastUpdated}: </span>
              <span className="text-slate-200">{lastSyncFormatted}</span>
            </div>
            <button
              onClick={() => refreshData()}
              disabled={isRefreshing}
              title="Manual sync with MT5 feed"
              className="p-1.5 rounded-md hover:bg-dark-hover text-slate-300 hover:text-gold-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-gold-400' : ''}`} />
            </button>
          </div>

          {/* Language Toggle English / Telugu */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-elevated hover:bg-dark-hover border border-dark-border text-xs font-medium text-slate-200 transition-colors"
            title="Toggle English / తెలుగు Language"
          >
            <Globe className="w-3.5 h-3.5 text-gold-400" />
            <span className="font-semibold">{language === 'en' ? 'తెలుగు' : 'English'}</span>
          </button>

          {/* Settings / Connect MT5 */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg bg-dark-elevated hover:bg-dark-hover border border-dark-border text-slate-300 hover:text-gold-400 transition-colors"
            title={t.configSettings}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Exit / Return to Intro Landing Page */}
          <button
            onClick={logout}
            className="px-2.5 py-1.5 rounded-lg bg-dark-elevated hover:bg-dark-hover border border-dark-border text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors hidden sm:flex items-center gap-1"
            title="Return to Intro Presentation"
          >
            <Lock className="w-3 h-3 text-gold-400" />
            <span>Intro</span>
          </button>
        </div>
      </div>
    </header>
  );
}
