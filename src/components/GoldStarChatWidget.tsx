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
    'Hello! I am **Gold Star AI**, working under **Gold Star**. Ask me about our **Breakout Strategy**, max SL per order, live MT5 performance, or contact owner **Abhishek** on WhatsApp (+91 9963303115). మీరు తెలుగులో కూడా మాట్లాడవచ్చు.',
};

const QUICK_PROMPTS = [
  'What strategy & max SL?',
  'Show live MT5 performance',
  'Contact Abhishek',
  'తెలుగులో వివరించండి',
];

/** Render inline **bold** and https:// links safely without extra dependencies */
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-400 underline underline-offset-2 hover:text-gold-300 break-all"
        >
          {part}
        </a>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function isTableRow(line: string): boolean {
  const t = line.trim();
  return t.startsWith('|') && t.endsWith('|') && t.length > 2;
}

function isTableSeparator(line: string): boolean {
  const t = line.trim();
  return /^\|[\s:|-]+\|$/.test(t) && t.includes('-');
}

function parseCells(line: string): string[] {
  return line
    .trim()
    .slice(1, -1)
    .split('|')
    .map((c) => c.trim());
}

/** Cleanly renders Markdown tables as styled HTML tables, plus bullets, headings, and bold text */
function FormattedChatMessage({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Markdown table block
    if (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = parseCells(line);
      i += 2; // skip header & separator
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        if (!isTableSeparator(lines[i])) {
          rows.push(parseCells(lines[i]));
        }
        i++;
      }

      blocks.push(
        <div
          key={`tbl-${i}`}
          className="my-2 overflow-x-auto rounded-xl border border-gold-500/25 bg-dark-base/80"
        >
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-gold-500/15 border-b border-gold-500/25 text-gold-300">
                {headers.map((h, hi) => (
                  <th key={hi} className="px-2.5 py-1.5 font-bold uppercase tracking-wider">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/60">
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 1 ? 'bg-dark-elevated/40' : ''}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-2.5 py-1.5 ${
                        ci === row.length - 1 ? 'font-mono text-slate-100' : 'text-slate-300'
                      }`}
                    >
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Bullet list item
    const bulletMatch = line.match(/^\s*[-*•]\s+(.+)$/);
    if (bulletMatch) {
      blocks.push(
        <div key={`bul-${i}`} className="flex items-start gap-2 pl-1 my-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-1.5 shrink-0" />
          <span className="flex-1">{renderInline(bulletMatch[1])}</span>
        </div>
      );
      i++;
      continue;
    }

    // Heading (### / ##)
    const headingMatch = line.match(/^\s*#{1,4}\s+(.+)$/);
    if (headingMatch) {
      blocks.push(
        <div key={`hd-${i}`} className="font-bold text-gold-300 text-xs mt-1.5 mb-0.5">
          {renderInline(headingMatch[1])}
        </div>
      );
      i++;
      continue;
    }

    // Empty line spacing
    if (!line.trim()) {
      blocks.push(<div key={`sp-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    // Regular paragraph line
    blocks.push(
      <div key={`p-${i}`} className="leading-relaxed">
        {renderInline(line)}
      </div>
    );
    i++;
  }

  return <div className="space-y-0.5">{blocks}</div>;
}

export function GoldStarChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('open-goldstar-ai', handleOpen);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('open-goldstar-ai', handleOpen);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

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
            content: json.blocked
              ? json.error
              : `Gold Star AI is temporarily unavailable (${json.error || 'gateway error'}). You can message owner Abhishek directly on WhatsApp: +91 9963303115.`,
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
      {/* Subtle floating quick-launcher on desktop bottom-right (primary button is in Header) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Gold Star AI Chat"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-base font-extrabold text-xs uppercase tracking-wider shadow-gold-glow transition-all hover:scale-105"
        >
          <Bot className="w-4 h-4" />
          <span>Gold Star AI</span>
        </button>
      )}

      {/* Docked Right-Side Panel (Desktop) / Centered Sheet (Mobile) */}
      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 sm:hidden"
            aria-hidden="true"
          />
          <div className="fixed inset-x-3 top-16 bottom-20 sm:inset-x-auto sm:top-20 sm:bottom-6 sm:right-6 sm:w-[440px] z-50 rounded-3xl bg-dark-card border border-gold-500/40 shadow-2xl flex flex-col overflow-hidden page-enter">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-dark-elevated border-b border-dark-border shrink-0">
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
                  href="https://t.me/Chinna119"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Telegram DM (@Chinna119)"
                  className="p-1.5 rounded-lg bg-[#229ED9]/15 hover:bg-[#229ED9]/25 border border-[#229ED9]/40 text-[#229ED9] transition-colors"
                >
                  <Send className="w-4 h-4" />
                </a>
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
                    className={`max-w-[90%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-gold-500 text-dark-base font-semibold rounded-br-sm whitespace-pre-wrap'
                        : 'bg-dark-elevated border border-dark-border text-slate-200 rounded-bl-sm'
                    }`}
                  >
                    {m.role === 'user' ? m.content : <FormattedChatMessage content={m.content} />}
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
            <div className="px-3 py-2 border-t border-dark-border/60 flex flex-wrap items-center gap-1.5 bg-dark-base/50 shrink-0">
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
              className="p-2.5 border-t border-dark-border bg-dark-elevated flex items-center gap-2 shrink-0"
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
        </>
      )}
    </>
  );
}
