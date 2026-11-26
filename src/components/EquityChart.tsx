'use client';

import React, { useState, useMemo } from 'react';
import { useTradingData } from '@/context/TradingDataContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { EquityPoint } from '@/types/trading';

type FilterRange = 'TODAY' | '7D' | '30D' | 'ALL';

export function EquityChart() {
  const { data } = useTradingData();
  const { t } = useLanguage();
  const [range, setRange] = useState<FilterRange>('ALL');

  const filteredData = useMemo(() => {
    const raw = data.equityCurve;
    if (!raw || raw.length === 0) return [];

    if (range === 'TODAY') {
      const last = raw[raw.length - 1];
      const prev = raw[Math.max(0, raw.length - 2)] || last;
      return [
        { ...prev, date: '00:00' },
        { ...last, date: '12:00', equity: (prev.equity + last.equity) / 2 },
        { ...last, date: 'Live' },
      ];
    }
    if (range === '7D') {
      return raw.slice(Math.max(0, raw.length - 6));
    }
    if (range === '30D') {
      return raw.slice(Math.max(0, raw.length - 12));
    }
    return raw;
  }, [data.equityCurve, range]);

  const initialVal = filteredData[0]?.equity || 0;
  const currentVal = filteredData[filteredData.length - 1]?.equity || 0;
  const netGain = currentVal - initialVal;
  const netGainPercent = initialVal > 0 ? ((netGain / initialVal) * 100).toFixed(2) : '0.00';

  const minEquity = filteredData.length > 0 ? Math.min(...filteredData.map(d => d.equity)) : 0;
  const maxEquity = filteredData.length > 0 ? Math.max(...filteredData.map(d => d.equity)) : 0;
  const pad = Math.max(5, Math.round((maxEquity - minEquity) * 0.2));
  const yMin = Math.max(0, Math.floor(minEquity - pad));
  const yMax = Math.ceil(maxEquity + pad);

  const formatXDate = (val: string) => {
    if (!val || val === 'Live' || val === '00:00' || val === '12:00') return val;
    const d = new Date(val.includes('T') ? val : val + 'T00:00:00Z');
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      data-aos="fade-up"
      data-aos-duration="600"
      className="p-5 rounded-2xl bg-dark-card border border-dark-border hover:border-gold-500/20 transition-all duration-200"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {t.equityCurveTitle}
            </h3>
            <span className="text-xs font-mono font-bold text-gold-400 px-2 py-0.5 rounded bg-gold-500/10 border border-gold-500/20">
              {netGain >= 0 ? '+' : ''}{netGainPercent}%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.equityCurveDesc}
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center bg-dark-elevated border border-dark-border rounded-xl p-1 text-xs">
          {(['TODAY', '7D', '30D', 'ALL'] as FilterRange[]).map((tab) => {
            const labelMap: Record<FilterRange, string> = {
              TODAY: t.filterToday,
              '7D': t.filter7D,
              '30D': t.filter30D,
              ALL: t.filterAllTime,
            };
            const active = range === tab;
            return (
              <button
                key={tab}
                onClick={() => setRange(tab)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  active
                    ? 'bg-gold-500 text-dark-base font-bold shadow-gold-subtle'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {labelMap[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-80 flex items-center justify-center">
        {filteredData.length === 0 ? (
          <div className="text-center p-6 text-slate-500 font-mono text-xs border border-dashed border-dark-border rounded-xl w-full h-full flex flex-col items-center justify-center">
            <span className="text-gold-400 font-bold mb-1">Awaiting MT5 Live Stream</span>
            <span>Real equity curve points will render as trades execute on your MT5 terminal.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldEquityGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD700" stopOpacity={0.35} />
                  <stop offset="60%" stopColor="#FFD700" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#FFD700" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A202E" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1C2230' }}
                tickFormatter={formatXDate}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1C2230' }}
                tickFormatter={(v) => (yMax >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${Math.round(v)}`)}
                domain={[yMin, yMax]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload as EquityPoint;
                    return (
                      <div className="bg-dark-elevated/95 border border-gold-500/30 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs">
                        <div className="text-slate-400 font-mono mb-1">{pt.date}</div>
                        <div className="flex items-center justify-between gap-4 font-mono">
                          <span className="text-slate-300">Live Equity:</span>
                          <span className="font-bold text-gold-400">
                            ${(pt.equity ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 font-mono mt-0.5">
                          <span className="text-slate-400">Net Growth:</span>
                          <span className="font-bold text-emerald-400">
                            +{(pt.growthPercent ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#FFD700"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#goldEquityGlow)"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Footer Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-dark-border text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gold-400"></span>
          <span>Net Asset Curve (Strict Zero-Martingale Execution)</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Starting: <strong className="text-slate-200">${initialVal.toLocaleString()}</strong></span>
          <span>Current: <strong className="text-gold-400">${currentVal.toLocaleString()}</strong></span>
        </div>
      </div>
    </div>
  );
}
