'use client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const iconSizes = { sm: 32, md: 40, lg: 56 }
  const textSizes = { sm: '18px', md: '22px', lg: '28px' }
  const iconPx = iconSizes[size]
  const fontSize = textSizes[size]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size === 'lg' ? '14px' : '10px' }}>
      <img
        src="/logo.svg"
        alt="TrafficPro"
        style={{
          width: `${iconPx}px`,
          height: `${iconPx}px`,
          borderRadius: size === 'lg' ? '16px' : '12px',
          flexShrink: 0,
        }}
      />
      {showText && (
        <span style={{ fontSize, fontWeight: 800, lineHeight: 1, whiteSpace: 'nowrap' }}>
          <span style={{ color: '#FFFFFF' }}>Traffic</span>
          <span style={{
            background: 'linear-gradient(135deg, #C084FC, #9333EA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Pro</span>
        </span>
      )}
    </div>
  )
}
