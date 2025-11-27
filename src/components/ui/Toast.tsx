'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { useApp } from '@/contexts'

export function ToastContainer() {
  const { toasts } = useApp()

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[#3B82F6]" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-[#FACC15]" />,
    info: <Info className="w-5 h-5 text-[#60A5FA]" />,
  }

  const colors = {
    success: 'border-[#3B82F6]/30 bg-[#3B82F6]/10',
    error: 'border-red-500/30 bg-red-500/10',
    warning: 'border-[#FACC15]/30 bg-[#FACC15]/10',
    info: 'border-[#60A5FA]/30 bg-[#60A5FA]/10',
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
