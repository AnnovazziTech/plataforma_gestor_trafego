import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'TrafficPro - Gestão de Tráfego Pago'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A0A0F 0%, #12121A 50%, #0D0D14 100%)',
        }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
          {/* Icon */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '32px',
              background: 'linear-gradient(135deg, #00F5FF, #BF00FF, #FF00E5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 40px rgba(191, 0, 255, 0.4)',
            }}
          >
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {/* Text */}
          <div style={{ display: 'flex', fontSize: '80px', fontWeight: 800 }}>
            <span style={{ color: '#FFFFFF' }}>Traffic</span>
            <span style={{ color: '#A855F7' }}>Pro</span>
          </div>
        </div>
        {/* Subtitle */}
        <div style={{ fontSize: '28px', color: '#6B6B7B', fontWeight: 500 }}>
          Plataforma completa para gestao de trafego pago
        </div>
      </div>
    ),
    { ...size }
  )
}
