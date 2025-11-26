'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      success: 'bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/20',
      warning: 'bg-[#FFE500]/15 text-[#FFE500] border-[#FFE500]/20',
      error: 'bg-red-500/15 text-red-400 border-red-500/20',
      info: 'bg-[#00F5FF]/15 text-[#00F5FF] border-[#00F5FF]/20',
      default: 'bg-white/10 text-[#A0A0B0] border-white/10',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border',
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
