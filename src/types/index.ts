export type Platform = 'meta' | 'google' | 'tiktok' | 'linkedin' | 'twitter' | 'pinterest'

export type CampaignStatus = 'active' | 'paused' | 'ended' | 'draft' | 'error'

export type CampaignObjective =
  | 'awareness'
  | 'traffic'
  | 'engagement'
  | 'leads'
  | 'sales'
  | 'app_installs'

export interface Campaign {
  id: string
  name: string
  platform: Platform
  status: CampaignStatus
  objective: CampaignObjective
  budget: number
  spent: number
  startDate: string
  endDate?: string
  metrics: CampaignMetrics
  adSets: AdSet[]
  createdAt: string
  updatedAt: string
  integrationId?: string
  integration?: {
    id: string
    name: string
    platform: string
  }
}

export interface CampaignMetrics {
  impressions: number
  reach: number
  clicks: number
  ctr: number
  cpc: number
  cpm: number
  conversions: number
  conversionRate: number
  costPerConversion: number
  roas: number
  frequency: number
  engagement: number
  videoViews?: number
  videoCompletionRate?: number
}

export interface AdSet {
  id: string
  campaignId: string
  name: string
  status: CampaignStatus
  budget: number
  spent: number
  targeting: Targeting
  metrics: CampaignMetrics
  ads: Ad[]
}

export interface Ad {
  id: string
  adSetId: string
  name: string
  status: CampaignStatus
  creative: Creative
  metrics: CampaignMetrics
}

export interface Creative {
  id: string
  type: 'image' | 'video' | 'carousel' | 'collection'
  headline: string
  description: string
  callToAction: string
  mediaUrl: string
  thumbnailUrl?: string
}

export interface Targeting {
  locations: string[]
  ageMin: number
  ageMax: number
  genders: ('male' | 'female' | 'all')[]
  interests: string[]
  behaviors: string[]
  customAudiences: string[]
  lookalikes: string[]
  placements: string[]
}

export interface DashboardMetrics {
  totalSpent: number
  totalBudget: number
  totalImpressions: number
  totalClicks: number
  totalConversions: number
  totalRevenue: number
  avgCtr: number
  avgCpc: number
  avgRoas: number
  activeCampaigns: number
  previousPeriod: {
    totalSpent: number
    totalImpressions: number
    totalClicks: number
    totalConversions: number
    totalRevenue: number
  }
}

export interface PlatformMetrics {
  platform: Platform
  spent: number
  impressions: number
  clicks: number
  conversions: number
  roas: number
  campaigns: number
  [key: string]: string | number
}

export interface TimeSeriesData {
  date: string
  impressions: number
  clicks: number
  conversions: number
  spent: number
  revenue: number
  [key: string]: string | number
}

export interface AudienceInsight {
  segment: string
  value: number
  percentage: number
  [key: string]: string | number
}

export interface Report {
  id: string
  name: string
  type: 'performance' | 'audience' | 'creative' | 'custom'
  frequency: 'daily' | 'weekly' | 'monthly' | 'once' | 'custom'
  recipients: string[]
  platforms: string[]
  metrics: string[]
  dateRange: {
    start: string
    end: string
  }
  lastGenerated?: string
  generatedCount?: number
  status: 'active' | 'paused' | 'archived'
  sendMethod?: string
  reportData?: {
    aggregatedMetrics?: {
      impressions?: number
      clicks?: number
      ctr?: number
      cpc?: number
      conversions?: number
      spent?: number
      roas?: number
      cpa?: number
      reach?: number
      leads?: number
    }
    dailyData?: Array<{
      date: string
      impressions: number
      clicks: number
      conversions: number
      spent: number
    }>
    campaignData?: Array<{
      name: string
      status: string
      impressions: number
      clicks: number
      conversions: number
      spent: number
    }>
    totalCampaigns?: number
    generatedAt?: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface Automation {
  id: string
  name: string
  type: 'rule' | 'schedule' | 'trigger'
  status: 'active' | 'paused'
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  lastTriggered?: string
  triggerCount: number
}

export interface AutomationCondition {
  metric: string
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  value: number
  timeframe: 'hour' | 'day' | 'week'
}

export interface AutomationAction {
  type: 'pause' | 'activate' | 'adjust_budget' | 'adjust_bid' | 'notify'
  value?: number
  target: 'campaign' | 'adset' | 'ad'
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'manager' | 'viewer'
  accounts: ConnectedAccount[]
}

export interface ConnectedAccount {
  id: string
  platform: Platform
  name: string
  accountId: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: string
}

export interface Notification {
  id: string
  type: 'alert' | 'info' | 'success' | 'warning'
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
}

// Orçamentos / Quotes
export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'

export interface QuoteService {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface QuoteClient {
  name: string
  email: string
  phone?: string
  company?: string
  document?: string // CPF/CNPJ
}

export interface Quote {
  id: string
  number: string // Ex: ORC-2024-001
  client: QuoteClient
  services: QuoteService[]
  subtotal: number
  discount: number
  discountType: 'percent' | 'fixed'
  total: number
  validUntil: string
  notes?: string
  paymentTerms?: string
  status: QuoteStatus
  createdAt: string
  updatedAt: string
  sentAt?: string
  viewedAt?: string
  respondedAt?: string
}

export interface ServiceTemplate {
  id: string
  name: string
  description: string
  defaultPrice: number
  category: string
}
