'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight } from 'lucide-react'

interface ROICardProps {
  source: string
  invested: number
  revenue: number
  roi: number
  conversions?: number
  delay?: number
  variant?: 'default' | 'compact' | 'featured'
  showTrend?: boolean
  previousRoi?: number
}

export function ROICard({
  source,
  invested,
  revenue,
  roi,
  conversions,
  delay = 0,
  variant = 'default',
  showTrend = false,
  previousRoi,
}: ROICardProps) {
  const profit = revenue - invested
  const isProfit = profit > 0
  const roiChange = previousRoi ? ((roi - previousRoi) / previousRoi) * 100 : 0
  const isRoiUp = roiChange > 0

  const getRoiColor = () => {
    if (roi >= 300) return { bg: '#10B981', text: '#10B981' }
    if (roi >= 200) return { bg: '#3B82F6', text: '#3B82F6' }
    if (roi >= 100) return { bg: '#FACC15', text: '#FACC15' }
    return { bg: '#EF4444', text: '#EF4444' }
  }

  const roiColors = getRoiColor()

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ scale: 1.02 }}
        style={{
          padding: '12px',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#FFFFFF' }}>{source}</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: roiColors.text }}>{roi}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#6B6B7B' }}>
          <span>R$ {invested.toLocaleString('pt-BR')}</span>
          <span style={{ color: '#10B981' }}>R$ {revenue.toLocaleString('pt-BR')}</span>
        </div>
      </motion.div>
    )
  }

  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: 'spring', stiffness: 100 }}
        whileHover={{ y: -4, scale: 1.02 }}
        style={{
          position: 'relative',
          padding: '24px',
          borderRadius: '16px',
          background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Top accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: roiColors.bg,
          }}
        />

        <div style={{ position: 'relative' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0, marginBottom: '4px' }}>{source}</h3>
              {showTrend && previousRoi && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: isRoiUp ? '#10B981' : '#EF4444',
                  }}
                >
                  {isRoiUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {isRoiUp ? '+' : ''}{roiChange.toFixed(1)}% vs anterior
                </div>
              )}
            </div>
            <div
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                textAlign: 'center',
                backgroundColor: `${roiColors.bg}15`,
              }}
            >
              <p style={{ fontSize: '24px', fontWeight: 700, color: roiColors.text, margin: 0 }}>{roi}%</p>
              <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>ROI</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <DollarSign size={14} style={{ color: '#FACC15' }} />
                <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Investido</span>
              </div>
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#FACC15', margin: 0 }}>
                R$ {invested.toLocaleString('pt-BR')}
              </p>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ArrowUpRight size={14} style={{ color: '#10B981' }} />
                <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Receita</span>
              </div>
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#10B981', margin: 0 }}>
                R$ {revenue.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Bottom Stats */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  backgroundColor: isProfit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                }}
              >
                {isProfit ? (
                  <TrendingUp size={14} style={{ color: '#10B981' }} />
                ) : (
                  <TrendingDown size={14} style={{ color: '#EF4444' }} />
                )}
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Lucro/Prejuizo</p>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isProfit ? '#10B981' : '#EF4444',
                    margin: 0,
                  }}
                >
                  {isProfit ? '+' : ''}R$ {profit.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            {conversions !== undefined && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Conversoes</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{conversions}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -3, scale: 1.01 }}
      style={{
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px', margin: 0 }}>{source}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: '#6B6B7B' }}>Investido</span>
          <span style={{ color: '#FACC15', fontWeight: 500 }}>R$ {invested.toLocaleString('pt-BR')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: '#6B6B7B' }}>Receita</span>
          <span style={{ color: '#10B981', fontWeight: 500 }}>R$ {revenue.toLocaleString('pt-BR')}</span>
        </div>
        {conversions !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#6B6B7B' }}>Conversoes</span>
            <span style={{ color: '#FFFFFF', fontWeight: 500 }}>{conversions}</span>
          </div>
        )}
        <div
          style={{
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '12px', color: '#6B6B7B' }}>ROI</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showTrend && previousRoi && (
              <span
                style={{
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  color: isRoiUp ? '#10B981' : '#EF4444',
                }}
              >
                {isRoiUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(roiChange).toFixed(0)}%
              </span>
            )}
            <span style={{ fontSize: '18px', fontWeight: 700, color: roiColors.text }}>{roi}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Component for displaying multiple ROI cards in a grid
interface ROIGridProps {
  data: Array<{
    source: string
    invested: number
    revenue: number
    roi: number
    conversions?: number
    previousRoi?: number
  }>
  variant?: 'default' | 'compact' | 'featured'
  columns?: 2 | 3 | 4
  showTrend?: boolean
}

export function ROIGrid({
  data,
  variant = 'default',
  columns = 4,
  showTrend = false,
}: ROIGridProps) {
  const gridTemplateColumns: Record<number, string> = {
    2: 'repeat(2, 1fr)',
    3: 'repeat(3, 1fr)',
    4: 'repeat(4, 1fr)',
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: gridTemplateColumns[columns],
        gap: '16px',
      }}
    >
      {data.map((item, index) => (
        <ROICard
          key={item.source}
          {...item}
          variant={variant}
          delay={index * 0.1}
          showTrend={showTrend}
        />
      ))}
    </div>
  )
}
