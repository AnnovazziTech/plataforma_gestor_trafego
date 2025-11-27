'use client'

import { motion } from 'framer-motion'
import { cn, formatCurrency, formatNumber, formatPercent, getPercentageChange } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  previousValue?: number
  format?: 'currency' | 'number' | 'percent' | 'compact'
  icon?: React.ReactNode
  color?: 'blue' | 'yellow'
  delay?: number
  size?: 'default' | 'large'
  showSparkle?: boolean
  subtitle?: string
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
}: MetricCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percent':
        return formatPercent(val)
      case 'compact':
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
        return formatNumber(val)
      default:
        return formatNumber(val)
    }
  }

  const percentChange = previousValue ? getPercentageChange(value, previousValue) : 0
  const isPositive = percentChange > 0
  const isNegative = percentChange < 0

  const colorClasses = {
    blue: 'border-[#3B82F6]/20 hover:border-[#3B82F6]/40',
    yellow: 'border-[#FACC15]/20 hover:border-[#FACC15]/40',
  }

  const iconColors = {
    blue: 'text-[#3B82F6] bg-[#3B82F6]/10',
    yellow: 'text-[#FACC15] bg-[#FACC15]/10',
  }

  const glowColors = {
    blue: 'bg-[#3B82F6]',
    yellow: 'bg-[#FACC15]',
  }

  const accentColors = {
    blue: 'from-[#3B82F6]/20 to-transparent',
    yellow: 'from-[#FACC15]/20 to-transparent',
  }

  const isLarge = size === 'large'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'relative rounded-2xl bg-gradient-to-br from-[#12121A] to-[#0D0D14] border overflow-hidden group',
        colorClasses[color]
      )}
    >
      {/* Background glow effect */}
      <div className={cn(
        'absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none',
        glowColors[color],
      )} />

      {/* Top accent line */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
        accentColors[color],
      )} />

      {/* Content */}
      <div className={cn(
        'relative h-full flex flex-col items-center text-center',
        isLarge ? 'px-8 py-7' : 'px-6 py-5'
      )}>
        {/* Sparkle indicator for highlighted metrics */}
        {showSparkle && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.3 }}
            className="absolute top-3 right-3"
          >
            <Sparkles size={16} className="text-[#FACC15]" />
          </motion.div>
        )}

        {/* Icon */}
        {icon && (
          <div className={cn(
            'rounded-xl flex items-center justify-center mb-3',
            iconColors[color],
            isLarge ? 'w-14 h-14' : 'w-12 h-12'
          )}>
            {icon}
          </div>
        )}

        {/* Title */}
        <span className={cn(
          'text-[#A0A0B0] font-medium mb-2',
          isLarge ? 'text-base' : 'text-sm'
        )}>
          {title}
        </span>

        {/* Value */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className={cn(
            'font-bold text-white tracking-tight',
            isLarge ? 'text-4xl' : 'text-[28px]'
          )}
        >
          {formatValue(value)}
        </motion.div>

        {/* Subtitle */}
        {subtitle && (
          <span className="text-xs text-[#6B6B7B] mt-1">{subtitle}</span>
        )}

        {/* Change indicator */}
        {previousValue !== undefined && (
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/5 w-full">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.4 }}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
                isPositive && 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
                isNegative && 'bg-red-500/15 text-red-400 border border-red-500/20',
                !isPositive && !isNegative && 'bg-white/5 text-[#6B6B7B] border border-white/10'
              )}
            >
              {isPositive && <TrendingUp size={14} />}
              {isNegative && <TrendingDown size={14} />}
              {!isPositive && !isNegative && <Minus size={14} />}
              {isPositive && '+'}{Math.abs(percentChange).toFixed(1)}%
            </motion.span>
            <span className="text-xs text-[#6B6B7B]">vs período anterior</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
