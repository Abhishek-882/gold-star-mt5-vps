'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { StrategySummary } from '@/types/trading';
import { STRATEGY_CATALOG } from '@/lib/strategyCatalog';

/* ─────────────────────────── types ─────────────────────────── */
interface LeaderboardRow extends StrategySummary {
  rank: number;
}

/* ─────────────────────────── helpers ───────────────────────── */
function fmt(v: number, sign = false): string {
  const s = sign && v > 0 ? '+' : '';
  return `${s}$${Math.abs(v).toFixed(2)}`;
}
function pct(v: number): string { return `${v.toFixed(1)}%`; }
function pf(v: number): string {
  return v === 0 ? '—' : v >= 99 ? '∞' : v.toFixed(2);
}

const SYMBOL_COLOR: Record<string, string> = {
  XAUUSD: 'text-gold-400',
  BTCUSD: 'text-orange-400',
};

/* ─────────────────────────── rank badge ────────────────────── */
function RankBadge({ rank }: { rank: number }) {
  const medals = ['🥇', '🥈', '🥉'];
  if (rank <= 3) {
    return <span className="text-sm leading-none select-none">{medals[rank - 1]}</span>;
  }
  return <span className="text-[11px] font-mono text-slate-500">#{rank}</span>;
}

/* ─────────────────────────── main component ─────────────────── */
export function StrategyLeaderboard() {
  const router = useRouter();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [sortKey, setSortKey] = useState<'netProfit' | 'winRate' | 'profitFactor'>('netProfit');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/mt5/strategies', { cache: 'no-store' });
      const json = await res.json();
      const summaries: StrategySummary[] = json.strategies ?? json.summaries ?? [];
      buildRows(summaries);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      buildRows([]);
    } finally {
      setLoading(false);
    }
  }, [sortKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function buildRows(summaries: StrategySummary[]) {
    const merged: StrategySummary[] = STRATEGY_CATALOG.map((meta) => {
      const live = summaries.find((s) => s.meta?.slug === meta.slug);
      if (live) return live;
      return { meta, isLiveConnected: false, totalTrades: 0, winTrades: 0, lossTrades: 0, winRate: 0, netProfit: 0, floatingPnl: 0, openCount: 0, profitFactor: 0, lastUpdated: '' };
    });

    const sorted = [...merged].sort((a, b) => {
      if (sortKey === 'netProfit') return b.netProfit - a.netProfit;
      if (sortKey === 'winRate') return b.winRate - a.winRate;
      if (sortKey === 'profitFactor') return b.profitFactor - a.profitFactor;
      return 0;
    });
    setRows(sorted.map((s, i) => ({ ...s, rank: i + 1 })));
  }

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  /* ── sort button ── */
  function SortBtn({ label, field }: { label: string; field: typeof sortKey }) {
    const active = sortKey === field;
    return (
      <button
        onClick={() => setSortKey(field)}
        className={`text-[10px] font-semibold uppercase tracking-widest transition-colors ${
          active ? 'text-gold-400' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        {label}{active && <span className="ml-0.5">↓</span>}
      </button>
    );
  }

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Live Strategy Leaderboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            5-Strategy Desk
            {lastUpdated && <span className="text-slate-600 ml-2">· {lastUpdated}</span>}
          </p>
        </div>
        <button
          onClick={() => router.push('/terminal')}
          className="text-xs font-semibold text-gold-400 hover:text-gold-300 border border-gold-500/30 hover:border-gold-400/60 rounded-lg px-3 py-1.5 transition-all"
        >
          Full Terminal →
        </button>
      </div>

      {/* ── Sort pills (mobile) ── */}
      <div className="flex gap-2 mb-3 sm:hidden flex-wrap">
        <span className="text-[10px] text-slate-600 self-center">Sort:</span>
        <SortBtn label="Net P&L" field="netProfit" />
        <SortBtn label="Win %" field="winRate" />
        <SortBtn label="PF" field="profitFactor" />
      </div>

      {/* ── Table container ── */}
      <div className="rounded-2xl border border-dark-border overflow-hidden bg-dark-card">

        {/* ── Desktop header row (hidden on mobile) ── */}
        <div className="hidden sm:grid sm:grid-cols-[32px_1fr_96px_80px_80px_72px] gap-3 items-center px-5 py-2.5 border-b border-dark-border">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">#</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Strategy</span>
          <SortBtn label="Net P&L" field="netProfit" />
          <SortBtn label="Win %" field="winRate" />
          <SortBtn label="PF" field="profitFactor" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 text-right">Jump</span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-600 text-sm animate-pulse">
            Loading live telemetry…
          </div>
        ) : (
          <ul className="divide-y divide-dark-border">
            {rows.map((row) => {
              const isPositive = row.netProfit >= 0;
              const symbolColor = SYMBOL_COLOR[row.meta.symbol] ?? 'text-slate-400';
              const hasData = row.totalTrades > 0 || row.openCount > 0;
              const isMainStar = row.meta.badge === 'MAIN STAR';

              return (
                <li
                  key={row.meta.slug}
                  className={row.rank === 1 ? 'bg-gold-500/5' : 'hover:bg-white/[0.02]'}
                >
                  {/* ════ MOBILE LAYOUT ════ */}
                  <div className="sm:hidden flex items-center gap-3 px-4 py-3.5">
                    {/* Rank */}
                    <div className="w-7 flex-shrink-0 flex items-center justify-center">
                      <RankBadge rank={row.rank} />
                    </div>

                    {/* Name + symbol + status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white leading-tight">
                          {row.meta.name}
                        </span>
                        {row.meta.isMainStar && (
                          <span className="text-[9px] text-gold-400">★</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-mono ${symbolColor}`}>
                          {row.meta.symbol}
                        </span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
                          isMainStar
                            ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                            : 'bg-slate-700/60 text-slate-400 border border-slate-600/30'
                        }`}>
                          {isMainStar ? 'MAIN' : '#2 DESK'}
                        </span>
                        {row.isLiveConnected && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-400">
                            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                            live
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats — right side stacked */}
                    <div className="flex-shrink-0 text-right space-y-0.5">
                      <div className={`font-mono text-sm font-bold tabular-nums ${
                        !hasData ? 'text-slate-600' : isPositive ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {hasData ? fmt(row.netProfit, true) : '—'}
                      </div>
                      <div className={`font-mono text-[10px] tabular-nums ${
                        !hasData ? 'text-slate-600' : row.winRate >= 70 ? 'text-emerald-400' : row.winRate >= 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {hasData ? pct(row.winRate) : '—'}
                        {hasData && <span className="text-slate-600 ml-1">{row.winTrades}W/{row.lossTrades}L</span>}
                      </div>
                    </div>

                    {/* View button */}
                    <button
                      onClick={() => router.push(`/terminal?strategy=${row.meta.slug}`)}
                      className="flex-shrink-0 text-[10px] font-semibold text-slate-400 hover:text-gold-400 border border-slate-700 hover:border-gold-500/40 rounded-lg px-2.5 py-1.5 transition-all"
                    >
                      →
                    </button>
                  </div>

                  {/* ════ DESKTOP LAYOUT ════ */}
                  <div className="hidden sm:grid sm:grid-cols-[32px_1fr_96px_80px_80px_72px] gap-3 items-center px-5 py-3">
                    {/* Rank */}
                    <div className="flex items-center justify-center">
                      <RankBadge rank={row.rank} />
                    </div>

                    {/* Strategy name + meta */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-white truncate">{row.meta.name}</span>
                        {row.meta.isMainStar && <span className="text-[9px] text-gold-400">★</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-mono ${symbolColor}`}>{row.meta.symbol}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold ${
                          isMainStar
                            ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                            : 'bg-slate-700/60 text-slate-400 border border-slate-600/30'
                        }`}>
                          {row.meta.badge}
                        </span>
                        {row.isLiveConnected && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-400">
                            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />live
                          </span>
                        )}
                        {!row.isLiveConnected && (
                          <span className="text-[9px] text-slate-600">offline</span>
                        )}
                      </div>
                    </div>

                    {/* Net P&L */}
                    <div className={`font-mono text-xs font-bold tabular-nums ${
                      !hasData ? 'text-slate-600' : isPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {hasData ? fmt(row.netProfit, true) : '—'}
                      {row.floatingPnl !== 0 && (
                        <span className={`block text-[9px] font-normal ${row.floatingPnl > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {fmt(row.floatingPnl, true)} float
                        </span>
                      )}
                    </div>

                    {/* Win Rate */}
                    <div className={`font-mono text-xs tabular-nums ${
                      !hasData ? 'text-slate-600' : row.winRate >= 70 ? 'text-emerald-400' : row.winRate >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {hasData ? pct(row.winRate) : '—'}
                      {hasData && (
                        <span className="block text-[9px] text-slate-500">{row.winTrades}W/{row.lossTrades}L</span>
                      )}
                    </div>

                    {/* Profit Factor */}
                    <div className={`font-mono text-xs tabular-nums ${
                      !hasData ? 'text-slate-600' : row.profitFactor >= 2 ? 'text-emerald-400' : row.profitFactor >= 1 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {hasData ? pf(row.profitFactor) : '—'}
                    </div>

                    {/* Jump */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => router.push(`/terminal?strategy=${row.meta.slug}`)}
                        className="text-[10px] font-semibold text-slate-400 hover:text-gold-400 border border-slate-700 hover:border-gold-500/40 rounded-lg px-2 py-1 transition-all tactile-press"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <p className="text-[10px] text-slate-700 mt-2 text-right font-mono hidden sm:block">
        Auto-refreshes every 30s · Click headers to sort · View → opens /terminal filtered by strategy
      </p>
    </section>
  );
}
