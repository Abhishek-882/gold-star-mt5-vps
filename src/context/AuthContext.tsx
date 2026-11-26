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
  userEmail: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isInvestor: boolean;
  loginAsGuest: () => void;
  loginWithEmail: (email: string) => void;
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
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [investorId, setInvestorId] = useState<string>('');

  useEffect(() => {
    const storedRole  = localStorage.getItem('gs_role') as UserRole | null;
    const storedId    = localStorage.getItem('gs_investor_id') ?? '';
    const storedEmail = localStorage.getItem('gs_user_email') ?? '';
    if (storedRole === 'admin' || storedRole === 'investor' || storedRole === 'guest') {
      setRole(storedRole);
      setInvestorId(storedId);
    }
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const persist = (r: UserRole, id: string, email?: string) => {
    setRole(r);
    setInvestorId(id);
    if (r) {
      localStorage.setItem('gs_role', r);
      localStorage.setItem('gs_investor_id', id);
    }
    if (email !== undefined) {
      setUserEmail(email);
      if (email) {
        localStorage.setItem('gs_user_email', email);
      } else {
        localStorage.removeItem('gs_user_email');
      }
    }
    setIsLoginModalOpen(false);
  };

  const loginAsGuest = () => persist('guest', 'GUEST');

  const loginWithEmail = (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    const nextRole: UserRole = role === 'admin' || role === 'investor' ? role : 'guest';
    const nextId = investorId || clean;
    persist(nextRole, nextId, clean);
  };

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
    setUserEmail('');
    localStorage.removeItem('gs_role');
    localStorage.removeItem('gs_investor_id');
    localStorage.removeItem('gs_user_email');
    localStorage.removeItem('gs_profile');
    // legacy keys cleanup
    localStorage.removeItem('gold_star_auth');
    localStorage.removeItem('gold_star_investor_id');
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        userEmail,
        isLoggedIn: role !== null,
        isAdmin: role === 'admin',
        isInvestor: role === 'investor' || role === 'admin',
        loginAsGuest,
        loginWithEmail,
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
