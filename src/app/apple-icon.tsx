import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #07080B 0%, #141821 100%)',
          borderRadius: 38,
          border: '4px solid rgba(212, 175, 55, 0.5)',
          color: '#FACC15',
          fontSize: 88,
          fontWeight: 900,
        }}
      >
        ★
      </div>
    ),
    { ...size }
  );
}
