'use client'

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'

// Tipos
interface Campaign {
  id: string
  name: string
  platform: string
  status: string
  objective: string
  budget: number
  budgetType?: string
  spent: number
  startDate: string | null
  endDate: string | null
  metrics: any
  integration?: any
  leadsCount?: number
  lastSyncAt?: string
  createdAt: string
  updatedAt?: string
  adSets?: any[]
}

interface Report {
  id: string
  name?: string
  type?: string
  action: string
  data: any
  status?: string
  frequency?: string
  dateRange?: { start: string; end: string }
  platforms?: string[]
  recipients?: string[]
  lastGenerated?: string
  createdAt: string
  userEmail?: string
}

interface Automation {
  id: string
  name: string
  type: string
  status: string
  condition: any
  conditions?: any[]
  action: string
  actions?: any[]
  executionCount?: number
  triggerCount?: number
  lastExecutedAt?: string
  lastTriggered?: string
  createdAt: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

interface ConnectedAccount {
  id: string
  platform: 'facebook_ads' | 'google_ads' | 'linkedin_ads' | 'tiktok_ads' | 'whatsapp'
  name: string
  email?: string
  connected: boolean
  connectedAt?: string
  status?: string
}

interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  source: string
  status: string
  value?: number
  notes?: string
  campaign?: any
  createdAt: string
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

interface AppContextType {
  // Loading states
  isLoading: boolean

  // Campaigns
  campaigns: Campaign[]
  campaignsLoading: boolean
  fetchCampaigns: () => Promise<void>
  addCampaign: (data: any) => Promise<Campaign | null>
  updateCampaign: (id: string, updates: any) => Promise<void>
  deleteCampaign: (id: string) => Promise<void>
  toggleCampaignStatus: (id: string) => Promise<void>

  // Reports
  reports: Report[]
  reportsLoading: boolean
  fetchReports: () => Promise<void>
  generateReport: (data: any) => Promise<any>
  deleteReport: (id: string) => void

  // Automations
  automations: Automation[]
  automationsLoading: boolean
  fetchAutomations: () => Promise<void>
  addAutomation: (data: any) => Promise<void>
  updateAutomation: (id: string, updates: any) => Promise<void>
  deleteAutomation: (id: string) => Promise<void>
  toggleAutomationStatus: (id: string) => Promise<void>

  // Notifications
  notifications: Notification[]
  notificationsLoading: boolean
  fetchNotifications: () => Promise<void>
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  clearNotification: (id: string) => void
  unreadCount: number

  // Connected Accounts (Integrations)
  connectedAccounts: ConnectedAccount[]
  integrationsLoading: boolean
  fetchIntegrations: () => Promise<void>
  connectAccount: (platform: string) => Promise<string | null>
  disconnectAccount: (id: string) => Promise<void>

  // Leads
  leads: Lead[]
  leadsLoading: boolean
  fetchLeads: () => Promise<void>
  addLead: (data: any) => Promise<Lead | null>
  updateLead: (id: string, updates: any) => Promise<void>
  deleteLead: (id: string) => Promise<void>

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

  // Sync
  syncCampaigns: (integrationId: string) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  // Loading state
  const [isLoading, setIsLoading] = useState(true)

  // Data states
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(false)

  const [reports, setReports] = useState<Report[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)

  const [automations, setAutomations] = useState<Automation[]>([])
  const [automationsLoading, setAutomationsLoading] = useState(false)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const [integrationsLoading, setIntegrationsLoading] = useState(false)

  const [leads, setLeads] = useState<Lead[]>([])
  const [leadsLoading, setLeadsLoading] = useState(false)

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

  // API helper
  const api = useCallback(async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro de conexao' }))
      throw new Error(error.error || 'Erro na requisicao')
    }

    return response.json()
  }, [])

  // === CAMPAIGNS ===
  const fetchCampaigns = useCallback(async () => {
    if (!isAuthenticated) return
    setCampaignsLoading(true)
    try {
      const data = await api('/api/campaigns')
      setCampaigns(data.campaigns || [])
    } catch (error: any) {
      console.error('Erro ao buscar campanhas:', error)
    } finally {
      setCampaignsLoading(false)
    }
  }, [api, isAuthenticated])

  const addCampaign = useCallback(async (campaignData: any): Promise<Campaign | null> => {
    try {
      const data = await api('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData),
      })
      setCampaigns(prev => [data.campaign, ...prev])
      showToast('Campanha criada com sucesso!', 'success')
      return data.campaign
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar campanha', 'error')
      return null
    }
  }, [api, showToast])

  const updateCampaign = useCallback(async (id: string, updates: any) => {
    try {
      const data = await api(`/api/campaigns/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })
      setCampaigns(prev => prev.map(c => c.id === id ? data.campaign : c))
      showToast('Campanha atualizada com sucesso!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar campanha', 'error')
    }
  }, [api, showToast])

  const deleteCampaign = useCallback(async (id: string) => {
    try {
      await api(`/api/campaigns/${id}`, { method: 'DELETE' })
      setCampaigns(prev => prev.filter(c => c.id !== id))
      showToast('Campanha removida com sucesso!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao remover campanha', 'error')
    }
  }, [api, showToast])

  const toggleCampaignStatus = useCallback(async (id: string) => {
    const campaign = campaigns.find(c => c.id === id)
    if (!campaign) return

    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    try {
      await api(`/api/campaigns/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
      showToast('Status da campanha alterado!', 'info')
    } catch (error: any) {
      showToast(error.message || 'Erro ao alterar status', 'error')
    }
  }, [api, campaigns, showToast])

  const syncCampaigns = useCallback(async (integrationId: string) => {
    try {
      showToast('Sincronizando campanhas...', 'info')
      const data = await api('/api/sync/campaigns', {
        method: 'POST',
        body: JSON.stringify({ integrationId }),
      })
      showToast(`${data.syncedCampaigns} campanhas sincronizadas!`, 'success')
      await fetchCampaigns()
    } catch (error: any) {
      showToast(error.message || 'Erro ao sincronizar', 'error')
    }
  }, [api, fetchCampaigns, showToast])

  // === REPORTS ===
  const fetchReports = useCallback(async () => {
    if (!isAuthenticated) return
    setReportsLoading(true)
    try {
      const data = await api('/api/reports')
      setReports(data.reports || [])
    } catch (error: any) {
      console.error('Erro ao buscar relatorios:', error)
    } finally {
      setReportsLoading(false)
    }
  }, [api, isAuthenticated])

  const generateReport = useCallback(async (reportData: any) => {
    try {
      const data = await api('/api/reports', {
        method: 'POST',
        body: JSON.stringify(reportData),
      })
      showToast('Relatorio gerado com sucesso!', 'success')
      await fetchReports()
      return data.report
    } catch (error: any) {
      showToast(error.message || 'Erro ao gerar relatorio', 'error')
      return null
    }
  }, [api, fetchReports, showToast])

  const deleteReport = useCallback((id: string) => {
    setReports(prev => prev.filter(r => r.id !== id))
    showToast('Relatorio removido!', 'info')
  }, [showToast])

  // === AUTOMATIONS ===
  const fetchAutomations = useCallback(async () => {
    if (!isAuthenticated) return
    setAutomationsLoading(true)
    try {
      const data = await api('/api/automations')
      setAutomations(data.automations || [])
    } catch (error: any) {
      console.error('Erro ao buscar automacoes:', error)
    } finally {
      setAutomationsLoading(false)
    }
  }, [api, isAuthenticated])

  const addAutomation = useCallback(async (automationData: any) => {
    try {
      const data = await api('/api/automations', {
        method: 'POST',
        body: JSON.stringify(automationData),
      })
      setAutomations(prev => [data.automation, ...prev])
      showToast('Automacao criada com sucesso!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar automacao', 'error')
    }
  }, [api, showToast])

  const updateAutomation = useCallback(async (id: string, updates: any) => {
    try {
      const data = await api(`/api/automations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })
      setAutomations(prev => prev.map(a => a.id === id ? data.automation : a))
      showToast('Automacao atualizada!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar automacao', 'error')
    }
  }, [api, showToast])

  const deleteAutomation = useCallback(async (id: string) => {
    try {
      await api(`/api/automations/${id}`, { method: 'DELETE' })
      setAutomations(prev => prev.filter(a => a.id !== id))
      showToast('Automacao removida!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao remover automacao', 'error')
    }
  }, [api, showToast])

  const toggleAutomationStatus = useCallback(async (id: string) => {
    const automation = automations.find(a => a.id === id)
    if (!automation) return

    const newStatus = automation.status === 'active' ? 'paused' : 'active'
    try {
      await api(`/api/automations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
      showToast('Status da automacao alterado!', 'info')
    } catch (error: any) {
      showToast(error.message || 'Erro ao alterar status', 'error')
    }
  }, [api, automations, showToast])

  // === NOTIFICATIONS ===
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    setNotificationsLoading(true)
    try {
      const data = await api('/api/notifications')
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error: any) {
      console.error('Erro ao buscar notificacoes:', error)
    } finally {
      setNotificationsLoading(false)
    }
  }, [api, isAuthenticated])

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
    showToast('Todas notificacoes marcadas como lidas!', 'info')
  }, [showToast])

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // === INTEGRATIONS (Connected Accounts) ===
  const fetchIntegrations = useCallback(async () => {
    if (!isAuthenticated) return
    setIntegrationsLoading(true)
    try {
      const data = await api('/api/integrations')
      const accounts: ConnectedAccount[] = (data.integrations || []).map((int: any) => ({
        id: int.id,
        platform: int.platform.toLowerCase() === 'meta' ? 'facebook_ads' :
                  int.platform.toLowerCase() + '_ads' as any,
        name: int.name,
        email: int.platformAccountName,
        connected: int.status === 'CONNECTED',
        connectedAt: int.createdAt?.split('T')[0],
        status: int.status,
      }))
      setConnectedAccounts(accounts)
    } catch (error: any) {
      console.error('Erro ao buscar integracoes:', error)
    } finally {
      setIntegrationsLoading(false)
    }
  }, [api, isAuthenticated])

  const connectAccount = useCallback(async (platform: string): Promise<string | null> => {
    try {
      const platformMap: Record<string, string> = {
        'facebook_ads': 'META',
        'google_ads': 'GOOGLE',
        'tiktok_ads': 'TIKTOK',
        'linkedin_ads': 'LINKEDIN',
        'whatsapp': 'WHATSAPP',
      }

      const data = await api('/api/integrations', {
        method: 'POST',
        body: JSON.stringify({
          platform: platformMap[platform] || platform.toUpperCase(),
          returnUrl: window.location.href,
        }),
      })

      if (data.authUrl) {
        return data.authUrl
      }

      showToast('Redirecionando para autenticacao...', 'info')
      return null
    } catch (error: any) {
      showToast(error.message || 'Erro ao conectar conta', 'error')
      return null
    }
  }, [api, showToast])

  const disconnectAccount = useCallback(async (id: string) => {
    try {
      await api(`/api/integrations/${id}`, { method: 'DELETE' })
      setConnectedAccounts(prev => prev.filter(a => a.id !== id))
      showToast('Conta desconectada com sucesso!', 'info')
    } catch (error: any) {
      showToast(error.message || 'Erro ao desconectar conta', 'error')
    }
  }, [api, showToast])

  // === LEADS ===
  const fetchLeads = useCallback(async () => {
    if (!isAuthenticated) return
    setLeadsLoading(true)
    try {
      const data = await api('/api/leads')
      setLeads(data.leads || [])
    } catch (error: any) {
      console.error('Erro ao buscar leads:', error)
    } finally {
      setLeadsLoading(false)
    }
  }, [api, isAuthenticated])

  const addLead = useCallback(async (leadData: any): Promise<Lead | null> => {
    try {
      const data = await api('/api/leads', {
        method: 'POST',
        body: JSON.stringify(leadData),
      })
      setLeads(prev => [data.lead, ...prev])
      showToast('Lead criado com sucesso!', 'success')
      return data.lead
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar lead', 'error')
      return null
    }
  }, [api, showToast])

  const updateLead = useCallback(async (id: string, updates: any) => {
    try {
      const data = await api(`/api/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })
      setLeads(prev => prev.map(l => l.id === id ? data.lead : l))
      showToast('Lead atualizado!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar lead', 'error')
    }
  }, [api, showToast])

  const deleteLead = useCallback(async (id: string) => {
    try {
      await api(`/api/leads/${id}`, { method: 'DELETE' })
      setLeads(prev => prev.filter(l => l.id !== id))
      showToast('Lead removido!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao remover lead', 'error')
    }
  }, [api, showToast])

  // === INITIAL DATA LOAD ===
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true)
      Promise.all([
        fetchCampaigns(),
        fetchIntegrations(),
        fetchNotifications(),
        fetchLeads(),
      ]).finally(() => {
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, fetchCampaigns, fetchIntegrations, fetchNotifications, fetchLeads])

  return (
    <AppContext.Provider value={{
      isLoading,
      campaigns,
      campaignsLoading,
      fetchCampaigns,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      toggleCampaignStatus,
      reports,
      reportsLoading,
      fetchReports,
      generateReport,
      deleteReport,
      automations,
      automationsLoading,
      fetchAutomations,
      addAutomation,
      updateAutomation,
      deleteAutomation,
      toggleAutomationStatus,
      notifications,
      notificationsLoading,
      fetchNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearNotification,
      unreadCount,
      connectedAccounts,
      integrationsLoading,
      fetchIntegrations,
      connectAccount,
      disconnectAccount,
      leads,
      leadsLoading,
      fetchLeads,
      addLead,
      updateLead,
      deleteLead,
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
      syncCampaigns,
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
