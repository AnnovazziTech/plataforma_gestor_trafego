// Google Ads API Integration
// Documentacao: https://developers.google.com/google-ads/api/docs

const GOOGLE_ADS_API_VERSION = 'v15'
const GOOGLE_ADS_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`

interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
}

interface GoogleAdAccount {
  resourceName: string
  id: string
  descriptiveName: string
  currencyCode: string
  timeZone: string
}

interface GoogleCampaign {
  resourceName: string
  id: string
  name: string
  status: string
  advertisingChannelType: string
  campaignBudget: string
  startDate: string
  endDate?: string
}

/**
 * Gerar URL de OAuth do Google
 */
export function getGoogleOAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    state,
    scope: 'https://www.googleapis.com/auth/adwords',
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

/**
 * Trocar codigo por tokens
 */
export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error_description || 'Erro ao obter token do Google')
  }

  const data: GoogleTokenResponse = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token!,
    expiresIn: data.expires_in,
  }
}

/**
 * Renovar access token usando refresh token
 */
export async function refreshGoogleToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error('Erro ao renovar token do Google')
  }

  const data: GoogleTokenResponse = await response.json()

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  }
}

/**
 * Fazer requisicao para Google Ads API
 */
async function googleAdsRequest(
  accessToken: string,
  customerId: string,
  query: string
): Promise<any> {
  const response = await fetch(
    `${GOOGLE_ADS_BASE_URL}/customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_DEVELOPER_TOKEN!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Erro na API do Google Ads')
  }

  return response.json()
}

/**
 * Listar contas de anuncio acessiveis
 */
export async function getGoogleAdAccounts(
  accessToken: string
): Promise<GoogleAdAccount[]> {
  const response = await fetch(
    `${GOOGLE_ADS_BASE_URL}/customers:listAccessibleCustomers`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_DEVELOPER_TOKEN!,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Erro ao listar contas do Google Ads')
  }

  const data = await response.json()
  const accounts: GoogleAdAccount[] = []

  // Para cada customer ID, buscar detalhes
  for (const resourceName of data.resourceNames || []) {
    const customerId = resourceName.replace('customers/', '')
    try {
      const details = await googleAdsRequest(
        accessToken,
        customerId,
        `SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer LIMIT 1`
      )

      if (details[0]?.results?.[0]?.customer) {
        const customer = details[0].results[0].customer
        accounts.push({
          resourceName,
          id: customer.id,
          descriptiveName: customer.descriptiveName,
          currencyCode: customer.currencyCode,
          timeZone: customer.timeZone,
        })
      }
    } catch (e) {
      // Conta pode nao ter acesso, ignorar
    }
  }

  return accounts
}

/**
 * Listar campanhas de uma conta
 */
export async function getGoogleCampaigns(
  accessToken: string,
  customerId: string
): Promise<GoogleCampaign[]> {
  const query = `
    SELECT
      campaign.resource_name,
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign.campaign_budget,
      campaign.start_date,
      campaign.end_date
    FROM campaign
    WHERE campaign.status != 'REMOVED'
    ORDER BY campaign.id DESC
    LIMIT 100
  `

  const data = await googleAdsRequest(accessToken, customerId, query)

  return (data[0]?.results || []).map((row: any) => ({
    resourceName: row.campaign.resourceName,
    id: row.campaign.id,
    name: row.campaign.name,
    status: row.campaign.status,
    advertisingChannelType: row.campaign.advertisingChannelType,
    campaignBudget: row.campaign.campaignBudget,
    startDate: row.campaign.startDate,
    endDate: row.campaign.endDate,
  }))
}

/**
 * Obter metricas de campanha
 */
export async function getGoogleCampaignMetrics(
  accessToken: string,
  customerId: string,
  campaignId: string,
  startDate: string,
  endDate: string
): Promise<any> {
  const query = `
    SELECT
      campaign.id,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.ctr,
      metrics.average_cpc,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE campaign.id = ${campaignId}
      AND segments.date BETWEEN '${startDate}' AND '${endDate}'
  `

  const data = await googleAdsRequest(accessToken, customerId, query)
  const row = data[0]?.results?.[0]

  if (!row) return null

  return {
    impressions: parseInt(row.metrics.impressions || '0'),
    clicks: parseInt(row.metrics.clicks || '0'),
    spent: parseInt(row.metrics.costMicros || '0') / 1000000,
    ctr: parseFloat(row.metrics.ctr || '0'),
    cpc: parseInt(row.metrics.averageCpc || '0') / 1000000,
    conversions: parseFloat(row.metrics.conversions || '0'),
    conversionValue: parseFloat(row.metrics.conversionsValue || '0'),
  }
}

/**
 * Mapear status do Google para nosso sistema
 */
export function mapGoogleStatus(googleStatus: string): string {
  const mapping: Record<string, string> = {
    ENABLED: 'ACTIVE',
    PAUSED: 'PAUSED',
    REMOVED: 'ARCHIVED',
  }

  return mapping[googleStatus] || 'DRAFT'
}

/**
 * Mapear tipo de canal para objetivo
 */
export function mapGoogleChannelToObjective(channel: string): string {
  const mapping: Record<string, string> = {
    SEARCH: 'TRAFFIC',
    DISPLAY: 'AWARENESS',
    SHOPPING: 'SALES',
    VIDEO: 'VIDEO_VIEWS',
    MULTI_CHANNEL: 'CONVERSIONS',
    PERFORMANCE_MAX: 'CONVERSIONS',
    SMART: 'CONVERSIONS',
  }

  return mapping[channel] || 'CONVERSIONS'
}
