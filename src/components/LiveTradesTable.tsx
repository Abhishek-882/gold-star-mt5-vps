'use client';

import React from 'react';
import { useTradingData } from '@/context/TradingDataContext';
import { useLanguage } from '@/context/LanguageContext';
import { Activity, Clock, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

export function LiveTradesTable() {
  const { data } = useTradingData();
  const { t } = useLanguage();
  const { openPositions } = data;

  return (
    <div
      data-aos="fade-up"
      data-aos-duration="600"
      className="p-5 rounded-2xl bg-dark-card border border-dark-border hover:border-gold-500/20 transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {t.openTradesTitle}
            </h3>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-fintech-greenSoft text-fintech-green border border-fintech-green/30">
              <span className="w-1.5 h-1.5 rounded-full bg-fintech-green animate-ping"></span>
              {openPositions.length} ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.openTradesDesc}
          </p>
        </div>
      </div>

      {openPositions.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-xl bg-dark-elevated/40 border border-dashed border-dark-border">
          <CheckCircle2 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-300">
            {t.noOpenTrades}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Strict risk filters active: Algorithm enters only on high-confluence London/NY momentum
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-dark-border text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-3 px-3">{t.ticket}</th>
                <th className="py-3 px-3">{t.symbol}</th>
                <th className="py-3 px-3">{t.type}</th>
                <th className="py-3 px-3">{t.lot}</th>
                <th className="py-3 px-3">{t.entry}</th>
                <th className="py-3 px-3">{t.currentPrice}</th>
                <th className="py-3 px-3">SL / TP</th>
                <th className="py-3 px-3 text-right">{t.profit}</th>
                <th className="py-3 px-3 text-right">{t.duration}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border font-mono">
              {openPositions.map((pos) => {
                const isBuy = pos.type === 'BUY';
                const isProfit = pos.profit >= 0;

                return (
                  <tr key={pos.ticket} className="hover:bg-dark-elevated/60 transition-colors group">
                    <td className="py-3.5 px-3 text-slate-300 font-semibold">
                      #{pos.ticket}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                      {pos.symbol}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          isBuy
                            ? 'bg-fintech-greenSoft text-fintech-green border border-fintech-green/30'
                            : 'bg-fintech-redSoft text-fintech-red border border-fintech-red/30'
                        }`}
                      >
                        {isBuy ? (
                          <ArrowUpRight className="w-3 h-3 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 mr-0.5" />
                        )}
                        {pos.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-200 font-semibold">
                      {pos.lots.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      ${pos.openPrice.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-white font-bold">
                      ${pos.currentPrice.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                      <span className="text-red-400/90">{pos.sl.toFixed(2)}</span> /{' '}
                      <span className="text-emerald-400/90">{pos.tp.toFixed(2)}</span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div
                        className={`font-bold text-sm ${
                          isProfit ? 'text-fintech-green' : 'text-fintech-red'
                        }`}
                      >
                        {isProfit ? `+$${pos.profit.toFixed(2)}` : `-$${Math.abs(pos.profit).toFixed(2)}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {pos.pips >= 0 ? `+${pos.pips.toFixed(1)}` : `${pos.pips.toFixed(1)}`} pips
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-400">
                      <div className="flex items-center justify-end gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {pos.duration}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
