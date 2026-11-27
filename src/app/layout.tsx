import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { TradingDataProvider } from '@/context/TradingDataContext';
import { AuthProvider } from '@/context/AuthContext';
import { AOSProvider } from '@/components/AOSProvider';
import { ScrollProgressBar } from '@/components/ScrollProgressBar';
import { GoldStarChatWidget } from '@/components/GoldStarChatWidget';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const SITE_URL = 'https://gold-star-mt5-vps.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Gold Star - MT5 Bot Live Performance Dashboard',
    template: '%s | Gold Star MT5',
  },
  description:
    'Live real-time performance telemetry for Gold Star MT5 institutional gold trading bot. Verified read-only investor access, Breakout Strategy with strict Stop Loss, zero martingale.',
  keywords: [
    'Gold Star MT5',
    'XAUUSD trading bot',
    'MetaTrader 5 live dashboard',
    'Vantage Markets MT5',
    'Breakout Strategy',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Gold Star MT5',
    title: 'Gold Star - MT5 Bot Live Performance Dashboard',
    description:
      'Live XAUUSD MT5 performance telemetry. Breakout Strategy, strict Stop Loss per order, zero martingale.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gold Star - MT5 Bot Live Performance Dashboard',
    description:
      'Live XAUUSD MT5 performance telemetry. Breakout Strategy, strict Stop Loss per order, zero martingale.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#07080B',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Gold Star MT5 Algorithm',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'MetaTrader 5',
  url: SITE_URL,
  description:
    'Automated XAUUSD Breakout Strategy with strict maximum Stop Loss per order and zero martingale.',
  author: {
    '@type': 'Person',
    name: 'Abhishek',
    sameAs: ['https://t.me/Chinna119'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-dark-base text-slate-100 min-h-screen font-sans selection:bg-gold-500 selection:text-dark-base">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-gold-500 focus:text-dark-base focus:font-bold focus:text-xs"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
