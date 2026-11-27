import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StickyMobileBar } from '@/components/StickyMobileBar';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service & Risk Disclosure',
  description: 'Usage terms, software notice, and leveraged XAUUSD trading risk disclosure for Gold Star MT5.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-dark-base text-slate-100 flex flex-col">
      <Header />
      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-gold-400 hover:text-gold-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="rounded-2xl bg-dark-card border border-dark-border p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Terms of Service & Risk Disclosure</h1>
              <p className="text-xs text-slate-400 font-mono">Last updated: November 2026</p>
            </div>
          </div>

          <section className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-gold-300">1. Informational Telemetry Only</h2>
            <p>
              This portal displays read-only performance telemetry from a live MetaTrader 5 account running the Gold Star Breakout Strategy. Nothing on this website or from Gold Star AI constitutes financial, investment, or tax advice.
            </p>
          </section>

          <section className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-gold-300">2. High-Risk Trading Notice</h2>
            <p>
              Trading spot gold (XAUUSD) and foreign exchange on margin carries substantial risk of loss and is not suitable for every investor. Past performance is not indicative of future results. Zero guaranteed profit claims are made.
            </p>
          </section>

          <section className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-gold-300">3. Acceptable Use</h2>
            <p>
              Automated scraping, API flooding, or attempting to bypass chat rate limits or admin controls is prohibited and may result in automatic access blocks.
            </p>
          </section>

          <section className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-gold-300">4. Contact</h2>
            <p>
              For licensing, read-only investor credentials, or support, contact <strong>Abhishek</strong> via WhatsApp (<strong>+91 9963303115</strong>) or Telegram (<strong>@Chinna119</strong>).
            </p>
          </section>
        </div>
      </main>
      <Footer />
      <StickyMobileBar />
    </div>
  );
}
