'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-dark-base text-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-3xl bg-dark-card border border-amber-500/30 p-8 text-center space-y-5 shadow-2xl">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Recovery Mode
          </div>
          <h1 className="text-xl font-extrabold text-white">Something went wrong</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error?.message || 'An unexpected rendering error occurred. Your MT5 account is unaffected.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-base font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="flex-1 py-2.5 px-4 rounded-xl bg-dark-elevated hover:bg-dark-hover border border-dark-border text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
