// Meta Ads API Integration (Facebook/Instagram)
// Documentacao: https://developers.facebook.com/docs/marketing-apis/

import { encrypt, decrypt } from '@/lib/crypto/encryption'

const META_API_VERSION = 'v18.0'
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

interface MetaTokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
}

interface MetaAdAccount {
  id: string
  name: string
  currency: string
  timezone_name: string
  account_status: number
}

interface MetaCampaign {
  id: string
  name: string
  status: string
  objective: string
  daily_budget?: string
  lifetime_budget?: string
  created_time: string
  start_time?: string
  stop_time?: string
}

interface MetaInsights {
  // Alcance
  impressions: string
  reach: string
  frequency?: string

  // Cliques
  clicks: string
  unique_clicks?: string
  inline_link_clicks?: string
  unique_inline_link_clicks?: string
  outbound_clicks?: Array<{ action_type: string; value: string }>

  // Custo
  spend: string
  ctr: string
  cpc: string
  cpm: string
  cost_per_unique_click?: string
  cost_per_inline_link_click?: string

  // Engajamento
  inline_post_engagement?: string
  page_engagement?: string
  post_reactions?: string

  // Video
  video_p25_watched_actions?: Array<{ action_type: string; value: string }>
  video_p50_watched_actions?: Array<{ action_type: string; value: string }>
  video_p75_watched_actions?: Array<{ action_type: string; value: string }>
  video_p100_watched_actions?: Array<{ action_type: string; value: string }>
  video_thruplay_watched_actions?: Array<{ action_type: string; value: string }>
  video_avg_time_watched_actions?: Array<{ action_type: string; value: string }>

  // Conversao
  conversions?: string
  actions?: Array<{ action_type: string; value: string }>
  action_values?: Array<{ action_type: string; value: string }>
  cost_per_action_type?: Array<{ action_type: string; value: string }>

  // Landing Page
  landing_page_views?: Array<{ action_type: string; value: string }>

  // Social
  social_spend?: string

  // Data
  date_start?: string
  date_stop?: string
}

// Lista completa de métricas para requisitar da Meta API
export const META_INSIGHTS_FIELDS = [
  // Alcance
  'impressions',
  'reach',
  'frequency',

  // Cliques
  'clicks',
  'unique_clicks',
  'inline_link_clicks',
  'unique_inline_link_clicks',
  'outbound_clicks',

  // Custo
  'spend',
  'ctr',
  'cpc',
  'cpm',
  'cost_per_unique_click',
  'cost_per_inline_link_click',

  // Engajamento
  'inline_post_engagement',
  'page_engagement',

  // Video
  'video_p25_watched_actions',
  'video_p50_watched_actions',
  'video_p75_watched_actions',
  'video_p100_watched_actions',
  'video_thruplay_watched_actions',
  'video_avg_time_watched_actions',

  // Conversao
  'conversions',
  'actions',
  'action_values',
  'cost_per_action_type',

  // Landing Page
  'landing_page_views',
]

/**
 * Gerar URL de OAuth do Meta
 */
export function getMetaOAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    state,
    scope: [
      'ads_management',
      'ads_read',
      'business_management',
      'pages_read_engagement',
      'pages_show_list',
      'instagram_basic',
      'instagram_manage_insights',
    ].join(','),
    response_type: 'code',
  })

  return `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?${params}`
}

/**
 * Trocar codigo por access token
 */
export async function exchangeMetaCode(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; expiresIn?: number }> {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: redirectUri,
    code,
  })

  const response = await fetch(
    `${META_BASE_URL}/oauth/access_token?${params}`
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Erro ao obter token do Meta')
  }

  const data: MetaTokenResponse = await response.json()

  // Trocar por token de longa duracao
  const longLivedToken = await getLongLivedToken(data.access_token)

  return {
    accessToken: longLivedToken.access_token,
    expiresIn: longLivedToken.expires_in,
  }
}

/**
 * Obter token de longa duracao (60 dias)
 */
async function getLongLivedToken(shortLivedToken: string): Promise<MetaTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: shortLivedToken,
  })

  const response = await fetch(
    `${META_BASE_URL}/oauth/access_token?${params}`
  )

  if (!response.ok) {
    throw new Error('Erro ao obter token de longa duracao')
  }

  return response.json()
}

/**
 * Listar contas de anuncio
 */
export async function getMetaAdAccounts(accessToken: string): Promise<MetaAdAccount[]> {
  const response = await fetch(
    `${META_BASE_URL}/me/adaccounts?fields=id,name,currency,timezone_name,account_status&access_token=${accessToken}`
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Erro ao listar contas de anuncio')
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Listar campanhas de uma conta
 */
export async function getMetaCampaigns(
  accessToken: string,
  adAccountId: string,
  limit: number = 100
): Promise<MetaCampaign[]> {
  const fields = [
    'id',
    'name',
    'status',
    'objective',
    'daily_budget',
    'lifetime_budget',
    'created_time',
    'start_time',
    'stop_time',
  ].join(',')

  const response = await fetch(
    `${META_BASE_URL}/${adAccountId}/campaigns?fields=${fields}&limit=${limit}&access_token=${accessToken}`
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Erro ao listar campanhas')
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Obter insights de uma campanha
 */
export async function getMetaCampaignInsights(
  accessToken: string,
  campaignId: string,
  datePreset: string = 'last_30d'
): Promise<MetaInsights | null> {
  const fields = META_INSIGHTS_FIELDS.join(',')

  const response = await fetch(
    `${META_BASE_URL}/${campaignId}/insights?fields=${fields}&date_preset=${datePreset}&access_token=${accessToken}`
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Erro ao obter insights')
  }

  const data = await response.json()
  return data.data?.[0] || null
}

/**
 * Obter insights diarios de uma campanha
 */
export async function getMetaCampaignDailyInsights(
  accessToken: string,
  campaignId: string,
  since: string,
  until: string
): Promise<MetaInsights[]> {
  const fields = META_INSIGHTS_FIELDS.join(',')

  const params = new URLSearchParams({
    fields,
    time_increment: '1',
    time_range: JSON.stringify({ since, until }),
    access_token: accessToken,
  })

  const response = await fetch(
    `${META_BASE_URL}/${campaignId}/insights?${params}`
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Erro ao obter insights diarios')
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Extrair valor de ação específica
 */
export function extractActionValue(
  actions: Array<{ action_type: string; value: string }> | undefined,
  actionType: string
): number {
  if (!actions) return 0
  const action = actions.find(a => a.action_type === actionType)
  return action ? parseInt(action.value) || 0 : 0
}

/**
 * Extrair valor monetário de ação específica
 */
export function extractActionMoneyValue(
  actionValues: Array<{ action_type: string; value: string }> | undefined,
  actionType: string
): number {
  if (!actionValues) return 0
  const action = actionValues.find(a => a.action_type === actionType)
  return action ? parseFloat(action.value) || 0 : 0
}

/**
 * Extrair contagem de video views por percentual
 */
export function extractVideoViews(
  videoActions: Array<{ action_type: string; value: string }> | undefined
): number {
  if (!videoActions || videoActions.length === 0) return 0
  return videoActions.reduce((sum, a) => sum + (parseInt(a.value) || 0), 0)
}

/**
 * Parsear métricas do Meta para nosso formato
 */
export function parseMetaInsights(insights: MetaInsights) {
  return {
    // Alcance
    impressions: parseInt(insights.impressions) || 0,
    reach: parseInt(insights.reach) || 0,
    frequency: parseFloat(insights.frequency || '0') || 0,

    // Cliques
    clicks: parseInt(insights.clicks) || 0,
    uniqueClicks: parseInt(insights.unique_clicks || '0') || 0,
    linkClicks: parseInt(insights.inline_link_clicks || '0') || 0,
    uniqueLinkClicks: parseInt(insights.unique_inline_link_clicks || '0') || 0,
    outboundClicks: extractActionValue(insights.outbound_clicks, 'outbound_click'),

    // Custo
    spent: parseFloat(insights.spend) || 0,
    ctr: parseFloat(insights.ctr) || 0,
    cpc: parseFloat(insights.cpc) || 0,
    cpm: parseFloat(insights.cpm) || 0,

    // Engajamento
    postEngagement: parseInt(insights.inline_post_engagement || '0') || 0,
    pageEngagement: parseInt(insights.page_engagement || '0') || 0,
    likes: extractActionValue(insights.actions, 'like'),
    comments: extractActionValue(insights.actions, 'comment'),
    shares: extractActionValue(insights.actions, 'post'),
    postReactions: extractActionValue(insights.actions, 'post_reaction'),

    // Video
    videoViews: extractVideoViews(insights.video_p25_watched_actions),
    videoViewsP25: extractVideoViews(insights.video_p25_watched_actions),
    videoViewsP50: extractVideoViews(insights.video_p50_watched_actions),
    videoViewsP75: extractVideoViews(insights.video_p75_watched_actions),
    videoViewsP100: extractVideoViews(insights.video_p100_watched_actions),
    videoThruplay: extractVideoViews(insights.video_thruplay_watched_actions),

    // Conversao
    conversions: parseInt(insights.conversions || '0') || extractActionValue(insights.actions, 'omni_complete_registration') + extractActionValue(insights.actions, 'purchase') + extractActionValue(insights.actions, 'lead'),
    leads: extractActionValue(insights.actions, 'lead') + extractActionValue(insights.actions, 'omni_complete_registration'),
    purchases: extractActionValue(insights.actions, 'purchase') + extractActionValue(insights.actions, 'omni_purchase'),
    purchaseValue: extractActionMoneyValue(insights.action_values, 'purchase') + extractActionMoneyValue(insights.action_values, 'omni_purchase'),
    addToCart: extractActionValue(insights.actions, 'add_to_cart') + extractActionValue(insights.actions, 'omni_add_to_cart'),
    initiateCheckout: extractActionValue(insights.actions, 'initiate_checkout') + extractActionValue(insights.actions, 'omni_initiated_checkout'),

    // Landing Page
    landingPageViews: extractVideoViews(insights.landing_page_views),
  }
}

/**
 * Verificar se token ainda e valido
 */
export async function validateMetaToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${META_BASE_URL}/me?access_token=${accessToken}`
    )
    return response.ok
  } catch {
    return false
  }
}

/**
 * Mapear objetivo do Meta para nosso sistema
 */
export function mapMetaObjective(metaObjective: string): string {
  const mapping: Record<string, string> = {
    OUTCOME_AWARENESS: 'AWARENESS',
    OUTCOME_ENGAGEMENT: 'ENGAGEMENT',
    OUTCOME_TRAFFIC: 'TRAFFIC',
    OUTCOME_LEADS: 'LEADS',
    OUTCOME_SALES: 'SALES',
    OUTCOME_APP_PROMOTION: 'APP_INSTALLS',
    BRAND_AWARENESS: 'AWARENESS',
    REACH: 'AWARENESS',
    LINK_CLICKS: 'TRAFFIC',
    POST_ENGAGEMENT: 'ENGAGEMENT',
    PAGE_LIKES: 'ENGAGEMENT',
    LEAD_GENERATION: 'LEADS',
    CONVERSIONS: 'CONVERSIONS',
    PRODUCT_CATALOG_SALES: 'SALES',
    MESSAGES: 'MESSAGES',
    VIDEO_VIEWS: 'VIDEO_VIEWS',
  }

  return mapping[metaObjective] || 'CONVERSIONS'
}

/**
 * Mapear status do Meta para nosso sistema
 */
export function mapMetaStatus(metaStatus: string): string {
  const mapping: Record<string, string> = {
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    DELETED: 'ARCHIVED',
    ARCHIVED: 'ARCHIVED',
    IN_PROCESS: 'PENDING',
    WITH_ISSUES: 'ERROR',
  }

  return mapping[metaStatus] || 'DRAFT'
}
