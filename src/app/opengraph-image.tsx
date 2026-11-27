import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Gold Star MT5 — Live Institutional XAUUSD Breakout Bot';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(135deg, #07080B 0%, #0F131C 60%, #171B26 100%)',
          color: '#F8FAFC',
          fontFamily: 'sans-serif',
          border: '2px solid rgba(212, 175, 55, 0.35)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(250, 204, 21, 0.14)',
              border: '2px solid rgba(250, 204, 21, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
              color: '#FACC15',
            }}
          >
            ★
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.02em', color: '#FACC15' }}>
              GOLD STAR MT5
            </span>
            <span style={{ fontSize: 18, color: '#94A3B8' }}>
              Vantage Markets • XAUUSD Live Telemetry
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em' }}>
            Verified Algorithmic Gold Trading.
          </div>
          <div style={{ fontSize: 24, color: '#CBD5E1', maxWidth: 920 }}>
            Real-time MT5 balance, equity curve, Breakout Strategy with strict Stop Loss per order, and zero martingale.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {['Breakout Strategy', 'Strict Max SL / Order', 'Zero Martingale', 'Live MT5 Feed'].map((pill) => (
            <div
              key={pill}
              style={{
                padding: '10px 20px',
                borderRadius: 999,
                background: 'rgba(250, 204, 21, 0.12)',
                border: '1px solid rgba(250, 204, 21, 0.4)',
                color: '#FDE047',
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {pill}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
