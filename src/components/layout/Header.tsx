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
    'Últimos 7 dias',
    'Últimos 30 dias',
    'Este mês',
    'Mês passado',
    'Últimos 90 dias',
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
      <div className="flex items-center justify-between h-20 px-6 md:px-8">
        {/* Título e Subtítulo */}
        <div className="min-w-0 flex-shrink-0">
          <h1 className="text-xl md:text-2xl font-bold text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[#6B6B7B] mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
          {/* Campo de Busca Global */}
          <form onSubmit={handleSearch} className="relative hidden lg:flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-[#6B6B7B] pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar campanhas, relatórios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 xl:w-80 h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]/50 focus:bg-white/10 transition-all"
            />
          </form>

          {/* Seletor de Período */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 hover:border-[#3B82F6]/30 transition-all"
            >
              <Calendar className="w-4 h-4 text-[#3B82F6]" />
              <span className="hidden xl:inline">{dateRange}</span>
              <ChevronDown className={cn('w-4 h-4 text-[#6B6B7B] transition-transform', showDatePicker && 'rotate-180')} />
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
                          showToast('Período alterado: ' + range, 'info')
                        }}
                        className={cn(
                          'w-full px-4 py-2.5 text-left text-sm transition-colors',
                          dateRange === range ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'text-white hover:bg-white/5'
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

          {/* Botão Atualizar */}
          <button
            onClick={handleRefresh}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#A0A0B0] hover:text-white hover:bg-white/10 hover:border-[#3B82F6]/30 transition-all"
            title="Atualizar dados"
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
          </button>

          {/* Notificações */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#A0A0B0] hover:text-white hover:bg-white/10 hover:border-[#3B82F6]/30 transition-all"
              title="Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-[#FACC15] text-[#0A0A0F] rounded-full">
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
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">Notificações</h3>
                        <button
                          onClick={() => {
                            markAllNotificationsAsRead()
                            setShowNotifications(false)
                          }}
                          className="text-xs text-[#3B82F6] cursor-pointer hover:underline"
                        >
                          Marcar lidas
                        </button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-[#6B6B7B]">Nenhuma notificação</div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markNotificationAsRead(notification.id)}
                            className={cn(
                              'p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer',
                              !notification.read && 'bg-[#3B82F6]/5'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                                notification.type === 'alert' && 'bg-red-500',
                                notification.type === 'success' && 'bg-[#3B82F6]',
                                notification.type === 'warning' && 'bg-[#FACC15]',
                                notification.type === 'info' && 'bg-[#60A5FA]',
                              )} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white">{notification.title}</p>
                                <p className="text-xs text-[#6B6B7B] mt-1 line-clamp-2">{notification.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 bg-white/5">
                      <button
                        onClick={() => {
                          setShowNotifications(false)
                          showToast('Em desenvolvimento', 'info')
                        }}
                        className="w-full text-center text-sm text-[#3B82F6] hover:underline"
                      >
                        Ver todas
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Botão Nova Campanha */}
          {showCreateButton && (
            <Button variant="primary" className="gap-2 hidden sm:flex h-11" onClick={handleCreateClick}>
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">{createButtonText}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
