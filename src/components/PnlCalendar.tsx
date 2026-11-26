'use client';

import React, { useState } from 'react';
import { useTradingData } from '@/context/TradingDataContext';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, TrendingUp } from 'lucide-react';

export function PnlCalendar() {
  const { data } = useTradingData();
  const { t } = useLanguage();

  // November 2026 calendar view
  const year = 2026;
  const month = 10; // 0-indexed, 10 = November

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday = 0

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Calculate monthly stats from calendar map
  let monthlyTotal = 0;
  let winDays = 0;
  let lossDays = 0;
  let activeTradingDays = 0;

  daysArray.forEach((d) => {
    const dayStr = d < 10 ? `0${d}` : `${d}`;
    const dateKey = `${year}-11-${dayStr}`;
    const dayData = data.monthlyCalendar[dateKey];
    if (dayData) {
      activeTradingDays++;
      monthlyTotal += dayData.profit;
      if (dayData.profit >= 0) {
        winDays++;
      } else {
        lossDays++;
      }
    }
  });

  return (
    <div
      data-aos="fade-up"
      data-aos-duration="600"
      className="p-5 rounded-2xl bg-dark-card border border-dark-border hover:border-gold-500/20 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {t.calendarTitle}
            </h3>
            <span className="text-xs font-mono font-bold text-gold-400 px-2 py-0.5 rounded bg-gold-500/10 border border-gold-500/20">
              {monthNames[month]} {year}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.calendarDesc}
          </p>
        </div>

        {/* Monthly Net Summary Badge */}
        <div className="flex items-center gap-3 bg-dark-elevated border border-dark-border px-3.5 py-2 rounded-xl text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">{t.monthlyNetProfit}</span>
            <span
              className={`text-sm font-black ${
                monthlyTotal >= 0 ? 'text-fintech-green' : 'text-fintech-red'
              }`}
            >
              {monthlyTotal >= 0 ? `+$${monthlyTotal.toFixed(2)}` : `-$${Math.abs(monthlyTotal).toFixed(2)}`}
            </span>
          </div>
          <div className="border-l border-dark-border pl-3">
            <span className="text-slate-400 block text-[10px] uppercase">Win / Loss Days</span>
            <span className="text-slate-200 font-bold">
              <span className="text-fintech-green">{winDays}W</span> / <span className="text-fintech-red">{lossDays}L</span>
            </span>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-[11px] font-mono font-semibold text-slate-500">
        <div>SUN</div>
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div>SAT</div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {/* Leading empty pads */}
        {paddingArray.map((p) => (
          <div
            key={`pad-${p}`}
            className="h-16 sm:h-20 rounded-xl bg-dark-elevated/20 border border-transparent"
          ></div>
        ))}

        {/* Month Day Tiles */}
        {daysArray.map((day) => {
          const dayStr = day < 10 ? `0${day}` : `${day}`;
          const dateKey = `${year}-11-${dayStr}`;
          const dayData = data.monthlyCalendar[dateKey];
          const hasTrade = !!dayData;
          const isProfit = hasTrade && dayData.profit >= 0;

          // Check if weekend
          const dayOfWeek = new Date(year, month, day).getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          return (
            <div
              key={`day-${day}`}
              className={`h-16 sm:h-20 rounded-xl p-1.5 sm:p-2 border transition-all flex flex-col justify-between font-mono relative overflow-hidden group ${
                hasTrade
                  ? isProfit
                    ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/30'
                    : 'bg-rose-950/20 border-rose-500/30 hover:border-rose-400 hover:bg-rose-950/30'
                  : isWeekend
                  ? 'bg-dark-elevated/10 border-dark-border/40 text-slate-600'
                  : 'bg-dark-elevated/30 border-dark-border/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span
                  className={`font-semibold ${
                    hasTrade
                      ? isProfit
                        ? 'text-emerald-300'
                        : 'text-rose-300'
                      : isWeekend
                      ? 'text-slate-600'
                      : 'text-slate-400'
                  }`}
                >
                  {day}
                </span>

                {hasTrade && (
                  <span
                    className={`text-[9px] px-1 rounded ${
                      isProfit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {dayData.tradesCount}T
                  </span>
                )}
              </div>

              {hasTrade ? (
                <div className="text-right">
                  <span
                    className={`text-[11px] sm:text-xs font-bold block ${
                      isProfit ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isProfit ? `+$${dayData.profit.toFixed(0)}` : `-$${Math.abs(dayData.profit).toFixed(0)}`}
                  </span>
                  <span className="text-[9px] text-slate-400 block hidden sm:block">
                    {dayData.percent >= 0 ? `+${dayData.percent}%` : `${dayData.percent}%`}
                  </span>
                </div>
              ) : isWeekend ? (
                <div className="text-[10px] text-slate-600 text-right">Closed</div>
              ) : (
                <div className="text-[10px] text-slate-600 text-right">--</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-3 border-t border-dark-border text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80"></span>
            <span>Green = Net Profit Day</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80"></span>
            <span>Red = Net Loss Day</span>
          </div>
        </div>
        <span className="font-mono text-slate-500 text-[11px]">
          Myfxbook Verified Architecture
        </span>
      </div>
    </div>
  );
}
