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
  integrationId?: string
  integration?: any
  leadsCount?: number
  lastSyncAt?: string
  createdAt: string
  updatedAt?: string
  adSets?: any[]
}

interface Report {
  id: string
  name: string
  type: 'performance' | 'audience' | 'creative' | 'custom'
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom'
  status: 'active' | 'paused' | 'archived'
  platforms: string[]
  metrics: string[]
  dateRange: { start: string; end: string }
  recipients: string[]
  sendMethod?: string
  lastGenerated?: string
  generatedCount?: number
  reportData?: any
  createdAt: string
  updatedAt?: string
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

interface Creative {
  id: string
  title: string
  description?: string
  type: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'TEXT'
  platform?: string
  thumbnailUrl?: string
  mediaUrl?: string
  sourceUrl?: string
  sourceAdvertiser?: string
  tags: string[]
  isFavorite: boolean
  createdAt: string
}

interface ArtTemplate {
  id: string
  name: string
  description?: string
  type: string
  niche: string
  thumbnailUrl: string
  canvaUrl?: string
  downloads: number
  rating: number
  tags: string[]
  isNew: boolean
  isPremium: boolean
  isSaved?: boolean
}

interface Conversation {
  id: string
  platform: 'WHATSAPP' | 'INSTAGRAM' | 'MESSENGER'
  platformContactId: string
  contactName: string
  contactPhone?: string
  contactEmail?: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
  status: string
  tags: string[]
  messages?: any[]
  createdAt: string
}

interface FinancialEntry {
  id: string
  type: 'INCOME' | 'EXPENSE' | 'ASSET'
  amount: number
  description?: string
  date: string
  clientId?: string
  client?: { id: string; name: string }
  createdAt: string
}

interface ClientTask {
  id: string
  clientId: string
  description: string
  date: string
  completed: boolean
  client?: { id: string; name: string }
  createdAt: string
}

interface BudgetStrategyItem {
  id: string
  clientId: string
  name: string
  totalBudget: number
  client?: { id: string; name: string }
  campaigns: BudgetCampaignItem[]
  createdAt: string
}

interface BudgetCampaignItem {
  id: string
  clientId: string
  strategyId: string
  name: string
  maxMeta: number
  maxGoogle: number
  dailyBudget: number
  startDate: string
  spentMeta: number
  spentGoogle: number
  previousLeadCost?: number
  currentLeadCost?: number
  previousDate?: string
  currentDate?: string
  client?: { id: string; name: string }
  strategy?: { id: string; name: string; totalBudget: number }
  createdAt: string
}

interface NewsPostItem {
  id: string
  title: string
  content: string
  imageUrl?: string
  isPublished: boolean
  authorId?: string
  author?: { id: string; name: string }
  createdAt: string
}

interface SystemModuleItem {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  route: string
  isEnabled: boolean
  isFree: boolean
  sortOrder: number
  isAccessible?: boolean
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
  deleteReport: (id: string) => Promise<void>

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

  // Creatives
  creatives: Creative[]
  creativesLoading: boolean
  creativesStats: { total: number; byType: Record<string, number>; favorites: number }
  fetchCreatives: (filters?: any) => Promise<void>
  addCreative: (data: any) => Promise<Creative | null>
  updateCreative: (id: string, updates: any) => Promise<void>
  deleteCreative: (id: string) => Promise<void>
  toggleCreativeFavorite: (id: string) => Promise<void>

  // Art Templates
  artTemplates: ArtTemplate[]
  artTemplatesLoading: boolean
  fetchArtTemplates: (filters?: any) => Promise<void>

  // Conversations (Messages/CRM)
  conversations: Conversation[]
  conversationsLoading: boolean
  fetchConversations: (platform?: string) => Promise<void>
  sendMessage: (conversationId: string, content: string) => Promise<void>

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

  // Financial Entries
  financialEntries: FinancialEntry[]
  financialEntriesLoading: boolean
  fetchFinancialEntries: (filters?: any) => Promise<void>
  addFinancialEntry: (data: any) => Promise<FinancialEntry | null>
  removeFinancialEntry: (id: string) => Promise<void>

  // Client Tasks
  clientTasks: ClientTask[]
  clientTasksLoading: boolean
  fetchClientTasks: (clientId?: string) => Promise<void>
  addClientTask: (data: any) => Promise<ClientTask | null>
  toggleClientTask: (id: string) => Promise<void>
  removeClientTask: (id: string) => Promise<void>

  // Budget Strategies
  budgetStrategies: BudgetStrategyItem[]
  budgetStrategiesLoading: boolean
  fetchBudgetStrategies: (clientId?: string) => Promise<void>
  addBudgetStrategy: (data: any) => Promise<BudgetStrategyItem | null>
  updateBudgetStrategy: (id: string, data: any) => Promise<void>
  removeBudgetStrategy: (id: string) => Promise<void>

  // Budget Campaigns
  budgetCampaigns: BudgetCampaignItem[]
  budgetCampaignsLoading: boolean
  fetchBudgetCampaigns: (filters?: any) => Promise<void>
  addBudgetCampaign: (data: any) => Promise<BudgetCampaignItem | null>
  updateBudgetCampaign: (id: string, data: any) => Promise<void>
  removeBudgetCampaign: (id: string) => Promise<void>

  // News
  newsPosts: NewsPostItem[]
  newsPostsLoading: boolean
  fetchNewsPosts: () => Promise<void>

  // Modules
  modules: SystemModuleItem[]
  modulesLoading: boolean
  fetchModules: () => Promise<void>

  // Accessible modules (based on packages)
  accessibleModules: string[]
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

  const [creatives, setCreatives] = useState<Creative[]>([])
  const [creativesLoading, setCreativesLoading] = useState(false)
  const [creativesStats, setCreativesStats] = useState<{ total: number; byType: Record<string, number>; favorites: number }>({
    total: 0,
    byType: {},
    favorites: 0,
  })

  const [artTemplates, setArtTemplates] = useState<ArtTemplate[]>([])
  const [artTemplatesLoading, setArtTemplatesLoading] = useState(false)

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(false)

  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>([])
  const [financialEntriesLoading, setFinancialEntriesLoading] = useState(false)

  const [clientTasks, setClientTasks] = useState<ClientTask[]>([])
  const [clientTasksLoading, setClientTasksLoading] = useState(false)

  const [budgetStrategies, setBudgetStrategies] = useState<BudgetStrategyItem[]>([])
  const [budgetStrategiesLoading, setBudgetStrategiesLoading] = useState(false)

  const [budgetCampaigns, setBudgetCampaigns] = useState<BudgetCampaignItem[]>([])
  const [budgetCampaignsLoading, setBudgetCampaignsLoading] = useState(false)

  const [newsPosts, setNewsPosts] = useState<NewsPostItem[]>([])
  const [newsPostsLoading, setNewsPostsLoading] = useState(false)

  const [modules, setModules] = useState<SystemModuleItem[]>([])
  const [modulesLoading, setModulesLoading] = useState(false)
  const [accessibleModules, setAccessibleModules] = useState<string[]>([])

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
      const error = await response.json().catch(() => ({ error: 'Erro de conexão' }))
      throw new Error(error.error || 'Erro na requisição')
    }

    return response.json()
  }, [])

  // Helper para converter dateRange string para parametros de data
  const getDateParams = useCallback((rangeString: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(today)
    end.setHours(23, 59, 59, 999)
    let start = new Date(today)

    switch (rangeString) {
      case 'Hoje': break
      case 'Ontem':
        start.setDate(start.getDate() - 1)
        end.setDate(end.getDate() - 1)
        break
      case 'Ultimos 7 dias':
      case 'Últimos 7 dias':
        start.setDate(start.getDate() - 7)
        break
      case 'Ultimos 30 dias':
      case 'Últimos 30 dias':
        start.setDate(start.getDate() - 30)
        break
      case 'Este mes':
      case 'Este mês':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'Mes passado':
      case 'Mês passado':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end.setDate(0)
        break
      case 'Ultimos 90 dias':
      case 'Últimos 90 dias':
        start.setDate(start.getDate() - 90)
        break
      case 'Este ano':
        start = new Date(now.getFullYear(), 0, 1)
        break
      default:
        start.setDate(start.getDate() - 30)
    }

    const formatDate = (d: Date) => d.toISOString().split('T')[0]
    return `startDate=${formatDate(start)}&endDate=${formatDate(end)}`
  }, [])

  // === CAMPAIGNS ===
  const fetchCampaigns = useCallback(async () => {
    if (!isAuthenticated) return
    setCampaignsLoading(true)
    try {
      // Campanhas não são filtradas por data, apenas por conta
      const accountParam = selectedAccount !== 'all' ? `?accountId=${selectedAccount}` : ''
      const data = await api(`/api/campaigns${accountParam}`)
      setCampaigns(data.campaigns || [])
    } catch (error: any) {
    } finally {
      setCampaignsLoading(false)
    }
  }, [api, isAuthenticated, selectedAccount])

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
      showToast('Relatório gerado com sucesso!', 'success')
      await fetchReports()
      return data.report
    } catch (error: any) {
      showToast(error.message || 'Erro ao gerar relatório', 'error')
      return null
    }
  }, [api, fetchReports, showToast])

  const deleteReport = useCallback(async (id: string) => {
    try {
      await api(`/api/reports/${id}`, { method: 'DELETE' })
      setReports(prev => prev.filter(r => r.id !== id))
      showToast('Relatório removido!', 'info')
    } catch (error: any) {
      showToast(error.message || 'Erro ao remover relatório', 'error')
    }
  }, [api, showToast])

  // === AUTOMATIONS ===
  const fetchAutomations = useCallback(async () => {
    if (!isAuthenticated) return
    setAutomationsLoading(true)
    try {
      const data = await api('/api/automations')
      setAutomations(data.automations || [])
    } catch (error: any) {
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
      showToast('Automação criada com sucesso!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar automação', 'error')
    }
  }, [api, showToast])

  const updateAutomation = useCallback(async (id: string, updates: any) => {
    try {
      const data = await api(`/api/automations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })
      setAutomations(prev => prev.map(a => a.id === id ? data.automation : a))
      showToast('Automação atualizada!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar automação', 'error')
    }
  }, [api, showToast])

  const deleteAutomation = useCallback(async (id: string) => {
    try {
      await api(`/api/automations/${id}`, { method: 'DELETE' })
      setAutomations(prev => prev.filter(a => a.id !== id))
      showToast('Automação removida!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao remover automação', 'error')
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
      showToast('Status da automação alterado!', 'info')
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
    showToast('Todas notificações marcadas como lidas!', 'info')
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

      showToast('Redirecionando para autenticação...', 'info')
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

  // === CREATIVES ===
  const fetchCreatives = useCallback(async (filters?: any) => {
    if (!isAuthenticated) return
    setCreativesLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.platform) params.append('platform', filters.platform)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.favorite) params.append('favorite', 'true')

      const data = await api(`/api/creatives?${params.toString()}`)
      setCreatives(data.creatives || [])
      setCreativesStats(data.stats || { total: 0, byType: {}, favorites: 0 })
    } catch (error: any) {
    } finally {
      setCreativesLoading(false)
    }
  }, [api, isAuthenticated])

  const addCreative = useCallback(async (creativeData: any): Promise<Creative | null> => {
    try {
      const data = await api('/api/creatives', {
        method: 'POST',
        body: JSON.stringify(creativeData),
      })
      setCreatives(prev => [data.creative, ...prev])
      showToast('Criativo salvo com sucesso!', 'success')
      return data.creative
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar criativo', 'error')
      return null
    }
  }, [api, showToast])

  const updateCreative = useCallback(async (id: string, updates: any) => {
    try {
      const data = await api(`/api/creatives/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })
      setCreatives(prev => prev.map(c => c.id === id ? data.creative : c))
      showToast('Criativo atualizado!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar criativo', 'error')
    }
  }, [api, showToast])

  const deleteCreative = useCallback(async (id: string) => {
    try {
      await api(`/api/creatives/${id}`, { method: 'DELETE' })
      setCreatives(prev => prev.filter(c => c.id !== id))
      showToast('Criativo removido!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao remover criativo', 'error')
    }
  }, [api, showToast])

  const toggleCreativeFavorite = useCallback(async (id: string) => {
    const creative = creatives.find(c => c.id === id)
    if (!creative) return

    try {
      await api(`/api/creatives/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isFavorite: !creative.isFavorite }),
      })
      setCreatives(prev => prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
      showToast(creative.isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos', 'info')
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar favorito', 'error')
    }
  }, [api, creatives, showToast])

  // === ART TEMPLATES ===
  const fetchArtTemplates = useCallback(async (filters?: any) => {
    if (!isAuthenticated) return
    setArtTemplatesLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters?.niche) params.append('niche', filters.niche)
      if (filters?.type) params.append('type', filters.type)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.new) params.append('new', 'true')
      if (filters?.premium) params.append('premium', 'true')

      const data = await api(`/api/art-templates?${params.toString()}`)
      setArtTemplates(data.templates || [])
    } catch (error: any) {
    } finally {
      setArtTemplatesLoading(false)
    }
  }, [api, isAuthenticated])

  // === CONVERSATIONS ===
  const fetchConversations = useCallback(async (platform?: string) => {
    if (!isAuthenticated) return
    setConversationsLoading(true)
    try {
      const params = platform ? `?platform=${platform}` : ''
      const data = await api(`/api/conversations${params}`)
      setConversations(data.conversations || [])
    } catch (error: any) {
    } finally {
      setConversationsLoading(false)
    }
  }, [api, isAuthenticated])

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    try {
      const data = await api(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content, type: 'TEXT' }),
      })

      // Update the conversation with the new message
      setConversations(prev => prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: content,
            lastMessageAt: new Date().toISOString(),
            messages: [...(c.messages || []), data.message],
          }
        }
        return c
      }))
    } catch (error: any) {
      showToast(error.message || 'Erro ao enviar mensagem', 'error')
    }
  }, [api, showToast])

  // === FINANCIAL ENTRIES ===
  const fetchFinancialEntries = useCallback(async (filters?: any) => {
    if (!isAuthenticated) return
    setFinancialEntriesLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.clientId) params.append('clientId', filters.clientId)
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      const data = await api(`/api/financial-entries?${params.toString()}`)
      setFinancialEntries(data.entries || [])
    } catch (error: any) {
    } finally {
      setFinancialEntriesLoading(false)
    }
  }, [api, isAuthenticated])

  const addFinancialEntry = useCallback(async (entryData: any): Promise<FinancialEntry | null> => {
    try {
      const data = await api('/api/financial-entries', {
        method: 'POST',
        body: JSON.stringify(entryData),
      })
      setFinancialEntries(prev => [data.entry, ...prev])
      showToast('Lançamento criado com sucesso!', 'success')
      return data.entry
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar lançamento', 'error')
      return null
    }
  }, [api, showToast])

  const removeFinancialEntry = useCallback(async (id: string) => {
    try {
      await api(`/api/financial-entries/${id}`, { method: 'DELETE' })
      setFinancialEntries(prev => prev.filter(e => e.id !== id))
      showToast('Lançamento removido!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao remover lançamento', 'error')
    }
  }, [api, showToast])

  // === CLIENT TASKS ===
  const fetchClientTasks = useCallback(async (clientId?: string) => {
    if (!isAuthenticated) return
    setClientTasksLoading(true)
    try {
      const params = clientId ? `?clientId=${clientId}` : ''
      const data = await api(`/api/client-tasks${params}`)
      setClientTasks(data.tasks || [])
    } catch (error: any) {
    } finally {
      setClientTasksLoading(false)
    }
  }, [api, isAuthenticated])

  const addClientTask = useCallback(async (taskData: any): Promise<ClientTask | null> => {
    try {
      const data = await api('/api/client-tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      })
      setClientTasks(prev => [data.task, ...prev])
      showToast('Tarefa criada com sucesso!', 'success')
      return data.task
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar tarefa', 'error')
      return null
    }
  }, [api, showToast])

  const toggleClientTask = useCallback(async (id: string) => {
    const task = clientTasks.find(t => t.id === id)
    if (!task) return
    try {
      await api(`/api/client-tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: !task.completed }),
      })
      setClientTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
      showToast(task.completed ? 'Tarefa reaberta' : 'Tarefa concluída!', 'info')
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar tarefa', 'error')
    }
  }, [api, clientTasks, showToast])

  const removeClientTask = useCallback(async (id: string) => {
    try {
      await api(`/api/client-tasks/${id}`, { method: 'DELETE' })
      setClientTasks(prev => prev.filter(t => t.id !== id))
      showToast('Tarefa removida!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao remover tarefa', 'error')
    }
  }, [api, showToast])

  // === BUDGET STRATEGIES ===
  const fetchBudgetStrategies = useCallback(async (clientId?: string) => {
    if (!isAuthenticated) return
    setBudgetStrategiesLoading(true)
    try {
      const params = clientId ? `?clientId=${clientId}` : ''
      const data = await api(`/api/budget-strategies${params}`)
      setBudgetStrategies(data.strategies || [])
    } catch (error: any) {
    } finally {
      setBudgetStrategiesLoading(false)
    }
  }, [api, isAuthenticated])

  const addBudgetStrategy = useCallback(async (strategyData: any): Promise<BudgetStrategyItem | null> => {
    try {
      const data = await api('/api/budget-strategies', {
        method: 'POST',
        body: JSON.stringify(strategyData),
      })
      setBudgetStrategies(prev => [data.strategy, ...prev])
      showToast('Estratégia criada com sucesso!', 'success')
      return data.strategy
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar estratégia', 'error')
      return null
    }
  }, [api, showToast])

  const updateBudgetStrategy = useCallback(async (id: string, updateData: any) => {
    try {
      const data = await api(`/api/budget-strategies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      })
      setBudgetStrategies(prev => prev.map(s => s.id === id ? data.strategy : s))
      showToast('Estratégia atualizada!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar estratégia', 'error')
    }
  }, [api, showToast])

  const removeBudgetStrategy = useCallback(async (id: string) => {
    try {
      await api(`/api/budget-strategies/${id}`, { method: 'DELETE' })
      setBudgetStrategies(prev => prev.filter(s => s.id !== id))
      showToast('Estratégia removida!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao remover estratégia', 'error')
    }
  }, [api, showToast])

  // === BUDGET CAMPAIGNS ===
  const fetchBudgetCampaigns = useCallback(async (filters?: any) => {
    if (!isAuthenticated) return
    setBudgetCampaignsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters?.clientId) params.append('clientId', filters.clientId)
      if (filters?.strategyId) params.append('strategyId', filters.strategyId)
      const data = await api(`/api/budget-campaigns?${params.toString()}`)
      setBudgetCampaigns(data.campaigns || [])
    } catch (error: any) {
    } finally {
      setBudgetCampaignsLoading(false)
    }
  }, [api, isAuthenticated])

  const addBudgetCampaign = useCallback(async (campaignData: any): Promise<BudgetCampaignItem | null> => {
    try {
      const data = await api('/api/budget-campaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData),
      })
      setBudgetCampaigns(prev => [data.campaign, ...prev])
      showToast('Campanha de orçamento criada!', 'success')
      return data.campaign
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar campanha', 'error')
      return null
    }
  }, [api, showToast])

  const updateBudgetCampaign = useCallback(async (id: string, updates: any) => {
    try {
      const data = await api(`/api/budget-campaigns/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })
      setBudgetCampaigns(prev => prev.map(c => c.id === id ? data.campaign : c))
      showToast('Campanha atualizada!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar campanha', 'error')
    }
  }, [api, showToast])

  const removeBudgetCampaign = useCallback(async (id: string) => {
    try {
      await api(`/api/budget-campaigns/${id}`, { method: 'DELETE' })
      setBudgetCampaigns(prev => prev.filter(c => c.id !== id))
      showToast('Campanha removida!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erro ao remover campanha', 'error')
    }
  }, [api, showToast])

  // === NEWS POSTS ===
  const fetchNewsPosts = useCallback(async () => {
    setNewsPostsLoading(true)
    try {
      const data = await api('/api/news')
      setNewsPosts(data.posts || [])
    } catch (error: any) {
    } finally {
      setNewsPostsLoading(false)
    }
  }, [api])

  // === MODULES ===
  const fetchModules = useCallback(async () => {
    setModulesLoading(true)
    try {
      const data = await api('/api/modules')
      const mods = data.modules || []
      setModules(mods)
      // Extract accessible module slugs from isAccessible flag
      const accessible = mods
        .filter((m: SystemModuleItem) => m.isAccessible)
        .map((m: SystemModuleItem) => m.slug)
      setAccessibleModules(accessible)
    } catch (error: any) {
    } finally {
      setModulesLoading(false)
    }
  }, [api])

  // === INITIAL DATA LOAD ===
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true)
      Promise.all([
        fetchCampaigns(),
        fetchIntegrations(),
        fetchNotifications(),
        fetchLeads(),
        fetchModules(),
      ]).finally(() => {
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, fetchCampaigns, fetchIntegrations, fetchNotifications, fetchLeads, fetchModules])

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
      creatives,
      creativesLoading,
      creativesStats,
      fetchCreatives,
      addCreative,
      updateCreative,
      deleteCreative,
      toggleCreativeFavorite,
      artTemplates,
      artTemplatesLoading,
      fetchArtTemplates,
      conversations,
      conversationsLoading,
      fetchConversations,
      sendMessage,
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
      financialEntries,
      financialEntriesLoading,
      fetchFinancialEntries,
      addFinancialEntry,
      removeFinancialEntry,
      clientTasks,
      clientTasksLoading,
      fetchClientTasks,
      addClientTask,
      toggleClientTask,
      removeClientTask,
      budgetStrategies,
      budgetStrategiesLoading,
      fetchBudgetStrategies,
      addBudgetStrategy,
      updateBudgetStrategy,
      removeBudgetStrategy,
      budgetCampaigns,
      budgetCampaignsLoading,
      fetchBudgetCampaigns,
      addBudgetCampaign,
      updateBudgetCampaign,
      removeBudgetCampaign,
      newsPosts,
      newsPostsLoading,
      fetchNewsPosts,
      modules,
      modulesLoading,
      fetchModules,
      accessibleModules,
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
