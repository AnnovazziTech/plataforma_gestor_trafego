'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bell,
  Calendar,
  ChevronDown,
  RefreshCw,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui'
import { useApp } from '@/contexts'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  showCreateButton?: boolean
  onCreateClick?: () => void
  createButtonText?: string
}

export function Header({
  title,
  subtitle,
  showCreateButton = true,
  onCreateClick,
  createButtonText = 'Nova Campanha'
}: HeaderProps) {
  const {
    notifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    dateRange,
    setDateRange,
    setIsCreateCampaignModalOpen,
    showToast
  } = useApp()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const unreadCount = notifications.filter(n => !n.read).length

  const dateRanges = [
    'Hoje',
    'Ontem',
    'Ultimos 7 dias',
    'Ultimos 30 dias',
    'Este mes',
    'Mes passado',
    'Ultimos 90 dias',
    'Este ano',
  ]

  const handleRefresh = () => {
    setIsRefreshing(true)
    showToast('Dados atualizados!', 'success')
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      showToast('Buscando por: ' + searchQuery, 'info')
    }
  }

  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick()
    } else {
      setIsCreateCampaignModalOpen(true)
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-bold text-white truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#6B6B7B] truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B7B]" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 xl:w-64 h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#6B6B7B] focus:outline-none focus:border-[#00F5FF]/50 transition-all"
            />
          </form>

          <div className="relative hidden md:block">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-all"
            >
              <Calendar className="w-4 h-4 text-[#00F5FF]" />
              <span className="hidden xl:inline">{dateRange}</span>
              <ChevronDown className={cn('w-3 h-3 text-[#6B6B7B] transition-transform', showDatePicker && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {showDatePicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-[#12121A] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    {dateRanges.map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setDateRange(range)
                          setShowDatePicker(false)
                          showToast('Periodo alterado: ' + range, 'info')
                        }}
                        className={cn(
                          'w-full px-4 py-2 text-left text-sm transition-colors',
                          dateRange === range ? 'bg-[#00F5FF]/10 text-[#00F5FF]' : 'text-white hover:bg-white/5'
                        )}
                      >
                        {range}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleRefresh}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[#A0A0B0] hover:text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[#A0A0B0] hover:text-white hover:bg-white/10 transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-gradient-to-r from-[#FF00E5] to-[#BF00FF] text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-[#12121A] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white text-sm">Notificacoes</h3>
                        <button
                          onClick={() => {
                            markAllNotificationsAsRead()
                            setShowNotifications(false)
                          }}
                          className="text-xs text-[#00F5FF] cursor-pointer hover:underline"
                        >
                          Marcar lidas
                        </button>
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-[#6B6B7B]">Nenhuma notificacao</div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markNotificationAsRead(notification.id)}
                            className={cn(
                              'p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer',
                              !notification.read && 'bg-[#00F5FF]/5'
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <div className={cn(
                                'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                                notification.type === 'alert' && 'bg-red-500',
                                notification.type === 'success' && 'bg-[#00FF88]',
                                notification.type === 'warning' && 'bg-[#FFE500]',
                                notification.type === 'info' && 'bg-[#00F5FF]',
                              )} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate">{notification.title}</p>
                                <p className="text-[10px] text-[#6B6B7B] mt-0.5 line-clamp-2">{notification.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 bg-white/5">
                      <button
                        onClick={() => {
                          setShowNotifications(false)
                          showToast('Em desenvolvimento', 'info')
                        }}
                        className="w-full text-center text-xs text-[#00F5FF] hover:underline"
                      >
                        Ver todas
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {showCreateButton && (
            <Button variant="primary" size="sm" className="gap-1.5 hidden sm:flex" onClick={handleCreateClick}>
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">{createButtonText}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
