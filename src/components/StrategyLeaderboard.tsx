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

function pct(v: number): string {
  return `${v.toFixed(1)}%`;
}

function pf(v: number): string {
  return v === 0 ? '—' : v >= 99 ? '∞' : v.toFixed(2);
}

const SYMBOL_COLOR: Record<string, string> = {
  XAUUSD: 'text-gold-400',
  BTCUSD: 'text-orange-400',
};

const BADGE_PILL: Record<string, string> = {
  'MAIN STAR': 'bg-gold-500/20 text-gold-300 border border-gold-500/40',
  'MT5 #2 DESK': 'bg-slate-700/50 text-slate-300 border border-slate-600/40',
};

/* ─────────────────────────── sparkline ─────────────────────── */
function Sparkline({ value }: { value: number }) {
  // Simple 8-bar micro-chart simulating trend direction from netProfit sign + magnitude
  const bars = 8;
  const seed = Math.abs(value * 7919) % 100; // deterministic from profit value
  const points = Array.from({ length: bars }, (_, i) => {
    const noise = ((seed * (i + 3) * 31337) % 40) - 20;
    const trend = (i / bars) * (value >= 0 ? 30 : -30);
    return Math.max(5, Math.min(55, 30 + trend + noise));
  });
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const h = 32;
  const w = 80;
  const pts = points
    .map((p, i) => `${(i / (bars - 1)) * w},${h - ((p - min) / range) * h}`)
    .join(' ');
  const isPositive = value >= 0;
  return (
    <svg width={w} height={h} className="overflow-visible" aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke={isPositive ? '#10b981' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
      {/* glow dot at end */}
      {(() => {
        const last = points[points.length - 1];
        const x = w;
        const y = h - ((last - min) / range) * h;
        return (
          <circle
            cx={x}
            cy={y}
            r={2.5}
            fill={isPositive ? '#10b981' : '#ef4444'}
          />
        );
      })()}
    </svg>
  );
}

/* ─────────────────────────── rank badge ────────────────────── */
function RankBadge({ rank }: { rank: number }) {
  const medals = ['🥇', '🥈', '🥉'];
  if (rank <= 3) {
    return (
      <span className="text-base leading-none select-none" title={`Rank #${rank}`}>
        {medals[rank - 1]}
      </span>
    );
  }
  return (
    <span className="text-xs font-mono text-slate-500 w-5 text-center">
      #{rank}
    </span>
  );
}

/* ─────────────────────────── main component ─────────────────── */
export function StrategyLeaderboard() {
  const router = useRouter();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [sortKey, setSortKey] = useState<'netProfit' | 'winRate' | 'profitFactor' | 'openCount'>(
    'netProfit'
  );

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/mt5/strategies', { cache: 'no-store' });
      const json = await res.json();
      const summaries: StrategySummary[] = json.strategies ?? json.summaries ?? [];
      buildRows(summaries);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      // Fall back to seed data from catalog so the table is never empty
      buildRows([]);
    } finally {
      setLoading(false);
    }
  }, [sortKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function buildRows(summaries: StrategySummary[]) {
    // Merge catalog order with live data; seed zeros if strategy not yet in live feed
    const merged: StrategySummary[] = STRATEGY_CATALOG.map((meta) => {
      const live = summaries.find((s) => s.meta?.slug === meta.slug);
      if (live) return live;
      return {
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
      };
    });

    const sorted = [...merged].sort((a, b) => {
      if (sortKey === 'netProfit') return b.netProfit - a.netProfit;
      if (sortKey === 'winRate') return b.winRate - a.winRate;
      if (sortKey === 'profitFactor') return b.profitFactor - a.profitFactor;
      if (sortKey === 'openCount') return b.openCount - a.openCount;
      return 0;
    });

    setRows(sorted.map((s, i) => ({ ...s, rank: i + 1 })));
  }

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  /* ── sort header helper ── */
  function SortHeader({
    label,
    field,
    className = '',
  }: {
    label: string;
    field: typeof sortKey;
    className?: string;
  }) {
    const active = sortKey === field;
    return (
      <button
        onClick={() => setSortKey(field)}
        className={`text-left text-[10px] font-semibold uppercase tracking-widest transition-colors ${
          active ? 'text-gold-400' : 'text-slate-500 hover:text-slate-300'
        } ${className}`}
      >
        {label}
        {active && <span className="ml-1 text-gold-400">↓</span>}
      </button>
    );
  }

  /* ── jump to terminal filtered by strategy ── */
  function goToTerminal(slug: string) {
    router.push(`/terminal?strategy=${slug}`);
  }

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Live Strategy Leaderboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            5-Strategy Desk • sorted by{' '}
            <span className="text-gold-400 font-semibold capitalize">
              {sortKey === 'netProfit'
                ? 'Net P&L'
                : sortKey === 'winRate'
                ? 'Win Rate'
                : sortKey === 'profitFactor'
                ? 'Profit Factor'
                : 'Open Trades'}
            </span>
            {lastUpdated && (
              <span className="text-slate-600 ml-2">· updated {lastUpdated}</span>
            )}
          </p>
        </div>
        <button
          onClick={() => router.push('/terminal')}
          className="text-xs font-semibold text-gold-400 hover:text-gold-300 border border-gold-500/30 hover:border-gold-400/60 rounded-lg px-3 py-1.5 transition-all"
        >
          Full Terminal →
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-dark-border overflow-hidden bg-dark-card">
        {/* Column headers */}
        <div className="grid grid-cols-[32px_1fr_80px_72px_72px_72px_52px_80px] gap-3 items-center px-4 py-2 border-b border-dark-border">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">#</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Strategy</span>
          <SortHeader label="Net P&L" field="netProfit" />
          <SortHeader label="Win %" field="winRate" />
          <SortHeader label="PF" field="profitFactor" />
          <SortHeader label="Open" field="openCount" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Trend</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 text-right">Jump</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="py-10 text-center text-slate-600 text-sm animate-pulse">
            Loading live telemetry…
          </div>
        ) : (
          <ul className="divide-y divide-dark-border">
            {rows.map((row) => {
              const isPositive = row.netProfit >= 0;
              const symbolColor = SYMBOL_COLOR[row.meta.symbol] ?? 'text-slate-400';
              const badgeCls = BADGE_PILL[row.meta.badge] ?? BADGE_PILL['MT5 #2 DESK'];
              const hasData = row.totalTrades > 0 || row.openCount > 0;

              return (
                <li
                  key={row.meta.slug}
                  className={`grid grid-cols-[32px_1fr_80px_72px_72px_72px_52px_80px] gap-3 items-center px-4 py-3 transition-colors ${
                    row.rank === 1 ? 'bg-gold-500/5' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center">
                    <RankBadge rank={row.rank} />
                  </div>

                  {/* Strategy name + badges */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm text-white truncate">
                        {row.meta.name}
                      </span>
                      {row.meta.isMainStar && (
                        <span className="text-[9px] font-bold text-gold-400">★</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className={`text-[10px] font-mono ${symbolColor}`}>
                        {row.meta.symbol}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${badgeCls}`}>
                        {row.meta.badge}
                      </span>
                      {!row.isLiveConnected && (
                        <span className="text-[9px] text-slate-600 font-mono">offline</span>
                      )}
                      {row.isLiveConnected && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-400 font-mono">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                          live
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Net P&L */}
                  <div className={`font-mono text-xs font-bold tabular-nums ${
                    !hasData ? 'text-slate-600' : isPositive ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {hasData ? fmt(row.netProfit, true) : '—'}
                    {row.floatingPnl !== 0 && (
                      <span className={`block text-[9px] font-normal ${
                        row.floatingPnl > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
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
                      <span className="block text-[9px] text-slate-500 font-normal">
                        {row.winTrades}W/{row.lossTrades}L
                      </span>
                    )}
                  </div>

                  {/* Profit Factor */}
                  <div className={`font-mono text-xs tabular-nums ${
                    !hasData ? 'text-slate-600' : row.profitFactor >= 2 ? 'text-emerald-400' : row.profitFactor >= 1 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {hasData ? pf(row.profitFactor) : '—'}
                  </div>

                  {/* Open Trades */}
                  <div className={`font-mono text-xs tabular-nums ${
                    row.openCount > 0 ? 'text-blue-400' : 'text-slate-600'
                  }`}>
                    {row.openCount > 0 ? `${row.openCount} open` : '—'}
                  </div>

                  {/* Sparkline */}
                  <div className="flex items-center">
                    {hasData ? (
                      <Sparkline value={row.netProfit} />
                    ) : (
                      <span className="text-[9px] text-slate-700 font-mono">no data</span>
                    )}
                  </div>

                  {/* Jump button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => goToTerminal(row.meta.slug)}
                      className="text-[10px] font-semibold text-slate-400 hover:text-gold-400 border border-slate-700 hover:border-gold-500/40 rounded-lg px-2 py-1 transition-all tactile-press"
                      title={`Open ${row.meta.name} in Terminal`}
                    >
                      View →
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-slate-700 mt-2 text-right font-mono">
        Auto-refreshes every 30s · Click column headers to sort · View → jumps to /terminal filtered by strategy
      </p>
    </section>
  );
}
