'use client'

import { HTMLAttributes, forwardRef, ReactNode, CSSProperties } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default' | 'purple' | 'cyan' | 'orange'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  dot?: boolean
  pulse?: boolean
  outlined?: boolean
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', icon, dot = false, pulse = false, outlined = false, children, style, ...props }, ref) => {
    const variantConfig: Record<string, { bg: string; text: string; border: string; dotColor: string }> = {
      success: {
        bg: 'rgba(16, 185, 129, 0.15)',
        text: '#10B981',
        border: 'rgba(16, 185, 129, 0.25)',
        dotColor: '#10B981',
      },
      warning: {
        bg: 'rgba(250, 204, 21, 0.15)',
        text: '#FACC15',
        border: 'rgba(250, 204, 21, 0.25)',
        dotColor: '#FACC15',
      },
      error: {
        bg: 'rgba(239, 68, 68, 0.15)',
        text: '#EF4444',
        border: 'rgba(239, 68, 68, 0.25)',
        dotColor: '#EF4444',
      },
      info: {
        bg: 'rgba(59, 130, 246, 0.15)',
        text: '#3B82F6',
        border: 'rgba(59, 130, 246, 0.25)',
        dotColor: '#3B82F6',
      },
      purple: {
        bg: 'rgba(139, 92, 246, 0.15)',
        text: '#8B5CF6',
        border: 'rgba(139, 92, 246, 0.25)',
        dotColor: '#8B5CF6',
      },
      cyan: {
        bg: 'rgba(6, 182, 212, 0.15)',
        text: '#06B6D4',
        border: 'rgba(6, 182, 212, 0.25)',
        dotColor: '#06B6D4',
      },
      orange: {
        bg: 'rgba(249, 115, 22, 0.15)',
        text: '#F97316',
        border: 'rgba(249, 115, 22, 0.25)',
        dotColor: '#F97316',
      },
      default: {
        bg: 'rgba(255, 255, 255, 0.1)',
        text: '#A0A0B0',
        border: 'rgba(255, 255, 255, 0.15)',
        dotColor: '#A0A0B0',
      },
    }

    const sizeConfig: Record<string, { padding: string; fontSize: string }> = {
      sm: { padding: '2px 8px', fontSize: '10px' },
      md: { padding: '4px 12px', fontSize: '12px' },
      lg: { padding: '6px 16px', fontSize: '14px' },
    }

    const colors = variantConfig[variant]
    const sizes = sizeConfig[size]

    const badgeStyle: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontWeight: 500,
      borderRadius: '9999px',
      border: `1px solid ${colors.border}`,
      transition: 'all 0.2s ease',
      backgroundColor: outlined ? 'transparent' : colors.bg,
      color: colors.text,
      padding: sizes.padding,
      fontSize: sizes.fontSize,
      ...style,
    }

    return (
      <span ref={ref} style={badgeStyle} {...props}>
        {dot && (
          <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px' }}>
            {pulse && (
              <span
                style={{
                  position: 'absolute',
                  display: 'inline-flex',
                  width: '100%',
                  height: '100%',
                  borderRadius: '9999px',
                  opacity: 0.75,
                  backgroundColor: colors.dotColor,
                  animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              />
            )}
            <span
              style={{
                position: 'relative',
                display: 'inline-flex',
                borderRadius: '9999px',
                width: '8px',
                height: '8px',
                backgroundColor: colors.dotColor,
              }}
            />
          </span>
        )}
        {icon && <span style={{ flexShrink: 0 }}>{icon}</span>}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

// StatusBadge - for showing status with automatic icon
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success'
}

const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string; dot: boolean; pulse: boolean }> = {
      active: { variant: 'success', label: 'Ativo', dot: true, pulse: true },
      inactive: { variant: 'default', label: 'Inativo', dot: true, pulse: false },
      pending: { variant: 'warning', label: 'Pendente', dot: true, pulse: true },
      error: { variant: 'error', label: 'Erro', dot: true, pulse: false },
      success: { variant: 'success', label: 'Sucesso', dot: true, pulse: false },
    }

    const config = statusConfig[status]

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        dot={config.dot}
        pulse={config.pulse}
        {...props}
      >
        {props.children || config.label}
      </Badge>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'

export { Badge, StatusBadge }
