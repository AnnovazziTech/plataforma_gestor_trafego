'use client'

import { forwardRef, HTMLAttributes, ReactNode, CSSProperties } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref' | 'children' | 'style'> {
  variant?: 'default' | 'glass' | 'gradient' | 'elevated' | 'outlined'
  hover?: boolean
  accentColor?: 'blue' | 'yellow' | 'green' | 'red' | 'none'
  showAccentLine?: boolean
  size?: 'sm' | 'default' | 'lg'
  children?: ReactNode
  style?: CSSProperties
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
    style,
    ...props
  }, ref) => {
    const accentColors: Record<string, string> = {
      blue: '#3B82F6',
      yellow: '#FACC15',
      green: '#10B981',
      red: '#EF4444',
      none: '',
    }

    const sizeConfig: Record<string, { padding: string; borderRadius: string }> = {
      sm: { padding: '16px', borderRadius: '12px' },
      default: { padding: '24px', borderRadius: '16px' },
      lg: { padding: '32px', borderRadius: '16px' },
    }

    const sizes = sizeConfig[size]

    const baseStyle: CSSProperties = {
      position: 'relative',
      padding: sizes.padding,
      borderRadius: sizes.borderRadius,
      border: '1px solid rgba(255, 255, 255, 0.05)',
      background: 'linear-gradient(to bottom right, rgba(18, 18, 26, 0.8), rgba(13, 13, 20, 0.8))',
      overflow: 'hidden',
      ...style,
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={hover ? { y: -2 } : undefined}
        style={baseStyle}
        {...props}
      >
        {/* Accent line at top */}
        {showAccentLine && accentColor !== 'none' && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${accentColors[accentColor]}, ${accentColors[accentColor]}80)`,
            }}
          />
        )}

        <div style={{ position: 'relative' }}>
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
  ({ className, icon, action, children, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        ...style,
      }}
      {...props}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icon && (
          <div
            style={{
              padding: '10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
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
  ({ className, style, ...props }, ref) => (
    <h3
      ref={ref}
      style={{
        fontSize: '18px',
        fontWeight: 600,
        color: '#FFFFFF',
        margin: 0,
        ...style,
      }}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, style, ...props }, ref) => (
    <p
      ref={ref}
      style={{
        fontSize: '14px',
        color: '#6B6B7B',
        marginTop: '4px',
        margin: 0,
        ...style,
      }}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div ref={ref} style={{ ...style }} {...props} />
  )
)
CardContent.displayName = 'CardContent'

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, bordered = true, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: bordered ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
        ...style,
      }}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
