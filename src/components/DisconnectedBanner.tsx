'use client';

import React from 'react';
import { useTradingData } from '@/context/TradingDataContext';
import { useLanguage } from '@/context/LanguageContext';
import { AlertTriangle, RefreshCw, ServerCrash } from 'lucide-react';

export function DisconnectedBanner() {
  const { data, refreshData, isRefreshing, setIsSettingsOpen } = useTradingData();
  const { t } = useLanguage();

  const isDisconnected = !data.botConfig.isLiveConnected || data.botConfig.status === 'DISCONNECTED' || data.botConfig.status === 'PAUSED';

  if (!isDisconnected) return null;

  const formattedTime = new Date(data.botConfig.lastUpdated).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <aside aria-label="Connection Status" className="w-full bg-gradient-to-r from-red-950/90 via-amber-950/80 to-red-950/90 border-b border-red-500/30 px-4 py-3 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0 animate-pulse">
            <ServerCrash className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="font-bold text-red-300 text-sm tracking-wide">
                {t.liveFeedPaused} <span className="text-white underline font-mono">{formattedTime}</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/30 text-red-200 uppercase tracking-wider">
                FEED OFFLINE
              </span>
            </div>
            <p className="text-xs text-red-200/80 mt-0.5">
              {t.reconnectNotice}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => refreshData()}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800/80 border border-red-500/40 text-xs font-medium text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Retry Feed</span>
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-slate-200 transition-colors"
          >
            Configure MT5
          </button>
        </div>
      </div>
    </aside>
  );
}
