import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { TradingDataProvider } from '@/context/TradingDataContext';
import { AuthProvider } from '@/context/AuthContext';
import { AOSProvider } from '@/components/AOSProvider';
import { ScrollProgressBar } from '@/components/ScrollProgressBar';
import { GoldStarChatWidget } from '@/components/GoldStarChatWidget';

export const metadata: Metadata = {
  title: 'Gold Star - MT5 Bot Live Performance Dashboard',
  description:
    'Live real-time performance telemetry for Gold Star MT5 institutional gold trading bot. Verified read-only investor access, zero martingale, audited trade records.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-dark-base text-slate-100 min-h-screen selection:bg-gold-500 selection:text-dark-base">
        <AuthProvider>
          <LanguageProvider>
            <TradingDataProvider>
              <AOSProvider>
                <ScrollProgressBar />
                {children}
                <GoldStarChatWidget />
              </AOSProvider>
            </TradingDataProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
