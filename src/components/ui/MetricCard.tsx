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
  color?: 'cyan' | 'purple' | 'pink' | 'green' | 'orange' | 'blue'
  delay?: number
}

export function MetricCard({
  title,
  value,
  previousValue,
  format = 'number',
  icon,
  color = 'cyan',
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
    cyan: 'from-[#00F5FF]/20 to-transparent border-[#00F5FF]/20 hover:border-[#00F5FF]/40',
    purple: 'from-[#BF00FF]/20 to-transparent border-[#BF00FF]/20 hover:border-[#BF00FF]/40',
    pink: 'from-[#FF00E5]/20 to-transparent border-[#FF00E5]/20 hover:border-[#FF00E5]/40',
    green: 'from-[#00FF88]/20 to-transparent border-[#00FF88]/20 hover:border-[#00FF88]/40',
    orange: 'from-[#FF6B00]/20 to-transparent border-[#FF6B00]/20 hover:border-[#FF6B00]/40',
    blue: 'from-[#0066FF]/20 to-transparent border-[#0066FF]/20 hover:border-[#0066FF]/40',
  }

  const iconColors = {
    cyan: 'text-[#00F5FF]',
    purple: 'text-[#BF00FF]',
    pink: 'text-[#FF00E5]',
    green: 'text-[#00FF88]',
    orange: 'text-[#FF6B00]',
    blue: 'text-[#0066FF]',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        'relative p-4 rounded-xl bg-gradient-to-br border backdrop-blur-xl overflow-hidden group',
        colorClasses[color]
      )}
    >
      {/* Background glow effect */}
      <div className={cn(
        'absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity',
        color === 'cyan' && 'bg-[#00F5FF]',
        color === 'purple' && 'bg-[#BF00FF]',
        color === 'pink' && 'bg-[#FF00E5]',
        color === 'green' && 'bg-[#00FF88]',
        color === 'orange' && 'bg-[#FF6B00]',
        color === 'blue' && 'bg-[#0066FF]',
      )} />

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#A0A0B0] font-medium truncate">{title}</span>
          {icon && <span className={cn('p-1.5 rounded-lg bg-white/5', iconColors[color])}>{icon}</span>}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className="text-xl font-bold text-white mb-1"
        >
          {formatValue(value)}
        </motion.div>

        {previousValue !== undefined && (
          <div className="flex items-center gap-1">
            <span className={cn(
              'flex items-center gap-0.5 text-xs font-medium',
              isPositive && 'text-[#00FF88]',
              isNegative && 'text-red-400',
              !isPositive && !isNegative && 'text-[#A0A0B0]'
            )}>
              {isPositive && <TrendingUp size={12} />}
              {isNegative && <TrendingDown size={12} />}
              {!isPositive && !isNegative && <Minus size={12} />}
              {Math.abs(percentChange).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
