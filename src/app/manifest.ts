import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gold Star MT5 — Live Institutional Gold Bot',
    short_name: 'Gold Star MT5',
    description:
      'Live real-time performance telemetry for Gold Star MT5 XAUUSD Breakout Strategy. Verified investor access and strict SL risk controls.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07080B',
    theme_color: '#D4AF37',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
