'use client'

import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, Sparkles } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: 'blue' | 'yellow' | 'green' | 'purple' | 'cyan'
  delay?: number
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'gradient' | 'glass' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  subtitle?: string
  showSparkle?: boolean
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = 'blue',
  delay = 0,
  trend,
  variant = 'default',
  size = 'md',
  subtitle,
  showSparkle = false,
}: StatCardProps) {
  const colorConfig: Record<string, { accent: string; iconBg: string; iconText: string }> = {
    blue: { accent: '#3B82F6', iconBg: 'rgba(59, 130, 246, 0.15)', iconText: '#3B82F6' },
    yellow: { accent: '#FACC15', iconBg: 'rgba(250, 204, 21, 0.15)', iconText: '#FACC15' },
    green: { accent: '#10B981', iconBg: 'rgba(16, 185, 129, 0.15)', iconText: '#10B981' },
    purple: { accent: '#8B5CF6', iconBg: 'rgba(139, 92, 246, 0.15)', iconText: '#8B5CF6' },
    cyan: { accent: '#06B6D4', iconBg: 'rgba(6, 182, 212, 0.15)', iconText: '#06B6D4' },
  }

  const sizeConfig: Record<string, { padding: string; iconPadding: string; iconSize: number; labelSize: string; valueSize: string }> = {
    sm: { padding: '16px', iconPadding: '10px', iconSize: 18, labelSize: '12px', valueSize: '20px' },
    md: { padding: '20px', iconPadding: '14px', iconSize: 22, labelSize: '14px', valueSize: '24px' },
    lg: { padding: '24px', iconPadding: '16px', iconSize: 26, labelSize: '16px', valueSize: '28px' },
  }

  const colors = colorConfig[color]
  const sizes = sizeConfig[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -4, scale: 1.02 }}
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
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`,
        }}
      />

      {/* Sparkle indicator */}
      {showSparkle && (
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <Sparkles size={14} style={{ color: '#FACC15' }} />
        </div>
      )}

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Icon */}
        <div
          style={{
            padding: sizes.iconPadding,
            borderRadius: '12px',
            marginBottom: '12px',
            backgroundColor: colors.iconBg,
          }}
        >
          <Icon size={sizes.iconSize} style={{ color: colors.iconText }} />
        </div>

        {/* Label */}
        <p
          style={{
            fontSize: sizes.labelSize,
            fontWeight: 500,
            color: '#A0A0B0',
            marginBottom: '8px',
            margin: 0,
          }}
        >
          {label}
        </p>

        {/* Value */}
        <p
          style={{
            fontSize: sizes.valueSize,
            fontWeight: 700,
            color: '#FFFFFF',
            margin: 0,
          }}
        >
          {value}
        </p>

        {/* Subtitle */}
        {subtitle && (
          <p style={{ fontSize: '12px', color: '#6B6B7B', marginTop: '4px', margin: 0 }}>{subtitle}</p>
        )}

        {/* Trend indicator */}
        {trend && (
          <div
            style={{
              marginTop: '12px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: trend.isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: trend.isPositive ? '#10B981' : '#EF4444',
              border: `1px solid ${trend.isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            }}
          >
            {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
    </motion.div>
  )
}
