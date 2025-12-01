// TikTok Ads API Integration
// Documentacao: https://business-api.tiktok.com/portal/docs

const TIKTOK_API_VERSION = 'v1.3'
const TIKTOK_BASE_URL = `https://business-api.tiktok.com/open_api/${TIKTOK_API_VERSION}`

interface TikTokTokenResponse {
  access_token: string
  advertiser_ids: string[]
  scope: string[]
}

interface TikTokAdAccount {
  advertiser_id: string
  advertiser_name: string
  currency: string
  timezone: string
  status: string
}

interface TikTokCampaign {
  campaign_id: string
  campaign_name: string
  objective: string
  status: string
  budget: number
  budget_mode: string
  create_time: string
}

interface TikTokCampaignMetrics {
  impressions: number
  clicks: number
  reach: number
  spend: number
  ctr: number
  cpc: number
  cpm: number
  conversions: number
  conversion_rate: number
  cost_per_conversion: number
}

/**
 * Gerar URL de OAuth do TikTok
 */
export function getTikTokOAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    app_id: process.env.TIKTOK_APP_ID!,
    redirect_uri: redirectUri,
    state,
    scope: JSON.stringify(['advertiser_read', 'advertiser_management']),
  })

  return `https://business-api.tiktok.com/portal/auth?${params}`
}

/**
 * Trocar codigo por access token
 */
export async function exchangeTikTokCode(
  code: string
): Promise<{ accessToken: string; advertiserIds: string[] }> {
  const response = await fetch(
    `${TIKTOK_BASE_URL}/oauth2/access_token/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: process.env.TIKTOK_APP_ID,
        secret: process.env.TIKTOK_APP_SECRET,
        auth_code: code,
      }),
    }
  )

  if (!response.ok) {
    throw new Error('Erro ao obter token do TikTok')
  }

  const data = await response.json()

  if (data.code !== 0) {
    throw new Error(data.message || 'Erro na autenticacao TikTok')
  }

  return {
    accessToken: data.data.access_token,
    advertiserIds: data.data.advertiser_ids || [],
  }
}

/**
 * Fazer requisicao autenticada para TikTok API
 */
async function tiktokRequest(
  endpoint: string,
  accessToken: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<any> {
  const url = `${TIKTOK_BASE_URL}${endpoint}`

  const options: RequestInit = {
    method,
    headers: {
      'Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  }

  if (body && method === 'POST') {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)
  const data = await response.json()

  if (data.code !== 0) {
    throw new Error(data.message || 'Erro na API do TikTok')
  }

  return data.data
}

/**
 * Obter informacoes da conta de anuncio
 */
export async function getTikTokAdAccount(
  accessToken: string,
  advertiserId: string
): Promise<TikTokAdAccount> {
  const data = await tiktokRequest(
    `/advertiser/info/?advertiser_ids=${JSON.stringify([advertiserId])}`,
    accessToken
  )

  const account = data.list?.[0]
  if (!account) {
    throw new Error('Conta de anuncio nao encontrada')
  }

  return {
    advertiser_id: account.advertiser_id,
    advertiser_name: account.advertiser_name,
    currency: account.currency,
    timezone: account.timezone,
    status: account.status,
  }
}

/**
 * Listar campanhas
 */
export async function getTikTokCampaigns(
  accessToken: string,
  advertiserId: string,
  page: number = 1,
  pageSize: number = 100
): Promise<TikTokCampaign[]> {
  const data = await tiktokRequest(
    '/campaign/get/',
    accessToken,
    'POST',
    {
      advertiser_id: advertiserId,
      page,
      page_size: pageSize,
      fields: [
        'campaign_id',
        'campaign_name',
        'objective',
        'status',
        'budget',
        'budget_mode',
        'create_time',
      ],
    }
  )

  return (data.list || []).map((campaign: any) => ({
    campaign_id: campaign.campaign_id,
    campaign_name: campaign.campaign_name,
    objective: campaign.objective,
    status: campaign.status,
    budget: campaign.budget,
    budget_mode: campaign.budget_mode,
    create_time: campaign.create_time,
  }))
}

/**
 * Obter metricas de campanha
 */
export async function getTikTokCampaignMetrics(
  accessToken: string,
  advertiserId: string,
  campaignId: string,
  startDate: string,
  endDate: string
): Promise<TikTokCampaignMetrics | null> {
  const data = await tiktokRequest(
    '/report/integrated/get/',
    accessToken,
    'POST',
    {
      advertiser_id: advertiserId,
      service_type: 'AUCTION',
      report_type: 'BASIC',
      data_level: 'AUCTION_CAMPAIGN',
      dimensions: ['campaign_id'],
      metrics: [
        'impressions',
        'clicks',
        'reach',
        'spend',
        'ctr',
        'cpc',
        'cpm',
        'conversions',
        'conversion_rate',
        'cost_per_conversion',
      ],
      filters: [
        {
          field_name: 'campaign_id',
          filter_type: 'IN',
          filter_value: JSON.stringify([campaignId]),
        },
      ],
      start_date: startDate,
      end_date: endDate,
    }
  )

  const row = data.list?.[0]?.metrics
  if (!row) return null

  return {
    impressions: parseInt(row.impressions || '0'),
    clicks: parseInt(row.clicks || '0'),
    reach: parseInt(row.reach || '0'),
    spend: parseFloat(row.spend || '0'),
    ctr: parseFloat(row.ctr || '0'),
    cpc: parseFloat(row.cpc || '0'),
    cpm: parseFloat(row.cpm || '0'),
    conversions: parseInt(row.conversions || '0'),
    conversion_rate: parseFloat(row.conversion_rate || '0'),
    cost_per_conversion: parseFloat(row.cost_per_conversion || '0'),
  }
}

/**
 * Obter metricas diarias de campanha
 */
export async function getTikTokCampaignDailyMetrics(
  accessToken: string,
  advertiserId: string,
  campaignId: string,
  startDate: string,
  endDate: string
): Promise<Array<TikTokCampaignMetrics & { date: string }>> {
  const data = await tiktokRequest(
    '/report/integrated/get/',
    accessToken,
    'POST',
    {
      advertiser_id: advertiserId,
      service_type: 'AUCTION',
      report_type: 'BASIC',
      data_level: 'AUCTION_CAMPAIGN',
      dimensions: ['campaign_id', 'stat_time_day'],
      metrics: [
        'impressions',
        'clicks',
        'reach',
        'spend',
        'ctr',
        'cpc',
        'cpm',
        'conversions',
      ],
      filters: [
        {
          field_name: 'campaign_id',
          filter_type: 'IN',
          filter_value: JSON.stringify([campaignId]),
        },
      ],
      start_date: startDate,
      end_date: endDate,
    }
  )

  return (data.list || []).map((row: any) => ({
    date: row.dimensions.stat_time_day,
    impressions: parseInt(row.metrics.impressions || '0'),
    clicks: parseInt(row.metrics.clicks || '0'),
    reach: parseInt(row.metrics.reach || '0'),
    spend: parseFloat(row.metrics.spend || '0'),
    ctr: parseFloat(row.metrics.ctr || '0'),
    cpc: parseFloat(row.metrics.cpc || '0'),
    cpm: parseFloat(row.metrics.cpm || '0'),
    conversions: parseInt(row.metrics.conversions || '0'),
    conversion_rate: 0,
    cost_per_conversion: 0,
  }))
}

/**
 * Mapear objetivo TikTok para nosso sistema
 */
export function mapTikTokObjective(tiktokObjective: string): string {
  const mapping: Record<string, string> = {
    REACH: 'AWARENESS',
    TRAFFIC: 'TRAFFIC',
    VIDEO_VIEWS: 'VIDEO_VIEWS',
    LEAD_GENERATION: 'LEADS',
    ENGAGEMENT: 'ENGAGEMENT',
    APP_PROMOTION: 'APP_INSTALLS',
    WEB_CONVERSIONS: 'CONVERSIONS',
    PRODUCT_SALES: 'SALES',
  }

  return mapping[tiktokObjective] || 'CONVERSIONS'
}

/**
 * Mapear status TikTok para nosso sistema
 */
export function mapTikTokStatus(tiktokStatus: string): string {
  const mapping: Record<string, string> = {
    CAMPAIGN_STATUS_ENABLE: 'ACTIVE',
    CAMPAIGN_STATUS_DISABLE: 'PAUSED',
    CAMPAIGN_STATUS_DELETE: 'ARCHIVED',
  }

  return mapping[tiktokStatus] || 'DRAFT'
}
