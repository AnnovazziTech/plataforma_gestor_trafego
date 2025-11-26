'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { Campaign, Report, Automation, Notification } from '@/types'
import { campaigns as initialCampaigns, reports as initialReports, automations as initialAutomations, notifications as initialNotifications } from '@/data/mock-data'

interface AppContextType {
  // Campaigns
  campaigns: Campaign[]
  addCampaign: (campaign: Campaign) => void
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
  toggleCampaignStatus: (id: string) => void

  // Reports
  reports: Report[]
  addReport: (report: Report) => void
  deleteReport: (id: string) => void

  // Automations
  automations: Automation[]
  addAutomation: (automation: Automation) => void
  updateAutomation: (id: string, updates: Partial<Automation>) => void
  deleteAutomation: (id: string) => void
  toggleAutomationStatus: (id: string) => void

  // Notifications
  notifications: Notification[]
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  clearNotification: (id: string) => void

  // Date range
  dateRange: string
  setDateRange: (range: string) => void

  // Modals
  isCreateCampaignModalOpen: boolean
  setIsCreateCampaignModalOpen: (open: boolean) => void
  isCreateReportModalOpen: boolean
  setIsCreateReportModalOpen: (open: boolean) => void
  isCreateAutomationModalOpen: boolean
  setIsCreateAutomationModalOpen: (open: boolean) => void

  // Toast notifications
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
  toasts: Toast[]
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  // State
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [automations, setAutomations] = useState<Automation[]>(initialAutomations)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [dateRange, setDateRange] = useState('Ultimos 30 dias')
  const [toasts, setToasts] = useState<Toast[]>([])

  // Modal states
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false)
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false)
  const [isCreateAutomationModalOpen, setIsCreateAutomationModalOpen] = useState(false)

  // Toast function
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  // Campaign functions
  const addCampaign = useCallback((campaign: Campaign) => {
    setCampaigns(prev => [campaign, ...prev])
    showToast('Campanha criada com sucesso!', 'success')
  }, [showToast])

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    showToast('Campanha atualizada com sucesso!', 'success')
  }, [showToast])

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id))
    showToast('Campanha removida com sucesso!', 'success')
  }, [showToast])

  const toggleCampaignStatus = useCallback((id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'active' ? 'paused' : 'active'
        return { ...c, status: newStatus }
      }
      return c
    }))
    showToast('Status da campanha alterado!', 'info')
  }, [showToast])

  // Report functions
  const addReport = useCallback((report: Report) => {
    setReports(prev => [report, ...prev])
    showToast('Relatorio criado com sucesso!', 'success')
  }, [showToast])

  const deleteReport = useCallback((id: string) => {
    setReports(prev => prev.filter(r => r.id !== id))
    showToast('Relatorio removido com sucesso!', 'success')
  }, [showToast])

  // Automation functions
  const addAutomation = useCallback((automation: Automation) => {
    setAutomations(prev => [automation, ...prev])
    showToast('Automacao criada com sucesso!', 'success')
  }, [showToast])

  const updateAutomation = useCallback((id: string, updates: Partial<Automation>) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
    showToast('Automacao atualizada com sucesso!', 'success')
  }, [showToast])

  const deleteAutomation = useCallback((id: string) => {
    setAutomations(prev => prev.filter(a => a.id !== id))
    showToast('Automacao removida com sucesso!', 'success')
  }, [showToast])

  const toggleAutomationStatus = useCallback((id: string) => {
    setAutomations(prev => prev.map(a => {
      if (a.id === id) {
        const newStatus = a.status === 'active' ? 'paused' : 'active'
        return { ...a, status: newStatus as 'active' | 'paused' }
      }
      return a
    }))
    showToast('Status da automacao alterado!', 'info')
  }, [showToast])

  // Notification functions
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    showToast('Todas notificacoes marcadas como lidas!', 'info')
  }, [showToast])

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <AppContext.Provider value={{
      campaigns,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      toggleCampaignStatus,
      reports,
      addReport,
      deleteReport,
      automations,
      addAutomation,
      updateAutomation,
      deleteAutomation,
      toggleAutomationStatus,
      notifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearNotification,
      dateRange,
      setDateRange,
      isCreateCampaignModalOpen,
      setIsCreateCampaignModalOpen,
      isCreateReportModalOpen,
      setIsCreateReportModalOpen,
      isCreateAutomationModalOpen,
      setIsCreateAutomationModalOpen,
      showToast,
      toasts,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
