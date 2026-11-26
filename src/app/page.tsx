'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
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
import { IntroPage } from '@/components/IntroPage';

export default function DashboardPage() {
  const { isLoggedIn } = useAuth();

  // If visitor is not logged in, show the full Cinematic Intro & Conversion Landing Page
  if (!isLoggedIn) {
    return (
      <>
        <IntroPage />
        <InvestorLoginModal />
        <StickyMobileBar />
      </>
    );
  }

  // When logged in as Investor or Guest, display the Full Live Trading Terminal
  return (
    <div className="min-h-screen bg-dark-base fintech-grid-bg relative flex flex-col">
      {/* 1. Offline / Disconnected Warning Banner */}
      <DisconnectedBanner />

      {/* 2. Main Navigation Header */}
      <Header />

      {/* 3. Primary Dashboard Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
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

      {/* 5. Sticky Bottom Bar on Mobile Devices (Telegram, WhatsApp, Instagram) */}
      <StickyMobileBar />

      {/* 6. Settings & MT5 Connection Modal */}
      <SettingsModal />

      {/* 7. Investor Login Modal */}
      <InvestorLoginModal />
    </div>
  );
}
