'use client';

import React, { useState, useMemo } from 'react';
import { useTradingData } from '@/context/TradingDataContext';
import { useLanguage } from '@/context/LanguageContext';
import { Download, Search, Filter, ArrowUpRight, ArrowDownRight, Clock, FileSpreadsheet } from 'lucide-react';
import { HistoricalTrade } from '@/types/trading';

export function ClosedTradesTable() {
  const { data } = useTradingData();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [visibleCount, setVisibleCount] = useState(12);

  const filteredTrades = useMemo(() => {
    return data.closedTrades.filter((trade) => {
      const matchesSearch =
        trade.ticket.toString().includes(search) ||
        trade.closeTime.toLowerCase().includes(search.toLowerCase()) ||
        trade.symbol.toLowerCase().includes(search.toLowerCase());

      const matchesDirection =
        directionFilter === 'ALL' || trade.type === directionFilter;

      return matchesSearch && matchesDirection;
    });
  }, [data.closedTrades, search, directionFilter]);

  const handleDownloadCsv = () => {
    const headers = [
      'Ticket',
      'CloseTime',
      'Symbol',
      'Direction',
      'Lots',
      'OpenPrice',
      'ClosePrice',
      'NetProfitUSD',
      'Pips',
      'Duration',
    ];

    const rows = data.closedTrades.map((t) => [
      t.ticket,
      `"${t.closeTime}"`,
      t.symbol,
      t.type,
      t.lots.toFixed(2),
      t.openPrice.toFixed(2),
      t.closePrice.toFixed(2),
      t.profit.toFixed(2),
      t.pips.toFixed(1),
      `"${t.duration}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `GoldStar_MT5_Trades_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      data-aos="fade-up"
      data-aos-duration="600"
      className="p-5 rounded-2xl bg-dark-card border border-dark-border hover:border-gold-500/20 transition-all duration-200"
    >
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {t.closedTradesTitle}
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-dark-elevated text-slate-300 border border-dark-border">
              {filteredTrades.length} Trades
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.closedTradesDesc}
          </p>
        </div>

        {/* Search, Filter, and Export CSV Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-dark-elevated border border-dark-border text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/50 w-40 sm:w-48 font-mono"
            />
          </div>

          {/* Direction Filter */}
          <div className="flex items-center bg-dark-elevated border border-dark-border rounded-xl p-0.5 text-xs">
            {(['ALL', 'BUY', 'SELL'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setDirectionFilter(dir)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  directionFilter === dir
                    ? 'bg-gold-500 text-dark-base font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {dir === 'ALL' ? t.filterAll : dir}
              </button>
            ))}
          </div>

          {/* Download CSV Button */}
          <button
            onClick={handleDownloadCsv}
            className="px-3 py-1.5 rounded-xl bg-dark-elevated hover:bg-dark-hover border border-gold-500/30 text-gold-400 hover:text-gold-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-gold-subtle"
            title="Download full audited trade history in CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.downloadCsv}</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-dark-border text-slate-400 font-mono uppercase text-[11px]">
              <th className="py-3 px-3">{t.ticket}</th>
              <th className="py-3 px-3">{t.closeTime}</th>
              <th className="py-3 px-3">{t.symbol}</th>
              <th className="py-3 px-3">{t.type}</th>
              <th className="py-3 px-3">{t.lot}</th>
              <th className="py-3 px-3">{t.entry}</th>
              <th className="py-3 px-3">{t.closePrice}</th>
              <th className="py-3 px-3 text-right">{t.profit}</th>
              <th className="py-3 px-3 text-right">{t.duration}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border font-mono">
            {filteredTrades.slice(0, visibleCount).map((trade) => {
              const isBuy = trade.type === 'BUY';
              const isProfit = trade.profit >= 0;

              return (
                <tr key={trade.ticket} className="hover:bg-dark-elevated/40 transition-colors">
                  <td className="py-3 px-3 text-slate-400 font-medium">
                    #{trade.ticket}
                  </td>
                  <td className="py-3 px-3 text-slate-300 text-[11px]">
                    {trade.closeTime}
                  </td>
                  <td className="py-3 px-3 font-bold text-white">
                    {trade.symbol}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isBuy
                          ? 'bg-fintech-greenSoft text-fintech-green'
                          : 'bg-fintech-redSoft text-fintech-red'
                      }`}
                    >
                      {isBuy ? (
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-0.5" />
                      )}
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-200">
                    {trade.lots.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    ${trade.openPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-slate-200 font-semibold">
                    ${trade.closePrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`font-bold text-xs ${
                        isProfit ? 'text-fintech-green' : 'text-fintech-red'
                      }`}
                    >
                      {isProfit ? `+$${trade.profit.toFixed(2)}` : `-$${Math.abs(trade.profit).toFixed(2)}`}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {trade.pips >= 0 ? `+${trade.pips.toFixed(1)}` : `${trade.pips.toFixed(1)}`} pips
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 text-[11px]">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {trade.duration}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Load More */}
      {visibleCount < filteredTrades.length && (
        <div className="pt-4 text-center border-t border-dark-border mt-3">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="px-4 py-2 rounded-xl bg-dark-elevated hover:bg-dark-hover border border-dark-border text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Show More Closed Trades ({filteredTrades.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
