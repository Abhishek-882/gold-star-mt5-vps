'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Activity, CheckCircle2, TrendingUp, X } from 'lucide-react';
import { useTradingData } from '@/context/TradingDataContext';

interface ToastState {
  id: number;
  title: string;
  detail: string;
  tone: 'gold' | 'green';
}

export function LiveSyncToast() {
  const { data, isRefreshing, activeStrategy } = useTradingData();
  const [toast, setToast] = useState<ToastState | null>(null);
  const prevClosedCountRef = useRef<number | null>(null);
  const prevOpenCountRef = useRef<number | null>(null);
  const wasRefreshingRef = useRef<boolean>(false);
  const prevStrategyRef = useRef<string>(activeStrategy);

  // Reset baselines when switching strategies so switching doesn't fire false trade toasts
  useEffect(() => {
    if (prevStrategyRef.current !== activeStrategy) {
      prevStrategyRef.current = activeStrategy;
      prevClosedCountRef.current = null;
      prevOpenCountRef.current = null;
    }
  }, [activeStrategy]);

  useEffect(() => {
    const closedCount = data.closedTrades.length;
    const openCount = data.openPositions.length;

    if (prevClosedCountRef.current !== null && closedCount > prevClosedCountRef.current) {
      const latest = data.closedTrades[0];
      if (latest) {
        const sign = latest.profit >= 0 ? '+' : '';
        setToast({
          id: Date.now(),
          title: 'Trade Closed',
          detail: `${latest.symbol} ${latest.type} • ${sign}$${latest.profit.toFixed(2)}`,
          tone: latest.profit >= 0 ? 'green' : 'gold',
        });
      }
    } else if (prevOpenCountRef.current !== null && openCount > prevOpenCountRef.current) {
      const latestOpen = data.openPositions[0];
      if (latestOpen) {
        setToast({
          id: Date.now(),
          title: 'New Position Active',
          detail: `${latestOpen.symbol} ${latestOpen.type} (${latestOpen.lots} lots)`,
          tone: 'gold',
        });
      }
    }

    prevClosedCountRef.current = closedCount;
    prevOpenCountRef.current = openCount;
  }, [data.closedTrades, data.openPositions]);

  // Show sleek confirmation toast when manual refresh finishes
  useEffect(() => {
    if (wasRefreshingRef.current && !isRefreshing) {
      setToast({
        id: Date.now(),
        title: 'Live Telemetry Synced',
        detail: `${data.botConfig.botName} • Equity $${data.metrics.equity.toFixed(2)}`,
        tone: 'green',
      });
    }
    wasRefreshingRef.current = isRefreshing;
  }, [isRefreshing, data.botConfig.botName, data.metrics.equity]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-16 right-4 z-40 max-w-xs w-full sm:w-auto modal-spring-in"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl bg-dark-card/95 backdrop-blur-md ${
          toast.tone === 'green'
            ? 'border-fintech-green/40 shadow-green-glow'
            : 'border-gold-500/40 shadow-gold-subtle'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            toast.tone === 'green'
              ? 'bg-fintech-greenSoft text-fintech-green'
              : 'bg-gold-500/15 text-gold-400'
          }`}
        >
          {toast.tone === 'green' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : toast.title.includes('Position') ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <Activity className="w-4 h-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-extrabold text-white">{toast.title}</div>
          <div className="text-[11px] font-mono text-slate-300 truncate">{toast.detail}</div>
        </div>
        <button
          type="button"
          onClick={() => setToast(null)}
          aria-label="Dismiss notification"
          className="text-slate-500 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
