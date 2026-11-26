'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, MessageCircle, Sparkles } from 'lucide-react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MSG: Msg = {
  role: 'assistant',
  content:
    'Hello! I am Gold Star AI, working under Gold Star. Ask me about our Breakout Strategy, max SL per order, live MT5 performance, or contact owner Abhishek on WhatsApp (+91 9963303115). మీరు తెలుగులో కూడా మాట్లాడవచ్చు.',
};

const QUICK_PROMPTS = [
  'What strategy & max SL?',
  'Show live MT5 performance',
  'Contact Abhishek',
  'తెలుగులో వివరించండి',
];

export function GoldStarChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const nextMessages: Msg[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const json = await res.json();
      if (json.success && json.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: json.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              `Gold Star AI is temporarily unavailable (${json.error || 'gateway error'}). You can message owner Abhishek directly on WhatsApp: +91 9963303115.`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Network error reaching Gold Star AI. Please message Abhishek directly on WhatsApp: +91 9963303115.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button (positioned above mobile bottom dock) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Gold Star AI Chat"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-base font-extrabold text-xs uppercase tracking-wider shadow-gold-glow transition-all hover:scale-105 btn-sheen"
        >
          <Bot className="w-4 h-4" />
          <span>Gold Star AI</span>
        </button>
      )}

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-3 left-3 sm:left-auto sm:bottom-6 sm:right-6 sm:w-96 z-50 rounded-3xl bg-dark-card border border-gold-500/40 shadow-2xl flex flex-col overflow-hidden max-h-[75vh] page-enter">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-dark-elevated border-b border-dark-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gold-500/15 border border-gold-500/40 flex items-center justify-center text-gold-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white leading-tight">Gold Star AI</div>
                <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Official Gold Star Assistant</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <a
                href="https://wa.me/919963303115?text=Hi%20Abhishek%2C%20I%20have%20a%20question%20about%20Gold%20Star%20MT5%20Bot."
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp Abhishek (+91 9963303115)"
                className="p-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-gold-500 text-dark-base font-semibold rounded-br-sm'
                      : 'bg-dark-elevated border border-dark-border text-slate-200 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-3.5 py-2 rounded-2xl bg-dark-elevated border border-dark-border text-gold-300 font-mono text-[11px] animate-pulse">
                  Gold Star AI is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 border-t border-dark-border/60 flex items-center gap-1.5 overflow-x-auto bg-dark-base/50">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-dark-elevated hover:bg-dark-hover border border-gold-500/25 text-[10px] font-mono text-gold-300 whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-2.5 border-t border-dark-border bg-dark-elevated flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Gold Star AI (English / తెలుగు)..."
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-dark-base border border-dark-border text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-gold-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-base font-bold transition-colors disabled:opacity-40 shrink-0"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
