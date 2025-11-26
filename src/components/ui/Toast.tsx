'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useApp } from '@/contexts'

export function ToastContainer() {
  const { toasts } = useApp()

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[#00FF88]" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-[#FFE500]" />,
    info: <Info className="w-5 h-5 text-[#00F5FF]" />,
  }

  const colors = {
    success: 'border-[#00FF88]/30 bg-[#00FF88]/10',
    error: 'border-red-500/30 bg-red-500/10',
    warning: 'border-[#FFE500]/30 bg-[#FFE500]/10',
    info: 'border-[#00F5FF]/30 bg-[#00F5FF]/10',
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl ${colors[toast.type]}`}
          >
            {icons[toast.type]}
            <span className="text-sm text-white font-medium">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
