'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Star,
  ArrowLeft,
  Activity,
  TrendingUp,
  Award,
  Layers,
  Server,
  RefreshCw,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StickyMobileBar } from '@/components/StickyMobileBar';
import { STRATEGY_CATALOG, getStrategyMeta } from '@/lib/strategyCatalog';
import { DashboardData, StrategyMeta } from '@/types/trading';

export default function StrategyDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || 'gold-star';
  const fallbackMeta = getStrategyMeta(slug);

  const [strategy, setStrategy] = useState<StrategyMeta | undefined>(fallbackMeta);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStrategy = async () => {
    try {
      const res = await fetch(`/api/mt5/strategies?slug=${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      });
      const json = await res.json();
      if (json.success && json.data) {
        setStrategy(json.strategy || fallbackMeta);
        setData(json.data);
      }
    } catch {
      // keep existing state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStrategy();
    const id = setInterval(fetchStrategy, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!fallbackMeta && !strategy) {
    return (
      <div className="min-h-screen bg-dark-base text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-black text-white">Strategy Not Found</h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 text-dark-base font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const activeMeta = strategy || fallbackMeta!;
  const metrics = data?.metrics;
  const closedTrades = data?.closedTrades || [];
  const openPositions = data?.openPositions || [];
  const equityCurve = data?.equityCurve || [];
  const isLive = Boolean(data?.botConfig?.isLiveConnected);

  return (
    <div className="min-h-screen bg-dark-base fintech-grid-bg text-slate-100 flex flex-col pb-20 sm:pb-0 page-enter">
      <Header />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Top Strategy Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-gold-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Strategies</span>
          </Link>

          <div className="flex flex-wrap items-center gap-1.5">
            {STRATEGY_CATALOG.map((s) => {
              const active = s.slug === activeMeta.slug;
              return (
                <Link
                  key={s.slug}
                  href={`/strategies/${s.slug}`}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-gold-500 text-dark-base border-gold-400 shadow-gold-subtle'
                      : 'bg-dark-card hover:bg-dark-elevated border-dark-border text-slate-300'
                  }`}
                >
                  {s.isMainStar && (
                    <Star className={`w-3 h-3 ${active ? 'fill-dark-base' : 'fill-gold-400 text-gold-400'}`} />
                  )}
                  <span>{s.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Strategy Hero Banner */}
        <div
          className={`rounded-3xl p-6 sm:p-8 border space-y-4 ${
            activeMeta.isMainStar
              ? 'bg-gradient-to-br from-gold-500/15 via-dark-card to-dark-elevated border-gold-500/50'
              : 'bg-dark-card border-dark-border'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {activeMeta.isMainStar ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold-500 text-dark-base font-black text-[11px] uppercase tracking-wider">
                    <Star className="w-3.5 h-3.5 fill-dark-base" />
                    <span>MAIN STAR</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-dark-elevated border border-gold-500/30 text-gold-300 font-mono font-bold text-[11px] uppercase">
                    {activeMeta.badge}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-lg bg-dark-base/80 border border-dark-border text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                  <Server className="w-3 h-3 text-gold-400" />
                  <span>
                    {activeMeta.terminalSource === 'primary'
                      ? 'MT5 #1 (Dedicated Primary)'
                      : 'MT5 #2 (5-Strategy Desk)'}
                  </span>
                </span>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold ${
                    isLive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-dark-elevated text-slate-400 border border-dark-border'
                  }`}
                >
                  {loading ? 'SYNCING...' : isLive ? 'LIVE FEED' : 'AWAITING FEED'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {activeMeta.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                {activeMeta.description}
              </p>
            </div>

            <button
              onClick={fetchStrategy}
              className="self-start px-3.5 py-2 rounded-xl bg-dark-elevated hover:bg-dark-hover border border-dark-border text-xs font-mono text-slate-200 flex items-center gap-2 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gold-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 4 Strategy KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Closed Net PnL</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div
              className={`text-2xl font-black font-mono ${
                (metrics?.closedPnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(metrics?.closedPnl ?? 0) >= 0 ? '+' : ''}${(metrics?.closedPnl ?? 0).toFixed(2)}
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Floating: ${(metrics?.floatingPnl ?? 0).toFixed(2)}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Win Rate</span>
              <Award className="w-4 h-4 text-gold-400" />
            </div>
            <div className="text-2xl font-black font-mono text-gold-300">
              {metrics?.winRate ?? 0}%
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              {metrics?.winTrades ?? 0}W / {metrics?.lossTrades ?? 0}L
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Profit Factor</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {metrics?.profitFactor ?? 0}
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Symbol: {activeMeta.symbol}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Trades</span>
              <Layers className="w-4 h-4 text-gold-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {metrics?.totalTrades ?? 0}
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Open Positions: {openPositions.length}
            </div>
          </div>
        </div>

        {/* Strategy Equity Curve */}
        <div className="rounded-2xl bg-dark-card border border-dark-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white">
                {activeMeta.name} — Performance Curve
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Filtered strictly by Expert IDs [{activeMeta.magicNumbers.join(', ')}]
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            {equityCurve.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityCurve}>
                  <defs>
                    <linearGradient id="stratGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FACC15" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2330" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F131C',
                      border: '1px solid rgba(250,204,21,0.3)',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#FACC15"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#stratGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                Awaiting live trades from MT5 for {activeMeta.name}...
              </div>
            )}
          </div>
        </div>

        {/* Open Positions Table */}
        <div className="rounded-2xl bg-dark-card border border-dark-border p-5 space-y-3">
          <h2 className="text-base font-extrabold text-white">
            Live Open Positions ({openPositions.length})
          </h2>
          {openPositions.length === 0 ? (
            <p className="text-xs font-mono text-slate-500 py-4">
              No active open positions right now for {activeMeta.name}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-dark-border text-slate-400 text-[11px] uppercase">
                    <th className="py-2 pr-3">Ticket</th>
                    <th className="py-2 pr-3">Symbol</th>
                    <th className="py-2 pr-3">Side</th>
                    <th className="py-2 pr-3">Lots</th>
                    <th className="py-2 pr-3">Open</th>
                    <th className="py-2 pr-3">Current</th>
                    <th className="py-2 pr-3">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/50">
                  {openPositions.map((pos) => (
                    <tr key={pos.ticket}>
                      <td className="py-2 pr-3 text-slate-300">#{pos.ticket}</td>
                      <td className="py-2 pr-3 text-white font-bold">{pos.symbol}</td>
                      <td
                        className={`py-2 pr-3 font-bold ${
                          pos.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pos.type}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">{pos.lots}</td>
                      <td className="py-2 pr-3 text-slate-300">{pos.openPrice}</td>
                      <td className="py-2 pr-3 text-slate-300">{pos.currentPrice}</td>
                      <td
                        className={`py-2 pr-3 font-bold ${
                          pos.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pos.profit >= 0 ? '+' : ''}${pos.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Closed Trades History Table */}
        <div className="rounded-2xl bg-dark-card border border-dark-border p-5 space-y-3">
          <h2 className="text-base font-extrabold text-white">
            Closed Trades ({closedTrades.length})
          </h2>
          {closedTrades.length === 0 ? (
            <p className="text-xs font-mono text-slate-500 py-4">
              No closed trades recorded yet for {activeMeta.name}. Once MT5 #2 syncs, trades matching Expert IDs [{activeMeta.magicNumbers.join(', ')}] will appear here automatically.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-dark-border text-slate-400 text-[11px] uppercase">
                    <th className="py-2 pr-3">Close Time</th>
                    <th className="py-2 pr-3">Symbol</th>
                    <th className="py-2 pr-3">Side</th>
                    <th className="py-2 pr-3">Lots</th>
                    <th className="py-2 pr-3">Open</th>
                    <th className="py-2 pr-3">Close</th>
                    <th className="py-2 pr-3">Net PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/50">
                  {closedTrades.slice(0, 100).map((t) => (
                    <tr key={t.ticket}>
                      <td className="py-2 pr-3 text-slate-400">{t.closeTime}</td>
                      <td className="py-2 pr-3 text-white font-bold">{t.symbol}</td>
                      <td
                        className={`py-2 pr-3 font-bold ${
                          t.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.type}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">{t.lots}</td>
                      <td className="py-2 pr-3 text-slate-300">{t.openPrice}</td>
                      <td className="py-2 pr-3 text-slate-300">{t.closePrice}</td>
                      <td
                        className={`py-2 pr-3 font-bold ${
                          t.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.profit >= 0 ? '+' : ''}${t.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <StickyMobileBar />
    </div>
  );
}
