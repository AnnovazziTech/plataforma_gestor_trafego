'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: 'blue' | 'yellow'
  delay?: number
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = 'blue',
  delay = 0,
  trend,
}: StatCardProps) {
  const colorClasses = {
    blue: {
      icon: 'bg-[#3B82F6]/10 text-[#3B82F6]',
      border: 'hover:border-[#3B82F6]/30',
      glow: 'bg-[#3B82F6]',
    },
    yellow: {
      icon: 'bg-[#FACC15]/10 text-[#FACC15]',
      border: 'hover:border-[#FACC15]/30',
      glow: 'bg-[#FACC15]',
    },
  }

  const colors = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2 }}
      className={cn(
        'relative p-5 rounded-xl bg-gradient-to-br from-[#12121A] to-[#0D0D14] border border-white/10 transition-all overflow-hidden group',
        colors.border
      )}
    >
      {/* Background glow */}
      <div className={cn(
        'absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none',
        colors.glow
      )} />

      <div className="relative flex flex-col items-center text-center">
        {/* Icon */}
        <div className={cn(
          'p-3.5 rounded-xl mb-3 transition-transform group-hover:scale-105',
          colors.icon
        )}>
          <Icon size={22} />
        </div>

        {/* Label */}
        <p className="text-sm text-[#A0A0B0] mb-2 font-medium">{label}</p>

        {/* Value */}
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.1 }}
          className="text-2xl font-bold text-white"
        >
          {value}
        </motion.p>

        {/* Trend indicator */}
        {trend && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.2 }}
            className={cn(
              'mt-2 px-2 py-0.5 rounded-full text-xs font-medium',
              trend.isPositive
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            )}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
