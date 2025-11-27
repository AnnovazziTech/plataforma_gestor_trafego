'use client'

import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref' | 'children'> {
  variant?: 'default' | 'glass' | 'gradient' | 'elevated' | 'outlined'
  hover?: boolean
  accentColor?: 'blue' | 'yellow' | 'green' | 'red' | 'none'
  showAccentLine?: boolean
  size?: 'sm' | 'default' | 'lg'
  children?: ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    hover = true,
    accentColor = 'none',
    showAccentLine = false,
    size = 'default',
    children,
    ...props
  }, ref) => {
    const variants = {
      default: 'bg-[#12121A]/80 border border-white/5',
      glass: 'glass-strong backdrop-blur-xl bg-white/5 border border-white/10',
      gradient: 'bg-gradient-to-br from-[#12121A] to-[#0D0D14] border border-white/10',
      elevated: 'bg-[#12121A] border border-white/5 shadow-xl shadow-black/20',
      outlined: 'bg-transparent border-2 border-white/10',
    }

    const accentColors = {
      blue: 'from-[#3B82F6] to-[#60A5FA]',
      yellow: 'from-[#FACC15] to-[#FDE047]',
      green: 'from-emerald-500 to-emerald-400',
      red: 'from-red-500 to-red-400',
      none: '',
    }

    const hoverAccentColors = {
      blue: 'hover:border-[#3B82F6]/30',
      yellow: 'hover:border-[#FACC15]/30',
      green: 'hover:border-emerald-500/30',
      red: 'hover:border-red-500/30',
      none: 'hover:border-[#3B82F6]/20',
    }

    const sizeClasses = {
      sm: 'rounded-xl p-4',
      default: 'rounded-2xl p-6',
      lg: 'rounded-2xl p-8',
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={hover ? { y: -2, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' } : undefined}
        className={cn(
          'relative transition-all duration-300 overflow-hidden group',
          sizeClasses[size],
          variants[variant],
          hover && hoverAccentColors[accentColor],
          className
        )}
        {...props}
      >
        {/* Accent line at top */}
        {showAccentLine && accentColor !== 'none' && (
          <div className={cn(
            'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-80 group-hover:opacity-100 transition-opacity',
            accentColors[accentColor]
          )} />
        )}

        {/* Background glow on hover */}
        {hover && accentColor !== 'none' && (
          <div className={cn(
            'absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none',
            accentColor === 'blue' && 'bg-[#3B82F6]',
            accentColor === 'yellow' && 'bg-[#FACC15]',
            accentColor === 'green' && 'bg-emerald-500',
            accentColor === 'red' && 'bg-red-500'
          )} />
        )}

        <div className="relative">
          {children}
        </div>
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  action?: ReactNode
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, icon, action, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center justify-between mb-5', className)} {...props}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2.5 rounded-xl bg-white/5">
            {icon}
          </div>
        )}
        <div>{children}</div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold text-white', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-[#6B6B7B] mt-1', className)} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, bordered = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between mt-4 pt-4',
        bordered && 'border-t border-white/5',
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
