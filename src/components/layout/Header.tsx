'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bell,
  Calendar,
  ChevronDown,
  RefreshCw,
  Plus,
  Link2
} from 'lucide-react'
import { useApp } from '@/contexts'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  showCreateButton?: boolean
  onCreateClick?: () => void
  createButtonText?: string
  buttonType?: 'campaign' | 'connect'
  onRefresh?: () => Promise<void> | void
}

export function Header({
  title,
  subtitle,
  showCreateButton = true,
  onCreateClick,
  createButtonText = 'Nova Campanha',
  buttonType = 'campaign',
  onRefresh,
}: HeaderProps) {
  const {
    notifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    dateRange,
    setDateRange,
    setIsCreateCampaignModalOpen,
    setIsConnectAccountsModalOpen,
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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (onRefresh) {
        await onRefresh()
      }
      showToast('Dados atualizados!', 'success')
    } catch (error) {
      showToast('Erro ao atualizar dados', 'error')
    } finally {
      setTimeout(() => setIsRefreshing(false), 1500)
    }
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
    } else if (buttonType === 'connect') {
      setIsConnectAccountsModalOpen(true)
    } else {
      setIsCreateCampaignModalOpen(true)
    }
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px',
          paddingLeft: '32px',
          paddingRight: '32px',
        }}
      >
        {/* Lado Esquerdo - Título */}
        <div style={{ flexShrink: 0 }}>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: '12px',
                color: '#6B6B7B',
                marginTop: '2px',
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Lado Direito - Ações */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Campo de Busca */}
          <form onSubmit={handleSearch} className="hidden lg:block">
            <div style={{ position: 'relative', width: '220px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar campanhas..."
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#FFFFFF',
                  paddingLeft: '40px',
                  paddingRight: '16px',
                  outline: 'none',
                }}
              />
              <Search
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: '#6B6B7B',
                }}
              />
            </div>
          </form>

          {/* Seletor de Período */}
          <div style={{ position: 'relative' }} className="hidden md:block">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '40px',
                padding: '0 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              <Calendar style={{ width: '16px', height: '16px', color: '#3B82F6' }} />
              <span className="hidden xl:inline">{dateRange}</span>
              <ChevronDown
                style={{
                  width: '14px',
                  height: '14px',
                  color: '#6B6B7B',
                  transform: showDatePicker ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </button>

            <AnimatePresence>
              {showDatePicker && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={() => setShowDatePicker(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '8px',
                      width: '192px',
                      backgroundColor: '#12121A',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      overflow: 'hidden',
                      zIndex: 50,
                    }}
                  >
                    {dateRanges.map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setDateRange(range)
                          setShowDatePicker(false)
                          showToast('Período alterado: ' + range, 'info')
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          textAlign: 'left',
                          fontSize: '14px',
                          color: dateRange === range ? '#3B82F6' : '#FFFFFF',
                          backgroundColor: dateRange === range ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                        }}
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
            title="Atualizar dados"
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#A0A0B0',
              cursor: 'pointer',
            }}
          >
            <RefreshCw
              style={{
                width: '16px',
                height: '16px',
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }}
            />
          </button>

          {/* Notificações */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notificações"
              style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#A0A0B0',
                cursor: 'pointer',
              }}
            >
              <Bell style={{ width: '16px', height: '16px' }} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: '#FACC15',
                    color: '#0A0A0F',
                    borderRadius: '9999px',
                    padding: '0 4px',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '8px',
                      width: '320px',
                      backgroundColor: '#12121A',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      overflow: 'hidden',
                      zIndex: 50,
                    }}
                  >
                    <div
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <h3 style={{ fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Notificações</h3>
                      <button
                        onClick={() => {
                          markAllNotificationsAsRead()
                          setShowNotifications(false)
                        }}
                        style={{
                          fontSize: '12px',
                          color: '#3B82F6',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Marcar lidas
                      </button>
                    </div>
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', fontSize: '14px', color: '#6B6B7B' }}>
                          Nenhuma notificação
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markNotificationAsRead(notification.id)}
                            style={{
                              padding: '16px',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                              cursor: 'pointer',
                              backgroundColor: !notification.read ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <div
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '9999px',
                                  marginTop: '8px',
                                  flexShrink: 0,
                                  backgroundColor:
                                    notification.type === 'error' ? '#EF4444' :
                                    notification.type === 'success' ? '#3B82F6' :
                                    notification.type === 'warning' ? '#FACC15' : '#60A5FA',
                                }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', margin: 0 }}>
                                  {notification.title}
                                </p>
                                <p style={{ fontSize: '12px', color: '#6B6B7B', marginTop: '4px' }}>
                                  {notification.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <button
                        onClick={() => {
                          setShowNotifications(false)
                          showToast('Em desenvolvimento', 'info')
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'center',
                          fontSize: '14px',
                          color: '#3B82F6',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Ver todas
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Botão Principal */}
          {showCreateButton && (
            <button
              onClick={handleCreateClick}
              className="hidden sm:flex"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '40px',
                padding: '0 16px',
                background: 'linear-gradient(to right, #3B82F6, #1D4ED8)',
                border: 'none',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {buttonType === 'connect' ? (
                <Link2 style={{ width: '16px', height: '16px' }} />
              ) : (
                <Plus style={{ width: '16px', height: '16px' }} />
              )}
              <span className="hidden lg:inline">{createButtonText}</span>
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  )
}
