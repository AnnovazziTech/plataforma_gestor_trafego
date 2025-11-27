'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      warning: 'bg-[#FACC15]/15 text-[#FACC15] border-[#FACC15]/20',
      error: 'bg-red-500/15 text-red-400 border-red-500/20',
      info: 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/20',
      default: 'bg-white/10 text-[#A0A0B0] border-white/10',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border',
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
