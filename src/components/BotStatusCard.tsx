'use client';

import React from 'react';
import { useTradingData } from '@/context/TradingDataContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Cpu,
  ShieldCheck,
  Server,
  Activity,
  Layers,
  Zap,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export function BotStatusCard() {
  const { data } = useTradingData();
  const { t } = useLanguage();
  const { botConfig } = data;

  const isLive = botConfig.isLiveConnected && botConfig.status === 'LIVE';

  return (
    <div
      data-aos="fade-up"
      data-aos-duration="600"
      className="p-5 rounded-2xl bg-gradient-to-br from-dark-card via-dark-card to-dark-elevated border border-gold-500/20 hover:border-gold-500/40 transition-all duration-200 shadow-gold-subtle"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              {botConfig.botName}
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 border border-gold-500/30">
                {botConfig.version}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {t.botStatusDesc}
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold border ${
              isLive
                ? 'bg-fintech-greenSoft border-fintech-green/40 text-fintech-green'
                : 'bg-fintech-redSoft border-fintech-red/40 text-fintech-red'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLive ? 'bg-fintech-green animate-pulse' : 'bg-fintech-red'
              }`}
            ></span>
            <span>{isLive ? 'SYSTEM LIVE' : 'FEED PAUSED'}</span>
          </div>
        </div>
      </div>

      {/* Grid of Specifications */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 font-mono text-xs">
        {/* Symbol */}
        <div className="p-3 rounded-xl bg-dark-elevated/70 border border-dark-border">
          <span className="text-[11px] text-slate-400 block mb-1 uppercase">Asset Symbol</span>
          <span className="font-bold text-gold-300 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-gold-400" />
            {botConfig.symbol}
          </span>
        </div>

        {/* Broker */}
        <div className="p-3 rounded-xl bg-dark-elevated/70 border border-dark-border">
          <span className="text-[11px] text-slate-400 block mb-1 uppercase">Broker Entity</span>
          <span className="font-bold text-white truncate block" title={botConfig.broker}>
            {botConfig.broker}
          </span>
        </div>

        {/* Server */}
        <div className="p-3 rounded-xl bg-dark-elevated/70 border border-dark-border">
          <span className="text-[11px] text-slate-400 block mb-1 uppercase">MT5 Server</span>
          <span className="font-bold text-slate-200 truncate block">
            {botConfig.server}
          </span>
        </div>

        {/* Account Type */}
        <div className="p-3 rounded-xl bg-dark-elevated/70 border border-dark-border">
          <span className="text-[11px] text-slate-400 block mb-1 uppercase">Account Access</span>
          <span className="font-bold text-emerald-400 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Investor (RO)
          </span>
        </div>

        {/* Timeframe */}
        <div className="p-3 rounded-xl bg-dark-elevated/70 border border-dark-border">
          <span className="text-[11px] text-slate-400 block mb-1 uppercase">Timeframe</span>
          <span className="font-bold text-white">
            {botConfig.timeframe}
          </span>
        </div>

        {/* Strategy Engine */}
        <div className="p-3 rounded-xl bg-dark-elevated/70 border border-dark-border">
          <span className="text-[11px] text-slate-400 block mb-1 uppercase">Execution Engine</span>
          <span className="font-bold text-cyan-400">
            ECN Low-Latency
          </span>
        </div>
      </div>

      {/* Safety Invariants Checklist */}
      <div className="mt-4 pt-4 border-t border-dark-border flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pre-calculated Hard Stop-Loss (25-45 Pips)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Zero Martingale / Zero Grid</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tier-1 Macro News Filter Active</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Last Checkpoint: {new Date(botConfig.lastUpdated).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
