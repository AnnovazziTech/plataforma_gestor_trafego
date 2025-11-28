'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { Campaign, Report, Automation, Notification } from '@/types'
import { campaigns as initialCampaigns, reports as initialReports, automations as initialAutomations, notifications as initialNotifications } from '@/data/mock-data'

interface ConnectedAccount {
  id: string
  platform: 'facebook_ads' | 'google_ads' | 'linkedin_ads' | 'tiktok_ads' | 'whatsapp'
  name: string
  email?: string
  connected: boolean
  connectedAt?: string
}

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

  // Connected Accounts
  connectedAccounts: ConnectedAccount[]
  connectAccount: (platform: ConnectedAccount['platform']) => void
  disconnectAccount: (id: string) => void

  // Date range
  dateRange: string
  setDateRange: (range: string) => void

  // Selected account filter
  selectedAccount: string
  setSelectedAccount: (accountId: string) => void

  // Modals
  isCreateCampaignModalOpen: boolean
  setIsCreateCampaignModalOpen: (open: boolean) => void
  isCreateReportModalOpen: boolean
  setIsCreateReportModalOpen: (open: boolean) => void
  isCreateAutomationModalOpen: boolean
  setIsCreateAutomationModalOpen: (open: boolean) => void
  isConnectAccountsModalOpen: boolean
  setIsConnectAccountsModalOpen: (open: boolean) => void

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

const initialConnectedAccounts: ConnectedAccount[] = [
  { id: '1', platform: 'facebook_ads', name: 'Meta Ads - Empresa Principal', email: 'empresa@email.com', connected: true, connectedAt: '2024-01-15' },
  { id: '2', platform: 'google_ads', name: 'Google Ads - Conta Master', email: 'ads@empresa.com', connected: true, connectedAt: '2024-01-20' },
]

export function AppProvider({ children }: { children: ReactNode }) {
  // State
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [automations, setAutomations] = useState<Automation[]>(initialAutomations)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(initialConnectedAccounts)
  const [dateRange, setDateRange] = useState('Ultimos 30 dias')
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [toasts, setToasts] = useState<Toast[]>([])

  // Modal states
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false)
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false)
  const [isCreateAutomationModalOpen, setIsCreateAutomationModalOpen] = useState(false)
  const [isConnectAccountsModalOpen, setIsConnectAccountsModalOpen] = useState(false)

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

  // Connected Accounts functions
  const connectAccount = useCallback((platform: ConnectedAccount['platform']) => {
    const platformNames: Record<ConnectedAccount['platform'], string> = {
      facebook_ads: 'Facebook Ads',
      google_ads: 'Google Ads',
      linkedin_ads: 'LinkedIn Ads',
      tiktok_ads: 'TikTok Ads',
      whatsapp: 'WhatsApp Business'
    }
    const newAccount: ConnectedAccount = {
      id: Math.random().toString(36).substring(7),
      platform,
      name: `${platformNames[platform]} - Nova Conta`,
      connected: true,
      connectedAt: new Date().toISOString().split('T')[0]
    }
    setConnectedAccounts(prev => [...prev, newAccount])
    showToast(`${platformNames[platform]} conectado com sucesso!`, 'success')
  }, [showToast])

  const disconnectAccount = useCallback((id: string) => {
    setConnectedAccounts(prev => prev.filter(a => a.id !== id))
    showToast('Conta desconectada com sucesso!', 'info')
  }, [showToast])

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
      connectedAccounts,
      connectAccount,
      disconnectAccount,
      dateRange,
      setDateRange,
      selectedAccount,
      setSelectedAccount,
      isCreateCampaignModalOpen,
      setIsCreateCampaignModalOpen,
      isCreateReportModalOpen,
      setIsCreateReportModalOpen,
      isCreateAutomationModalOpen,
      setIsCreateAutomationModalOpen,
      isConnectAccountsModalOpen,
      setIsConnectAccountsModalOpen,
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
