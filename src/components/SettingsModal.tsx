'use client';

import React, { useState } from 'react';
import { useTradingData } from '@/context/TradingDataContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Settings,
  Server,
  Lock,
  Radio,
  Send,
  MessageCircle,
  Instagram,
  RefreshCw,
  PowerOff,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export function SettingsModal() {
  const {
    data,
    isSettingsOpen,
    setIsSettingsOpen,
    updateConfig,
    simulateDisconnect,
    resetToDemo,
  } = useTradingData();
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'mt5' | 'social'>('mt5');

  // Form states
  const [broker, setBroker] = useState(data.botConfig.broker);
  const [server, setServer] = useState(data.botConfig.server);
  const [accountNumber, setAccountNumber] = useState(data.botConfig.accountNumber);
  const [botVersion, setBotVersion] = useState(data.botConfig.version);
  const [telegramUrl, setTelegramUrl] = useState(data.botConfig.telegramUrl);
  const [whatsappUrl, setWhatsappUrl] = useState(data.botConfig.whatsappUrl);
  const [whatsappNumber, setWhatsappNumber] = useState(data.botConfig.whatsappNumber);
  const [instagramUrl, setInstagramUrl] = useState(data.botConfig.instagramUrl);
  const [isSaved, setIsSaved] = useState(false);

  if (!isSettingsOpen || !isAdmin) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateConfig({
      broker,
      server,
      accountNumber,
      version: botVersion,
      telegramUrl,
      whatsappUrl,
      whatsappNumber,
      instagramUrl,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="modal-spring-in relative w-full max-w-lg rounded-2xl bg-dark-card border border-gold-500/30 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border bg-dark-elevated">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-gold-400" />
            <h3 className="text-base font-bold text-white">
              Gold Star MT5 Engine Configuration
            </h3>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-dark-border bg-dark-base text-xs font-mono">
          <button
            onClick={() => setActiveTab('mt5')}
            className={`flex-1 py-3 text-center font-bold transition-all border-b-2 ${
              activeTab === 'mt5'
                ? 'border-gold-500 text-gold-400 bg-dark-elevated/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. MT5 Real Connection
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-3 text-center font-bold transition-all border-b-2 ${
              activeTab === 'social'
                ? 'border-gold-500 text-gold-400 bg-dark-elevated/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Contact & Social Links
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {activeTab === 'mt5' ? (
            <div className="space-y-4 font-mono">
              <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-300 text-[11px] leading-relaxed">
                💡 <strong>Connect Your MT5:</strong> Use our included Python bridge script (<code>mt5_bridge/mt5_bridge.py</code>) or MetaApi to stream real live ticks into <code>/api/mt5/webhook</code>.
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  MT5 Broker Name:
                </label>
                <input
                  type="text"
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-elevated border border-dark-border text-slate-200 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  MT5 Server:
                </label>
                <input
                  type="text"
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-elevated border border-dark-border text-slate-200 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Account Login / Label:
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-elevated border border-dark-border text-slate-200 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Bot Engine Version:
                </label>
                <input
                  type="text"
                  value={botVersion}
                  onChange={(e) => setBotVersion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-elevated border border-dark-border text-slate-200 focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Diagnostic Test Actions */}
              <div className="pt-3 border-t border-dark-border space-y-2">
                <span className="text-slate-400 text-[11px] uppercase block font-semibold">
                  Test Connection States:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={simulateDisconnect}
                    className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PowerOff className="w-3.5 h-3.5" />
                    <span>Simulate Offline Banner</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetToDemo}
                    className="p-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restore Live Stream</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 font-mono">
              <div className="p-3 rounded-xl bg-dark-elevated border border-dark-border text-slate-300 text-[11px] leading-relaxed">
                Configure your real social handles below. All buttons across the dashboard and sticky mobile bar update instantly!
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#229ED9]" />
                  Telegram Link:
                </label>
                <input
                  type="text"
                  placeholder="https://t.me/YourUsername"
                  value={telegramUrl}
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-elevated border border-dark-border text-slate-200 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  WhatsApp Direct Link:
                </label>
                <input
                  type="text"
                  placeholder="https://wa.me/YOUR_PHONE_NUMBER?text=..."
                  value={whatsappUrl}
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-elevated border border-dark-border text-slate-200 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  WhatsApp Contact Number:
                </label>
                <input
                  type="text"
                  placeholder="+CountryCode Number (e.g. +91XXXXXXXXXX)"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-elevated border border-dark-border text-slate-200 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  Instagram Link:
                </label>
                <input
                  type="text"
                  placeholder="https://instagram.com/YourPage"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-elevated border border-dark-border text-slate-200 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-dark-border flex items-center justify-between">
            <span className="text-[11px] text-emerald-400 font-mono">
              {isSaved && '✓ Configuration Saved!'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-3 py-2 rounded-lg bg-dark-elevated hover:bg-dark-hover border border-dark-border text-slate-300 font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-base font-bold shadow-gold-subtle"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
