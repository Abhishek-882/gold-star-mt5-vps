'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, ArrowRight, Server, Activity, TrendingUp, Cpu } from 'lucide-react';
import { STRATEGY_CATALOG } from '@/lib/strategyCatalog';
import { StrategySummary } from '@/types/trading';

const FALLBACK_SUMMARIES: StrategySummary[] = STRATEGY_CATALOG.map((meta) => ({
  meta,
  isLiveConnected: false,
  totalTrades: 0,
  winTrades: 0,
  lossTrades: 0,
  winRate: 0,
  netProfit: 0,
  floatingPnl: 0,
  openCount: 0,
  profitFactor: 0,
  lastUpdated: '',
}));

export function StrategyShowcaseSection() {
  const [summaries, setSummaries] = useState<StrategySummary[]>(FALLBACK_SUMMARIES);
  const [primaryConnected, setPrimaryConnected] = useState(false);
  const [desk5Connected, setDesk5Connected] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/mt5/strategies', { cache: 'no-store' });
        const json = await res.json();
        if (active && json.success && Array.isArray(json.strategies)) {
          setSummaries(json.strategies);
          setPrimaryConnected(Boolean(json.primaryConnected));
          setDesk5Connected(Boolean(json.desk5Connected));
        }
      } catch {
        // keep fallback
      }
    };
    load();
    const id = setInterval(load, 20000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const mainStar = summaries.find((s) => s.meta.isMainStar) ?? summaries[0];
  const deskStrategies = summaries.filter((s) => !s.meta.isMainStar);

  return (
    <section
      id="strategies-section"
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6"
    >
      {/* Section Header + 2-Terminal Architecture Note */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-[11px] font-mono font-bold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5 text-gold-400" />
            <span>2 MT5 Terminals • 5 Live Strategies</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gold Star is the <span className="text-gold-400">Main Star</span> — Plus Our 5-Strategy MT5 Desk
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Our <strong className="text-slate-200">Primary MT5 Terminal (#1)</strong> runs{' '}
            <strong className="text-gold-300">Gold Star</strong> exclusively as our flagship bot. Our{' '}
            <strong className="text-slate-200">Second MT5 Terminal (#2)</strong> runs all 5 strategies across multiple charts, tracked live by Expert ID &amp; trade comments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono shrink-0">
          <span
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
              primaryConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-dark-card border-dark-border text-slate-400'
            }`}
          >
            <Server className="w-3 h-3" />
            <span>MT5 #1 (Main Star): {primaryConnected ? 'LIVE' : 'STANDBY'}</span>
          </span>
          <span
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
              desk5Connected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-dark-card border-dark-border text-slate-400'
            }`}
          >
            <Server className="w-3 h-3" />
            <span>MT5 #2 (5-Strategy): {desk5Connected ? 'LIVE' : 'STANDBY'}</span>
          </span>
        </div>
      </div>

      {/* Flagship Main Star Card */}
      {mainStar && (
        <Link
          href="/terminal"
          className="block rounded-3xl bg-gradient-to-br from-gold-500/15 via-dark-card to-dark-elevated border border-gold-500/50 p-6 sm:p-7 hover:border-gold-400 transition-all shadow-gold-subtle group"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500 text-dark-base font-black text-[11px] uppercase tracking-wider">
                  <Star className="w-3.5 h-3.5 fill-dark-base" />
                  <span>MAIN STAR • FLAGSHIP</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-dark-base/80 border border-dark-border text-[11px] font-mono text-slate-300">
                  {mainStar.meta.symbol} • MT5 #1 + MT5 #2
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-gold-300 transition-colors">
                {mainStar.meta.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {mainStar.meta.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="p-3 rounded-xl bg-dark-base/70 border border-dark-border">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Net PnL</div>
                <div
                  className={`text-base font-extrabold font-mono ${
                    mainStar.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {mainStar.netProfit >= 0 ? '+' : ''}${mainStar.netProfit.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-dark-base/70 border border-dark-border">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Win Rate</div>
                <div className="text-base font-extrabold font-mono text-gold-300">
                  {mainStar.winRate}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-dark-base/70 border border-dark-border">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Trades</div>
                <div className="text-base font-extrabold font-mono text-white">
                  {mainStar.totalTrades}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gold-500/15 border border-gold-500/40 flex flex-col justify-center items-center text-gold-300 font-bold text-xs gap-1 group-hover:bg-gold-500 group-hover:text-dark-base transition-colors">
                <span>Open Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Remaining 4 Strategies from MT5 #2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {deskStrategies.map((item) => (
          <Link
            key={item.meta.slug}
            href={`/terminal?strategy=${item.meta.slug}`}
            className="rounded-2xl bg-dark-card border border-dark-border hover:border-gold-500/40 p-5 flex flex-col justify-between gap-4 transition-all card-elevate group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded-md bg-dark-elevated border border-dark-border text-[10px] font-mono text-gold-300 uppercase">
                  {item.meta.symbol}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    item.isLiveConnected
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-dark-elevated text-slate-400'
                  }`}
                >
                  {item.isLiveConnected ? 'LIVE' : 'MT5 #2'}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white group-hover:text-gold-300 transition-colors">
                {item.meta.name}
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                {item.meta.tagline}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-dark-border/60">
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div>
                  <div className="text-[10px] text-slate-500">PnL</div>
                  <div
                    className={`text-xs font-bold ${
                      item.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.netProfit >= 0 ? '+' : ''}${item.netProfit.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Win%</div>
                  <div className="text-xs font-bold text-slate-200">{item.winRate}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Trades</div>
                  <div className="text-xs font-bold text-slate-200">{item.totalTrades}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-gold-400 group-hover:text-gold-300">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Open Strategy</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
