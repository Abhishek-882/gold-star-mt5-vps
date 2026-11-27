'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Server } from 'lucide-react';
import { DisconnectedBanner } from '@/components/DisconnectedBanner';
import { Header } from '@/components/Header';
import { KpiCards } from '@/components/KpiCards';
import { BotStatusCard } from '@/components/BotStatusCard';
import { EquityChart } from '@/components/EquityChart';
import { DailyPnlBarChart } from '@/components/DailyPnlBarChart';
import { LiveTradesTable } from '@/components/LiveTradesTable';
import { ClosedTradesTable } from '@/components/ClosedTradesTable';
import { PnlCalendar } from '@/components/PnlCalendar';
import { ConversionSection } from '@/components/ConversionSection';
import { Footer } from '@/components/Footer';
import { StickyMobileBar } from '@/components/StickyMobileBar';
import { SettingsModal } from '@/components/SettingsModal';
import { InvestorLoginModal } from '@/components/InvestorLoginModal';
import { useTradingData } from '@/context/TradingDataContext';
import { STRATEGY_CATALOG, getStrategyMeta } from '@/lib/strategyCatalog';
import { StrategySlug } from '@/types/trading';

function TerminalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeStrategy, setActiveStrategy } = useTradingData();

  useEffect(() => {
    const param = searchParams.get('strategy');
    const valid = param ? getStrategyMeta(param) : undefined;
    const target: StrategySlug = valid ? valid.slug : 'gold-star';
    if (activeStrategy !== target) {
      setActiveStrategy(target);
    }
  }, [searchParams, activeStrategy, setActiveStrategy]);

  const handleSelect = (slug: StrategySlug) => {
    setActiveStrategy(slug);
    if (slug === 'gold-star') {
      router.push('/terminal');
    } else {
      router.push(`/terminal?strategy=${slug}`);
    }
  };

  const currentMeta = getStrategyMeta(activeStrategy) ?? STRATEGY_CATALOG[0];

  return (
    <div className="min-h-screen bg-dark-base fintech-grid-bg relative flex flex-col page-enter pb-20 sm:pb-0">
      {/* 1. Offline / Disconnected Warning Banner */}
      <DisconnectedBanner />

      {/* 2. Main Navigation Header */}
      <Header />

      {/* 3. Primary Dashboard Content Canvas */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Strategy Switcher Bar (MT5 #1 Main Star + MT5 #2 5-Strategy Desk) */}
        <div className="rounded-2xl bg-dark-card border border-dark-border p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <Server className="w-4 h-4 text-gold-400 shrink-0" />
            <span>
              Viewing:{' '}
              <strong className="text-gold-300">{currentMeta.name}</strong>{' '}
              <span className="text-slate-500">
                ({currentMeta.terminalSource === 'primary' ? 'MT5 #1 Main Star' : 'MT5 #2 Desk'})
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {STRATEGY_CATALOG.map((s) => {
              const isSelected = s.slug === activeStrategy;
              return (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => handleSelect(s.slug)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gold-500 text-dark-base border-gold-400 shadow-gold-subtle'
                      : 'bg-dark-elevated hover:bg-dark-hover border-dark-border text-slate-300'
                  }`}
                >
                  {s.isMainStar && (
                    <Star
                      className={`w-3 h-3 ${
                        isSelected ? 'fill-dark-base' : 'fill-gold-400 text-gold-400'
                      }`}
                    />
                  )}
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top KPI Telemetry Section */}
        <KpiCards />

        {/* Bot Runtime Architecture & Verification Card */}
        <BotStatusCard />

        {/* Primary Analytical Charts Grid (Equity Curve & 30-Day Daily Bar Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EquityChart />
          <DailyPnlBarChart />
        </div>

        {/* Myfxbook Style Monthly Performance Calendar Grid */}
        <PnlCalendar />

        {/* Real-Time Live Open Positions Table */}
        <LiveTradesTable />

        {/* Audited Closed Trades History Table with Search & CSV Export */}
        <ClosedTradesTable />

        {/* Conversion & Lead Capture (CTA + WhatsApp Form + Socials + FAQ Accordion) */}
        <ConversionSection />
      </main>

      {/* 4. Regulatory Compliance & Disclaimer Footer */}
      <Footer />

      {/* 5. Sticky Bottom Bar on Mobile Devices */}
      <StickyMobileBar />

      {/* 6. Settings & MT5 Connection Modal (Admin-only) */}
      <SettingsModal />

      {/* 7. Investor / Admin Login Modal */}
      <InvestorLoginModal />
    </div>
  );
}

export default function TerminalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-base" />}>
      <TerminalContent />
    </Suspense>
  );
}
