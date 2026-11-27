import Link from 'next/link';
import { Star, Home, Activity } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-dark-base text-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-3xl bg-dark-card border border-gold-500/30 p-8 text-center space-y-5 shadow-2xl">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gold-500/15 border border-gold-500/40 flex items-center justify-center text-gold-400">
          <Star className="w-7 h-7 fill-gold-400" />
        </div>
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-gold-400">Error 404</div>
          <h1 className="text-2xl font-extrabold text-white">Page Not Found</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The route you requested does not exist on the Gold Star MT5 portal.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-base font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Intro Home</span>
          </Link>
          <Link
            href="/terminal"
            className="flex-1 py-2.5 px-4 rounded-xl bg-dark-elevated hover:bg-dark-hover border border-dark-border text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Live Terminal</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
