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
  impressions: string
  reach: string
  clicks: string
  spend: string
  ctr: string
  cpc: string
  cpm: string
  conversions?: string
  actions?: Array<{ action_type: string; value: string }>
}

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
  const fields = [
    'impressions',
    'reach',
    'clicks',
    'spend',
    'ctr',
    'cpc',
    'cpm',
    'actions',
    'conversions',
  ].join(',')

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
  const fields = [
    'impressions',
    'reach',
    'clicks',
    'spend',
    'ctr',
    'cpc',
    'cpm',
    'actions',
  ].join(',')

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
