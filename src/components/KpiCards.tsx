'use client';

import React from 'react';
import { useTradingData } from '@/context/TradingDataContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Wallet,
} from 'lucide-react';

export function KpiCards() {
  const { data, isLoading } = useTradingData();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-dark-card border border-dark-border/60"></div>
        ))}
      </div>
    );
  }

  const { metrics } = data;

  const formatCurrency = (val: number, showSign = false) => {
    const formatted = Math.abs(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (showSign) {
      return val >= 0 ? `+$${formatted}` : `-$${formatted}`;
    }
    return `$${formatted}`;
  };

  const formatPercent = (val: number, showSign = true) => {
    const sign = showSign && val > 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}%`;
  };

  return (
    <section className="space-y-4">
      {/* Primary Balance & Equity Live Telemetry Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-r from-dark-card via-dark-elevated to-dark-card border border-gold-500/20 shadow-gold-subtle">
        {/* Account Balance */}
        <div className="flex items-center gap-3.5 px-3 py-2">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              {t.balance}
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
              {formatCurrency(metrics.balance)}
            </div>
          </div>
        </div>

        {/* Live Equity */}
        <div className="flex items-center gap-3.5 px-3 py-2 border-t sm:border-t-0 sm:border-l border-dark-border">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                {t.equity}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-semibold">
                LIVE
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-emerald-400">
              {formatCurrency(metrics.equity)}
            </div>
          </div>
        </div>

        {/* Floating PnL */}
        <div className="flex items-center gap-3.5 px-3 py-2 border-t sm:border-t-0 sm:border-l border-dark-border">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              metrics.floatingPnl >= 0
                ? 'bg-fintech-greenSoft border-fintech-green/30 text-fintech-green'
                : 'bg-fintech-redSoft border-fintech-red/30 text-fintech-red'
            }`}
          >
            {metrics.floatingPnl >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              {t.floatingPnl}
            </span>
            <div
              className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                metrics.floatingPnl >= 0 ? 'text-fintech-green' : 'text-fintech-red'
              }`}
            >
              {formatCurrency(metrics.floatingPnl, true)}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Top Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Today's PnL */}
        <div
          data-aos="fade-up"
          data-aos-duration="600"
          className="p-4 rounded-2xl bg-dark-card border border-dark-border hover:border-gold-500/30 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">{t.todayPnl}</span>
            <span
              className={`inline-flex items-center text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                metrics.todayPnl >= 0
                  ? 'bg-fintech-greenSoft text-fintech-green'
                  : 'bg-fintech-redSoft text-fintech-red'
              }`}
            >
              {metrics.todayPnl >= 0 ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
              )}
              {formatPercent(metrics.todayPnlPercent)}
            </span>
          </div>
          <div
            className={`text-2xl font-black font-mono tracking-tight ${
              metrics.todayPnl >= 0 ? 'text-fintech-green' : 'text-fintech-red'
            }`}
          >
            {formatCurrency(metrics.todayPnl, true)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {metrics.todayPnl >= 0 ? 'Net positive session' : 'Under daily stop guard'}
          </div>
        </div>

        {/* 2. This Week PnL */}
        <div
          data-aos="fade-up"
          data-aos-duration="600"
          data-aos-delay="50"
          className="p-4 rounded-2xl bg-dark-card border border-dark-border hover:border-gold-500/30 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">{t.weekPnl}</span>
            <span
              className={`inline-flex items-center text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                metrics.weekPnl >= 0
                  ? 'bg-fintech-greenSoft text-fintech-green'
                  : 'bg-fintech-redSoft text-fintech-red'
              }`}
            >
              {metrics.weekPnl >= 0 ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
              )}
              {formatPercent(metrics.weekPnlPercent)}
            </span>
          </div>
          <div
            className={`text-2xl font-black font-mono tracking-tight ${
              metrics.weekPnl >= 0 ? 'text-fintech-green' : 'text-fintech-red'
            }`}
          >
            {formatCurrency(metrics.weekPnl, true)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Current trading week
          </div>
        </div>

        {/* 3. This Month PnL */}
        <div
          data-aos="fade-up"
          data-aos-duration="600"
          data-aos-delay="100"
          className="p-4 rounded-2xl bg-dark-card border border-dark-border hover:border-gold-500/30 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">{t.monthPnl}</span>
            <span
              className={`inline-flex items-center text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                metrics.monthPnl >= 0
                  ? 'bg-fintech-greenSoft text-fintech-green'
                  : 'bg-fintech-redSoft text-fintech-red'
              }`}
            >
              {metrics.monthPnl >= 0 ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
              )}
              {formatPercent(metrics.monthPnlPercent)}
            </span>
          </div>
          <div
            className={`text-2xl font-black font-mono tracking-tight ${
              metrics.monthPnl >= 0 ? 'text-fintech-green' : 'text-fintech-red'
            }`}
          >
            {formatCurrency(metrics.monthPnl, true)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Active calendar cycle
          </div>
        </div>

        {/* 4. Total Growth */}
        <div
          data-aos="fade-up"
          data-aos-duration="600"
          data-aos-delay="150"
          className="p-4 rounded-2xl bg-dark-card border border-gold-500/30 hover:border-gold-400 transition-all duration-200 shadow-gold-subtle"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gold-300">{t.totalGrowth}</span>
            <span className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-300 font-bold uppercase">
              SINCE START
            </span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-gold-400">
            +{metrics.totalGrowthPercent.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono flex items-center justify-between">
            <span>ROI: {formatCurrency(metrics.closedPnl, true)}</span>
          </div>
        </div>

        {/* 5. Win Rate */}
        <div
          data-aos="fade-up"
          data-aos-duration="600"
          data-aos-delay="200"
          className="p-4 rounded-2xl bg-dark-card border border-dark-border hover:border-gold-500/30 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">{t.winRate}</span>
            <span className="text-xs font-mono text-slate-400">
              {metrics.winTrades}W / {metrics.lossTrades}L
            </span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-white">
            {metrics.winRate.toFixed(1)}%
          </div>
          <div className="w-full bg-dark-elevated rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-fintech-green h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(metrics.winRate, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* 6. Total Trades / Profit Factor / Max DD */}
        <div
          data-aos="fade-up"
          data-aos-duration="600"
          data-aos-delay="250"
          className="p-4 rounded-2xl bg-dark-card border border-dark-border hover:border-gold-500/30 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400">{t.profitFactor}</span>
            <span className="text-xs font-mono font-black text-gold-400">
              {metrics.profitFactor.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-t border-dark-border/60 text-xs">
            <span className="text-slate-400">{t.maxDrawdown}</span>
            <span className="font-mono font-bold text-amber-400">
              {metrics.maxDrawdownPercent.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-dark-border/60 text-xs">
            <span className="text-slate-400">{t.totalTrades}</span>
            <span className="font-mono font-bold text-slate-200">
              {metrics.totalTrades} orders
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
