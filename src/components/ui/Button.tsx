'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'yellow'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:-translate-y-0.5',
      secondary: 'border border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#3B82F6]/10 hover:border-[#3B82F6]',
      ghost: 'text-[#A0A0B0] hover:text-white hover:bg-white/5',
      danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-[0_0_30px_rgba(255,68,68,0.4)]',
      yellow: 'bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-[#0A0A0F] hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] hover:-translate-y-0.5',
    }

    const sizes = {
      sm: 'h-9 px-4 text-sm rounded-lg gap-1.5',
      md: 'h-10 px-5 text-sm rounded-xl gap-2',
      lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Carregando...</span>
          </>
        ) : children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
