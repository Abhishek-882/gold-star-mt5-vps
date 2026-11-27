'use client';

import React from 'react';
import { useTradingData } from '@/context/TradingDataContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, AlertTriangle, Star, Lock, Clock, ExternalLink } from 'lucide-react';

export function Footer() {
  const { data, lastSyncFormatted } = useTradingData();
  const { t } = useLanguage();
  const { botConfig } = data;

  return (
    <footer className="w-full bg-dark-card border-t border-dark-border mt-16 pt-12 pb-24 sm:pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-8 border-b border-dark-border">
          {/* Badge 1: Verified MT5 Live Account */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-dark-elevated/50 border border-emerald-500/20">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-200 block text-xs">
                Verified MT5 Live Account
              </span>
              <span className="text-[11px] text-slate-400">
                Audited via read-only investor feed
              </span>
            </div>
          </div>

          {/* Badge 2: Drawdown Warning & Risk Model */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-dark-elevated/50 border border-amber-500/20">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-200 block text-xs">
                Dynamic Risk Protection
              </span>
              <span className="text-[11px] text-slate-400">
                Hard Stop Loss capped under 5% drawdown
              </span>
            </div>
          </div>

          {/* Badge 3: Last Sync Timestamp */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-dark-elevated/50 border border-gold-500/20">
            <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-200 block text-xs">
                Live Data Synchronized
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {botConfig.server} • {lastSyncFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer Box */}
        <div className="p-5 rounded-2xl bg-dark-base border border-dark-border/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>{t.disclaimerTitle}</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {t.disclaimerText}
          </p>
          <p className="text-slate-500 text-[10px] pt-1 border-t border-dark-border/40 font-mono">
            {t.complianceWarning}
          </p>
        </div>

        {/* Copyright and Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
            <span>© {new Date().getFullYear()} Gold Star MT5 Algorithm. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a href="/privacy" className="hover:text-gold-400 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-gold-400 transition-colors">
              Terms
            </a>
            <span>•</span>
            <a href="#contact-section" className="hover:text-gold-400 transition-colors">
              Contact Desk
            </a>
            <span>•</span>
            <span className="text-slate-400">Zero Guaranteed Profit Claims</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
