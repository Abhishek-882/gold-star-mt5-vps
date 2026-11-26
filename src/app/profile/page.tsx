'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StickyMobileBar } from '@/components/StickyMobileBar';
import { SettingsModal } from '@/components/SettingsModal';
import { InvestorLoginModal } from '@/components/InvestorLoginModal';
import { User, Mail, Phone, CheckCircle2, ShieldCheck, ArrowRight, Home, Activity } from 'lucide-react';

interface UserProfile {
  name: string;
  gmail: string;
  phone: string;
  updatedAt?: string;
}

const PROFILE_STORAGE_KEY = 'gs_profile';

export default function ProfilePage() {
  const { role, isAdmin, isInvestor, setIsLoginModalOpen, logout } = useAuth();
  const [name, setName] = useState('');
  const [gmail, setGmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserProfile;
        setName(parsed.name ?? '');
        setGmail(parsed.gmail ?? '');
        setPhone(parsed.phone ?? '');
      }
    } catch {
      // ignore invalid storage
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    const trimmedGmail = gmail.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedGmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedGmail)) {
      setError('Please enter a valid Gmail / email address.');
      return;
    }
    if (!trimmedPhone || trimmedPhone.replace(/[^0-9]/g, '').length < 7) {
      setError('Please enter a valid phone number (at least 7 digits).');
      return;
    }

    const profile: UserProfile = {
      name: name.trim(),
      gmail: trimmedGmail,
      phone: trimmedPhone,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const roleLabel = isAdmin ? 'Admin' : isInvestor ? 'Investor' : 'Guest';

  return (
    <div className="min-h-screen bg-dark-base fintech-grid-bg relative flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        {/* Top Breadcrumb / Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <User className="w-7 h-7 text-gold-400" />
              <span>Trader Profile</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Save your Gmail and phone number for demo requests, investor credentials, and account alerts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-2 rounded-xl bg-dark-card hover:bg-dark-elevated border border-dark-border text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-gold-400" />
              <span>Intro</span>
            </Link>
            <Link
              href="/terminal"
              className="px-3.5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-base text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-gold-subtle transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Terminal</span>
            </Link>
          </div>
        </div>

        {/* Profile Form Card */}
        <form
          onSubmit={handleSave}
          className="p-6 sm:p-8 rounded-3xl bg-dark-card border border-gold-500/30 shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between border-b border-dark-border pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Contact Information</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-dark-elevated border border-gold-500/30 text-gold-300 text-[11px] font-mono font-bold uppercase">
              Role: {roleLabel}
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Full Name (Optional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-elevated border border-dark-border text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500 font-sans text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Gmail Address <span className="text-gold-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={gmail}
                  onChange={(e) => {
                    setGmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-elevated border border-dark-border text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500 font-sans text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Phone / WhatsApp Number <span className="text-gold-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-elevated border border-dark-border text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500 font-sans text-sm"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-fintech-redSoft border border-fintech-red/40 text-fintech-red text-xs font-mono">
              {error}
            </div>
          )}

          {saved && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Profile saved! Your Gmail and phone number are stored and will auto-fill demo requests.</span>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-dark-elevated hover:bg-dark-hover border border-dark-border text-slate-300 text-xs font-mono transition-colors"
              >
                {role === 'admin' || role === 'investor' ? 'Switch Role' : 'Investor / Admin Login'}
              </button>
              {role && role !== 'guest' && (
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-300 text-xs font-mono transition-colors"
                >
                  Sign Out
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-base font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-gold-subtle transition-all"
            >
              <span>Save Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>

      <Footer />
      <StickyMobileBar />
      <SettingsModal />
      <InvestorLoginModal />
    </div>
  );
}
