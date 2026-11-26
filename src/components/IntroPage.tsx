'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTradingData } from '@/context/TradingDataContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Star,
  ShieldCheck,
  TrendingUp,
  Lock,
  ArrowRight,
  Zap,
  Activity,
  CheckCircle2,
  DollarSign,
  PieChart,
  ChevronDown,
  MessageCircle,
  Send,
  Instagram,
  Sparkles,
  Server,
  Layers,
  Award,
  User,
} from 'lucide-react';
import { EquityChart } from './EquityChart';
import { LiveTradesTable } from './LiveTradesTable';
import { ConversionSection } from './ConversionSection';
import { Footer } from './Footer';

export function IntroPage() {
  const router = useRouter();
  const { loginAsGuest, setIsLoginModalOpen } = useAuth();
  const { data } = useTradingData();
  const { t } = useLanguage();
  const { metrics, botConfig } = data;

  const handleGuestTerminal = () => {
    loginAsGuest();
    router.push('/terminal');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-dark-base fintech-grid-bg relative text-slate-100 flex flex-col overflow-x-hidden pb-20 sm:pb-0 page-enter">
      {/* 1. Live Gold Ribbon Stream Bar */}
      <div className="w-full bg-gradient-to-r from-dark-card via-gold-500/15 to-dark-card border-b border-gold-500/20 py-2 px-3 sm:px-4 overflow-hidden sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-gold-400 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
            <span className="font-bold shrink-0">LIVE MT5:</span>
            <span className="text-white font-semibold truncate">XAUUSD Gold</span>
            <span className="text-emerald-400 font-bold hidden sm:inline">({botConfig.status})</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-slate-400 hidden lg:inline">
              Broker: <strong className="text-slate-200">{botConfig.broker}</strong>
            </span>
            <Link
              href="/terminal"
              className="px-2.5 py-1 rounded-lg bg-dark-elevated hover:bg-dark-hover border border-gold-500/30 text-gold-300 font-bold text-[11px] uppercase tracking-wider transition-all flex items-center gap-1"
            >
              <Activity className="w-3 h-3" />
              <span>Terminal</span>
            </Link>
            <Link
              href="/profile"
              className="px-2.5 py-1 rounded-lg bg-dark-elevated hover:bg-dark-hover border border-dark-border text-slate-200 font-bold text-[11px] uppercase tracking-wider transition-all flex items-center gap-1"
            >
              <User className="w-3 h-3 text-gold-400" />
              <span className="hidden xs:inline sm:inline">Profile</span>
            </Link>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-base font-bold text-[11px] uppercase tracking-wider transition-all shadow-gold-subtle flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span className="hidden sm:inline">Investor Login</span>
              <span className="sm:hidden">Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center space-y-8">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Verified Badge Pill */}
        <div
          data-aos="fade-down"
          data-aos-duration="600"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-mono font-bold uppercase tracking-wider shadow-gold-subtle"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified Read-Only MT5 Investor Audit</span>
        </div>

        {/* Main Dramatic Headline */}
        <div data-aos="fade-up" data-aos-duration="600" className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-amber-500 bg-clip-text text-transparent">
              GOLD STAR
            </span>{' '}
            MT5 BOT
          </h1>
          <p className="text-lg sm:text-2xl font-bold text-slate-200 tracking-tight">
            Institutional Gold Execution. <span className="text-gold-400">Zero Martingale. Strict Stop Loss.</span>
          </p>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminating emotional trading with mathematical order flow and volatility mean-reversion on Spot Gold (XAUUSD). Live capital performance audited 24/5 on MetaTrader 5.
          </p>
        </div>

        {/* Primary Call-To-Action Buttons */}
        <div
          data-aos="fade-up"
          data-aos-duration="600"
          data-aos-delay="100"
          className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
        >
          {/* Unlock Live Terminal Button */}
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full sm:w-auto justify-center px-6 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-base font-extrabold text-sm uppercase tracking-wider flex items-center gap-2.5 shadow-gold-glow hover:scale-[1.02] transition-all duration-200 btn-sheen"
          >
            <Lock className="w-4 h-4" />
            <span>Unlock Live Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* 1-Click Instant Guest Pass */}
          <button
            onClick={handleGuestTerminal}
            className="w-full sm:w-auto justify-center px-6 py-3.5 rounded-2xl bg-dark-card hover:bg-dark-elevated border border-gold-500/30 hover:border-gold-400 text-gold-300 hover:text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>1-Click Guest Pass</span>
          </button>

          {/* WhatsApp Direct */}
          <a
            href={botConfig.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto justify-center px-5 py-3.5 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] hover:text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Request Demo on WhatsApp</span>
          </a>
        </div>

        {/* 4 Core Highlight Numbers Card Grid */}
        <div
          data-aos="fade-up"
          data-aos-duration="600"
          data-aos-delay="150"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 max-w-5xl mx-auto"
        >
          {/* Card 1: Total Growth */}
          <div className="p-5 rounded-2xl bg-dark-card border border-gold-500/30 shadow-gold-subtle text-left">
            <span className="text-xs uppercase font-mono font-semibold text-gold-300 block mb-1">
              Total Growth
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-gold-400 tracking-tight">
              {metrics.totalGrowthPercent > 0 ? `+${metrics.totalGrowthPercent.toFixed(1)}%` : `${metrics.totalGrowthPercent.toFixed(1)}%`}
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">
              {metrics.closedPnl !== 0 ? `Realized: $${metrics.closedPnl.toLocaleString()} USD` : 'Real MT5 Verified Data'}
            </span>
          </div>

          {/* Card 2: Win Rate */}
          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border text-left">
            <span className="text-xs uppercase font-mono font-semibold text-slate-400 block mb-1">
              Win Rate
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
              {metrics.winRate > 0 ? `${metrics.winRate.toFixed(1)}%` : '0.0%'}
            </div>
            <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
              {metrics.totalTrades > 0 ? `${metrics.winTrades} Wins / ${metrics.lossTrades} Losses` : 'Live Closed Deals'}
            </span>
          </div>

          {/* Card 3: Max Drawdown */}
          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border text-left">
            <span className="text-xs uppercase font-mono font-semibold text-slate-400 block mb-1">
              Max Drawdown
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400 tracking-tight">
              {metrics.maxDrawdownPercent > 0 ? `${metrics.maxDrawdownPercent.toFixed(1)}%` : '0.0%'}
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">
              Strict Hard Stop Loss
            </span>
          </div>

          {/* Card 4: Live Equity */}
          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border text-left">
            <span className="text-xs uppercase font-mono font-semibold text-slate-400 block mb-1">
              Live Equity
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 tracking-tight">
              ${metrics.equity > 0 ? metrics.equity.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">
              {metrics.totalDeposit > 0 ? `Deposits: $${metrics.totalDeposit.toLocaleString()}` : 'Real-Time MT5 Feed'}
            </span>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="pt-6">
          <button
            onClick={() => scrollToSection('preview-section')}
            className="inline-flex flex-col items-center gap-1 text-slate-400 hover:text-gold-400 text-xs font-mono transition-colors"
          >
            <span>Explore Live Audited Terminal Preview</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-gold-400" />
          </button>
        </div>
      </section>

      {/* 3. Interactive Preview Teaser Section */}
      <section id="preview-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Live Terminal Telemetry Preview
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time snapshot from MT5 Account #{botConfig.accountNumber}
            </p>
          </div>

          <button
            onClick={loginAsGuest}
            className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-base font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-gold-subtle transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enter Full Dashboard (1-Click)</span>
          </button>
        </div>

        {/* Equity Curve & Live Positions Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EquityChart />
          <LiveTradesTable />
        </div>
      </section>

      {/* 4. Bento Grid: Why Gold Star Outperforms */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Institutional Algorithmic Edge
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered to survive and profit across all market regimes without dangerous betting schemes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Item 1 */}
          <div
            data-aos="fade-up"
            data-aos-duration="600"
            className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-gold-500/30 transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Strict Pre-Calculated Stop Loss</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every position has a hard 25-45 pip Stop Loss placed simultaneously with entry. We never let an order run wild or hold losing positions overnight.
            </p>
          </div>

          {/* Bento Item 2 */}
          <div
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="100"
            className="p-6 rounded-2xl bg-dark-card border border-gold-500/30 shadow-gold-subtle transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gold-300">Zero Martingale, Zero Grid</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never double lot sizes on losses. Account risk is capped at 0.5% - 1.0% per trade with dynamic multi-tier profit trailing runners.
            </p>
          </div>

          {/* Bento Item 3 */}
          <div
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="200"
            className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-gold-500/30 transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Macro News Circuit Breaker</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated volatility shielding halts new entries 30 minutes before high-impact economic releases (CPI, Non-Farm Payrolls, FOMC rate decisions).
            </p>
          </div>
        </div>
      </section>

      {/* 5. 3-Step Setup Guide */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How To Deploy On Your Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            3 simple steps to start hands-free automated execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border relative">
            <span className="text-3xl font-black text-gold-500/40 block mb-2">01</span>
            <h3 className="text-sm font-bold text-white font-sans mb-1">Open Raw Spread MT5 Account</h3>
            <p className="text-slate-400 leading-relaxed font-sans">
              Choose Exness, IC Markets, or any low-spread MT5 broker with fast ECN liquidity.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border relative">
            <span className="text-3xl font-black text-gold-500/40 block mb-2">02</span>
            <h3 className="text-sm font-bold text-white font-sans mb-1">Connect Gold Star Bot</h3>
            <p className="text-slate-400 leading-relaxed font-sans">
              Our team attaches the algorithm to your account or provides the EA set files for your VPS.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border relative">
            <span className="text-3xl font-black text-gold-500/40 block mb-2">03</span>
            <h3 className="text-sm font-bold text-white font-sans mb-1">Monitor Hands-Free</h3>
            <p className="text-slate-400 leading-relaxed font-sans">
              Track live trades directly on your mobile MT5 app or this live dashboard with full transparency.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Lead Capture & FAQ Conversion Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <ConversionSection />
      </section>

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}
