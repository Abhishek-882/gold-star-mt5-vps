'use client';

import React from 'react';
import { useTradingData } from '@/context/TradingDataContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { DailyPnl } from '@/types/trading';

export function DailyPnlBarChart() {
  const { data } = useTradingData();
  const { t } = useLanguage();

  const pnlList = (data.dailyPnlHistory || []).slice(-30);

  return (
    <div
      data-aos="fade-up"
      data-aos-duration="600"
      data-aos-delay="50"
      className="p-5 rounded-2xl bg-dark-card border border-dark-border hover:border-gold-500/20 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {t.dailyPnlTitle}
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-dark-elevated text-slate-300 border border-dark-border">
              30 Trading Days
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.dailyPnlDesc}
          </p>
        </div>
      </div>

      <div className="w-full h-64 sm:h-72 flex items-center justify-center">
        {pnlList.length === 0 ? (
          <div className="text-center p-6 text-slate-500 font-mono text-xs border border-dashed border-dark-border rounded-xl w-full h-full flex flex-col items-center justify-center">
            <span className="text-gold-400 font-bold mb-1">Awaiting MT5 Session Deals</span>
            <span>Daily realized profit and loss bars will render here automatically after MT5 trades close.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pnlList} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A202E" vertical={false} />
              <ReferenceLine y={0} stroke="#334155" strokeWidth={1.5} />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#1C2230' }}
                tickFormatter={(d: string) => d.slice(5)} // MM-DD
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#1C2230' }}
                tickFormatter={(v: number) => `$${v}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload as DailyPnl;
                    const isProfit = pt.profit >= 0;
                    return (
                      <div className="bg-dark-elevated/95 border border-dark-border rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs font-mono">
                        <div className="text-slate-400 mb-1">{pt.date}</div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-300">Daily Return:</span>
                          <span
                            className={`font-bold text-sm ${
                              isProfit ? 'text-fintech-green' : 'text-fintech-red'
                            }`}
                          >
                            {isProfit ? `+$${pt.profit.toFixed(2)}` : `-$${Math.abs(pt.profit).toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 mt-1 text-[11px] text-slate-400">
                          <span>Executed Trades:</span>
                          <span className="text-slate-200">
                            {pt.tradesCount} ({pt.winCount}W / {pt.tradesCount - pt.winCount}L)
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                {pnlList.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={entry.profit >= 0 ? '#00C087' : '#FF3B56'}
                    className="transition-opacity hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 mt-2 border-t border-dark-border text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 rounded-sm bg-fintech-green"></span>
            <span>Win Sessions: {pnlList.filter((d) => d.profit >= 0).length}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 rounded-sm bg-fintech-red"></span>
            <span>Loss Sessions: {pnlList.filter((d) => d.profit < 0).length}</span>
          </div>
        </div>
        <span className="font-mono text-gold-400">Fixed Lot Sizing</span>
      </div>
    </div>
  );
}
