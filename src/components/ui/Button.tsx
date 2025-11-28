'use client'

import { forwardRef, CSSProperties } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'style'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'yellow'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  style?: CSSProperties
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, style, ...props }, ref) => {
    const variantStyles: Record<string, CSSProperties> = {
      primary: {
        background: 'linear-gradient(to right, #3B82F6, #1D4ED8)',
        color: '#FFFFFF',
        border: 'none',
      },
      secondary: {
        background: 'transparent',
        color: '#3B82F6',
        border: '1px solid rgba(59, 130, 246, 0.3)',
      },
      ghost: {
        background: 'transparent',
        color: '#A0A0B0',
        border: 'none',
      },
      danger: {
        background: 'linear-gradient(to right, #EF4444, #DC2626)',
        color: '#FFFFFF',
        border: 'none',
      },
      yellow: {
        background: 'linear-gradient(to right, #FACC15, #EAB308)',
        color: '#0A0A0F',
        border: 'none',
      },
    }

    const sizeStyles: Record<string, CSSProperties> = {
      sm: {
        height: '36px',
        padding: '0 16px',
        fontSize: '14px',
        borderRadius: '8px',
        gap: '6px',
      },
      md: {
        height: '40px',
        padding: '0 20px',
        fontSize: '14px',
        borderRadius: '12px',
        gap: '8px',
      },
      lg: {
        height: '48px',
        padding: '0 24px',
        fontSize: '16px',
        borderRadius: '12px',
        gap: '10px',
      },
    }

    const baseStyle: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.5 : 1,
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        style={baseStyle}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }}
              viewBox="0 0 24 24"
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
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
