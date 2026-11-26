'use client';

import React, { useState } from 'react';
import { useTradingData } from '@/context/TradingDataContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Send,
  MessageCircle,
  Instagram,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function ConversionSection() {
  const { data } = useTradingData();
  const { t } = useLanguage();
  const { botConfig } = data;

  // Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [capital, setCapital] = useState('$1,000 - $5,000');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim()) return;

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#FFD700', '#00C087', '#FFFFFF'],
    });

    setIsSubmitted(true);

    // Build pre-filled WhatsApp message
    const msg = `Hi Gold Star Team! I would like to request free demo investor access for my MT5 account.%0A%0A*Name:* ${encodeURIComponent(
      fullName
    )}%0A*Phone:* ${encodeURIComponent(
      phoneNumber
    )}%0A*Planned Capital:* ${encodeURIComponent(capital)}%0A%0APlease share the investor credentials and setup guide.`;

    // Extract clean phone number without spaces
    const cleanNumber = botConfig.whatsappNumber.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanNumber}?text=${msg}`;

    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 600);
  };

  const faqs = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
    { q: t.faq4Q, a: t.faq4A },
    { q: t.faq5Q, a: t.faq5A },
  ];

  return (
    <section id="contact-section" className="space-y-12 pt-8">
      {/* Big Master CTA Card */}
      <div
        data-aos="fade-up"
        data-aos-duration="600"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-card via-dark-elevated to-dark-card border border-gold-500/30 p-6 sm:p-10 shadow-gold-glow"
      >
        {/* Decorative gold background blur */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            Limited Institutional Release
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.ctaTitle}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {t.ctaSubtitle}
          </p>

          {/* Direct Contact Buttons (Telegram, WhatsApp, Instagram) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {/* Telegram */}
            <a
              href={botConfig.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 border border-[#229ED9]/40 text-[#229ED9] hover:text-white font-bold text-sm flex items-center gap-2.5 transition-all shadow-md group"
            >
              <Send className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>{t.telegramBtn}</span>
            </a>

            {/* WhatsApp */}
            <a
              href={botConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] hover:text-white font-bold text-sm flex items-center gap-2.5 transition-all shadow-md group"
            >
              <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{t.whatsappBtn}</span>
            </a>

            {/* Instagram */}
            <a
              href={botConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#833AB4]/20 via-[#FD1D1D]/20 to-[#F77737]/20 hover:from-[#833AB4]/30 hover:to-[#F77737]/30 border border-pink-500/30 text-pink-300 hover:text-white font-bold text-sm flex items-center gap-2.5 transition-all shadow-md group"
            >
              <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{t.instagramBtn}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Demo Request Form + FAQ Accordion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Lead Capture Form */}
        <div
          data-aos="fade-up"
          data-aos-duration="600"
          className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-dark-card border border-dark-border hover:border-gold-500/30 transition-all duration-200"
        >
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-400"></span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {t.requestDemoTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t.requestDemoDesc}
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-6 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-emerald-300">
                {t.demoSuccessTitle}
              </h4>
              <p className="text-xs text-slate-300">
                {t.demoSuccessMsg}
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-2 text-xs text-gold-400 hover:underline font-mono"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleDemoSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  {t.nameLabel} <span className="text-gold-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-elevated border border-dark-border text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 font-sans text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  {t.phoneLabel} <span className="text-gold-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Enter your WhatsApp / Phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-elevated border border-dark-border text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 font-sans text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  {t.capitalLabel}
                </label>
                <select
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-elevated border border-dark-border text-slate-200 focus:outline-none focus:border-gold-500/60 font-sans text-xs transition-colors"
                >
                  <option value="$500 - $1,000">$500 - $1,000 (Micro Lot 0.01)</option>
                  <option value="$1,000 - $5,000">$1,000 - $5,000 (Recommended Standard)</option>
                  <option value="$5,000 - $25,000">$5,000 - $25,000 (Growth Tier)</option>
                  <option value="$25,000+">$25,000+ (Institutional / Prop Firm)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-base font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-subtle transition-all duration-200 hover:scale-[1.01]"
              >
                <span>{t.requestDemoSubmit}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-slate-500 text-center font-sans">
                🔒 We respect your privacy. No spam. Direct investor password provided.
              </p>
            </form>
          )}
        </div>

        {/* Right Column: FAQ Accordion */}
        <div
          data-aos="fade-up"
          data-aos-duration="600"
          data-aos-delay="50"
          className="lg:col-span-7 space-y-4"
        >
          <div className="mb-2">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {t.faqTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.faqSubtitle}
            </p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-dark-card border border-dark-border overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-slate-200 hover:text-gold-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-gold-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-dark-border/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
