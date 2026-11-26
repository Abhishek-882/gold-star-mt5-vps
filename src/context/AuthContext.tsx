'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  loginAsGuest: () => void;
  loginWithPassword: (password: string) => boolean;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  investorId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [investorId, setInvestorId] = useState<string>('INVESTOR-GUEST');

  useEffect(() => {
    // Check if user previously logged in
    const storedAuth = localStorage.getItem('gold_star_auth');
    if (storedAuth === 'true') {
      setIsLoggedIn(true);
      const storedId = localStorage.getItem('gold_star_investor_id') || 'INVESTOR-2849102';
      setInvestorId(storedId);
    }
  }, []);

  const loginAsGuest = () => {
    setIsLoggedIn(true);
    setInvestorId('GUEST-PASS');
    localStorage.setItem('gold_star_auth', 'true');
    localStorage.setItem('gold_star_investor_id', 'GUEST-PASS');
    setIsLoginModalOpen(false);
  };

  const loginWithPassword = (password: string): boolean => {
    // Accepts demo password or any input for trial
    if (password.trim().toLowerCase() === 'goldstar' || password.trim().toLowerCase() === 'goldstar2026' || password.trim().length >= 4) {
      setIsLoggedIn(true);
      const id = 'INVESTOR-2849102';
      setInvestorId(id);
      localStorage.setItem('gold_star_auth', 'true');
      localStorage.setItem('gold_star_investor_id', id);
      setIsLoginModalOpen(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('gold_star_auth');
    localStorage.removeItem('gold_star_investor_id');
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
