'use client'

import { motion } from 'framer-motion'
import { cn, formatCurrency, formatNumber, formatPercent, getPercentageChange } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  previousValue?: number
  format?: 'currency' | 'number' | 'percent' | 'compact'
  icon?: React.ReactNode
  color?: 'blue' | 'yellow'
  delay?: number
}

export function MetricCard({
  title,
  value,
  previousValue,
  format = 'number',
  icon,
  color = 'blue',
  delay = 0,
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
    blue: 'border-[#3B82F6]/20 hover:border-[#3B82F6]/50',
    yellow: 'border-[#FACC15]/20 hover:border-[#FACC15]/50',
  }

  const iconColors = {
    blue: 'text-[#3B82F6] bg-[#3B82F6]/10',
    yellow: 'text-[#FACC15] bg-[#FACC15]/10',
  }

  const glowColors = {
    blue: 'bg-[#3B82F6]',
    yellow: 'bg-[#FACC15]',
  }

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
        'absolute -top-12 -right-12 w-28 h-28 rounded-full blur-3xl opacity-15 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none',
        glowColors[color],
      )} />

      {/* Content - layout centralizado */}
      <div className="relative px-6 py-5 h-full flex flex-col items-center text-center">
        {/* Icon no topo */}
        {icon && (
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
            iconColors[color]
          )}>
            {icon}
          </div>
        )}

        {/* Title */}
        <span className="text-sm text-[#A0A0B0] font-medium mb-2">
          {title}
        </span>

        {/* Value - centralizado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className="text-[28px] font-bold text-white tracking-tight"
        >
          {formatValue(value)}
        </motion.div>

        {/* Change indicator */}
        {previousValue !== undefined && (
          <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-white/5 w-full">
            <span className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
              isPositive && 'bg-emerald-500/10 text-emerald-400',
              isNegative && 'bg-red-500/10 text-red-400',
              !isPositive && !isNegative && 'bg-white/5 text-[#6B6B7B]'
            )}>
              {isPositive && <TrendingUp size={12} />}
              {isNegative && <TrendingDown size={12} />}
              {!isPositive && !isNegative && <Minus size={12} />}
              {Math.abs(percentChange).toFixed(1)}%
            </span>
            <span className="text-xs text-[#6B6B7B]">vs anterior</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
