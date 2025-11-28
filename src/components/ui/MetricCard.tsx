'use client'

import { motion } from 'framer-motion'
import { formatCurrency, formatNumber, formatPercent, getPercentageChange } from '@/lib/utils'
import { Sparkles, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  previousValue?: number
  format?: 'currency' | 'number' | 'percent' | 'compact' | 'multiplier'
  icon?: React.ReactNode
  color?: 'blue' | 'yellow' | 'green' | 'purple' | 'cyan' | 'orange'
  delay?: number
  size?: 'sm' | 'default' | 'large'
  showSparkle?: boolean
  subtitle?: string
  variant?: 'default' | 'gradient' | 'glass' | 'minimal' | 'featured'
  comparisonLabel?: string
  invertTrend?: boolean
}

export function MetricCard({
  title,
  value,
  previousValue,
  format = 'number',
  icon,
  color = 'blue',
  delay = 0,
  size = 'default',
  showSparkle = false,
  subtitle,
  variant = 'default',
  comparisonLabel = 'vs periodo anterior',
  invertTrend = false,
}: MetricCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percent':
        return formatPercent(val)
      case 'multiplier':
        return `${val.toFixed(2)}x`
      case 'compact':
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
        return formatNumber(val)
      default:
        return formatNumber(val)
    }
  }

  const percentChange = previousValue ? getPercentageChange(value, previousValue) : 0
  const rawIsPositive = percentChange > 0
  const rawIsNegative = percentChange < 0
  const isPositive = invertTrend ? rawIsNegative : rawIsPositive
  const isNegative = invertTrend ? rawIsPositive : rawIsNegative

  const colorConfig: Record<string, { accent: string; iconBg: string; iconText: string }> = {
    blue: { accent: '#3B82F6', iconBg: 'rgba(59, 130, 246, 0.15)', iconText: '#3B82F6' },
    yellow: { accent: '#FACC15', iconBg: 'rgba(250, 204, 21, 0.15)', iconText: '#FACC15' },
    green: { accent: '#10B981', iconBg: 'rgba(16, 185, 129, 0.15)', iconText: '#10B981' },
    purple: { accent: '#8B5CF6', iconBg: 'rgba(139, 92, 246, 0.15)', iconText: '#8B5CF6' },
    cyan: { accent: '#06B6D4', iconBg: 'rgba(6, 182, 212, 0.15)', iconText: '#06B6D4' },
    orange: { accent: '#F97316', iconBg: 'rgba(249, 115, 22, 0.15)', iconText: '#F97316' },
  }

  const sizeConfig: Record<string, { padding: string; iconSize: string; titleSize: string; valueSize: string }> = {
    sm: { padding: '16px', iconSize: '40px', titleSize: '12px', valueSize: '20px' },
    default: { padding: '20px 24px', iconSize: '48px', titleSize: '14px', valueSize: '28px' },
    large: { padding: '28px 32px', iconSize: '56px', titleSize: '16px', valueSize: '36px' },
  }

  const colors = colorConfig[color]
  const sizes = sizeConfig[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
      style={{
        position: 'relative',
        padding: sizes.padding,
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Top accent gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`,
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Sparkle indicator */}
        {showSparkle && (
          <div style={{ position: 'absolute', top: '-4px', right: '-4px' }}>
            <Sparkles size={16} style={{ color: '#FACC15' }} />
          </div>
        )}

        {/* Icon */}
        {icon && (
          <div
            style={{
              width: sizes.iconSize,
              height: sizes.iconSize,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              backgroundColor: colors.iconBg,
              color: colors.iconText,
            }}
          >
            {icon}
          </div>
        )}

        {/* Title */}
        <span
          style={{
            fontSize: sizes.titleSize,
            fontWeight: 500,
            color: '#A0A0B0',
            marginBottom: '8px',
          }}
        >
          {title}
        </span>

        {/* Value */}
        <div
          style={{
            fontSize: sizes.valueSize,
            fontWeight: 700,
            color: '#FFFFFF',
          }}
        >
          {formatValue(value)}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <span
            style={{
              fontSize: '12px',
              color: '#6B6B7B',
              marginTop: '4px',
            }}
          >
            {subtitle}
          </span>
        )}

        {/* Change indicator */}
        {previousValue !== undefined && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              width: '100%',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.15)' : isNegative ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: isPositive ? '#10B981' : isNegative ? '#EF4444' : '#6B6B7B',
                border: `1px solid ${isPositive ? 'rgba(16, 185, 129, 0.25)' : isNegative ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.1)'}`,
              }}
            >
              {isPositive && <ArrowUpRight size={14} />}
              {isNegative && <ArrowDownRight size={14} />}
              {!isPositive && !isNegative && <Minus size={14} />}
              {rawIsPositive && '+'}{Math.abs(percentChange).toFixed(1)}%
            </span>
            <span style={{ fontSize: '12px', color: '#6B6B7B' }}>{comparisonLabel}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
