'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// ── Roles ─────────────────────────────────────────────────────────────────────
// admin    → can see everything + call /api/mt5/config mutations
// investor → read-only dashboard (live data, charts, trades)
// guest    → public landing + preview only
// ─────────────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'investor' | 'guest' | null;

interface AuthContextType {
  role: UserRole;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isInvestor: boolean;
  loginAsGuest: () => void;
  loginWithPassword: (password: string) => 'admin' | 'investor' | 'invalid';
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  investorId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Passwords come from env vars — set in Vercel + .env.local
// NEXT_PUBLIC_ADMIN_PASSWORD    → full admin access
// NEXT_PUBLIC_INVESTOR_PASSWORD → read-only investor view
const ADMIN_PASS  = process.env.NEXT_PUBLIC_ADMIN_PASSWORD  ?? '';
const INVEST_PASS = process.env.NEXT_PUBLIC_INVESTOR_PASSWORD ?? 'goldstar2026';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [investorId, setInvestorId] = useState<string>('');

  useEffect(() => {
    const storedRole = localStorage.getItem('gs_role') as UserRole | null;
    const storedId   = localStorage.getItem('gs_investor_id') ?? '';
    if (storedRole === 'admin' || storedRole === 'investor' || storedRole === 'guest') {
      setRole(storedRole);
      setInvestorId(storedId);
    }
  }, []);

  const persist = (r: UserRole, id: string) => {
    setRole(r);
    setInvestorId(id);
    if (r) {
      localStorage.setItem('gs_role', r);
      localStorage.setItem('gs_investor_id', id);
    }
    setIsLoginModalOpen(false);
  };

  const loginAsGuest = () => persist('guest', 'GUEST');

  const loginWithPassword = (password: string): 'admin' | 'investor' | 'invalid' => {
    const p = password.trim();
    if (ADMIN_PASS && p === ADMIN_PASS) {
      persist('admin', 'ADMIN');
      return 'admin';
    }
    if (p === INVEST_PASS) {
      persist('investor', 'INVESTOR-' + Math.floor(Math.random() * 9000000 + 1000000));
      return 'investor';
    }
    return 'invalid';
  };

  const logout = () => {
    setRole(null);
    setInvestorId('');
    localStorage.removeItem('gs_role');
    localStorage.removeItem('gs_investor_id');
    // legacy keys cleanup
    localStorage.removeItem('gold_star_auth');
    localStorage.removeItem('gold_star_investor_id');
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        isLoggedIn: role !== null,
        isAdmin: role === 'admin',
        isInvestor: role === 'investor' || role === 'admin',
        loginAsGuest,
        loginWithPassword,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
        investorId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
