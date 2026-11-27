import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StickyMobileBar } from '@/components/StickyMobileBar';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Gold Star MT5 handles profile contact details, live telemetry, and AI chat rate-limiting.',
};

export default function PrivacyPage() {
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
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Privacy Policy</h1>
              <p className="text-xs text-slate-400 font-mono">Last updated: November 2026</p>
            </div>
          </div>

          <section className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-gold-300">1. Information You Provide</h2>
            <p>
              When you save your trader profile on <code className="text-gold-300">/profile</code>, we store your email address, phone number, display name, and preferred language in Upstash Redis solely so you can sign back in with your email and receive requested demo or investor access details.
            </p>
          </section>

          <section className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-gold-300">2. Gold Star AI & Rate Limiting</h2>
            <p>
              Messages sent to Gold Star AI are processed via our server-side AI gateway. To prevent abuse, we temporarily track message counts by IP address in Redis for up to 24 hours. We do not sell or share your conversations with third-party marketers.
            </p>
          </section>

          <section className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-gold-300">3. Local Browser Storage</h2>
            <p>
              We use browser <code className="text-gold-300">localStorage</code> strictly for essential session state (active email login, language preference English/తెలుగు). No third-party advertising trackers are used.
            </p>
          </section>

          <section className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-gold-300">4. Data Deletion & Contact</h2>
            <p>
              To update or delete your stored profile data, message owner <strong>Abhishek</strong> directly on WhatsApp (<strong>+91 9963303115</strong>) or Telegram (<strong>@Chinna119</strong>).
            </p>
          </section>
        </div>
      </main>
      <Footer />
      <StickyMobileBar />
    </div>
  );
}
