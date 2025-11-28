'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { useApp } from '@/contexts'

export function ToastContainer() {
  const { toasts } = useApp()

  const getIconAndColors = (type: 'success' | 'error' | 'warning' | 'info') => {
    const config = {
      success: {
        icon: <CheckCircle style={{ width: '20px', height: '20px', color: '#3B82F6' }} />,
        bg: 'rgba(59, 130, 246, 0.1)',
        border: 'rgba(59, 130, 246, 0.3)',
      },
      error: {
        icon: <XCircle style={{ width: '20px', height: '20px', color: '#EF4444' }} />,
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.3)',
      },
      warning: {
        icon: <AlertCircle style={{ width: '20px', height: '20px', color: '#FACC15' }} />,
        bg: 'rgba(250, 204, 21, 0.1)',
        border: 'rgba(250, 204, 21, 0.3)',
      },
      info: {
        icon: <Info style={{ width: '20px', height: '20px', color: '#60A5FA' }} />,
        bg: 'rgba(96, 165, 250, 0.1)',
        border: 'rgba(96, 165, 250, 0.3)',
      },
    }
    return config[type]
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = getIconAndColors(toast.type)
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: `1px solid ${config.border}`,
                backgroundColor: config.bg,
                backdropFilter: 'blur(12px)',
              }}
            >
              {config.icon}
              <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 500 }}>{toast.message}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
