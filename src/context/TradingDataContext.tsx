'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DashboardData } from '@/types/trading';
import { defaultDashboardData } from '@/lib/defaultData';

interface TradingDataContextType {
  data: DashboardData;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncFormatted: string;
  refreshData: () => Promise<void>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  updateConfig: (newConfig: Partial<DashboardData['botConfig']>) => Promise<void>;
  simulateDisconnect: () => Promise<void>;
  resetToDemo: () => Promise<void>;
}

const TradingDataContext = createContext<TradingDataContextType | undefined>(undefined);

export function TradingDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DashboardData>(defaultDashboardData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncFormatted, setLastSyncFormatted] = useState<string>('Just now');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const calculateLastSync = useCallback((isoString: string) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, []);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/mt5/live?t=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          setLastSyncFormatted(calculateLastSync(json.data.botConfig.lastUpdated));
        }
      }
    } catch (err) {
      console.error('Failed to refresh MT5 data:', err);
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, [calculateLastSync]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Periodic polling every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Update "last sync" text every 5 seconds
  useEffect(() => {
    const ticker = setInterval(() => {
      if (data?.botConfig?.lastUpdated) {
        setLastSyncFormatted(calculateLastSync(data.botConfig.lastUpdated));
      }
    }, 5000);
    return () => clearInterval(ticker);
  }, [data?.botConfig?.lastUpdated, calculateLastSync]);

  const updateConfig = async (partialConfig: Partial<DashboardData['botConfig']>) => {
    try {
      const res = await fetch('/api/mt5/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialConfig),
      });
      if (res.ok) {
        await fetchData(true);
      }
    } catch (err) {
      console.error('Error updating bot config:', err);
    }
  };

  const simulateDisconnect = async () => {
    try {
      await fetch('/api/mt5/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate_disconnect' }),
      });
      await fetchData(true);
    } catch (err) {
      console.error('Error simulating disconnect:', err);
    }
  };

  const resetToDemo = async () => {
    try {
      await fetch('/api/mt5/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_demo' }),
      });
      await fetchData(true);
    } catch (err) {
      console.error('Error resetting demo:', err);
    }
  };

  return (
    <TradingDataContext.Provider
      value={{
        data,
        isLoading,
        isRefreshing,
        lastSyncFormatted,
        refreshData: () => fetchData(true),
        isSettingsOpen,
        setIsSettingsOpen,
        updateConfig,
        simulateDisconnect,
        resetToDemo,
      }}
    >
      {children}
    </TradingDataContext.Provider>
  );
}

export function useTradingData() {
  const context = useContext(TradingDataContext);
  if (!context) {
    throw new Error('useTradingData must be used within a TradingDataProvider');
  }
  return context;
}
