// API Route: Sincronizacao de Campanhas
// POST - Sincronizar campanhas de uma integracao

export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog } from '@/lib/api/middleware'
import { decrypt } from '@/lib/crypto/encryption'
import {
  getMetaCampaigns,
  getMetaCampaignInsights,
  mapMetaObjective,
  mapMetaStatus,
  parseMetaInsights,
} from '@/lib/integrations/meta'
import {
  getGoogleCampaigns,
  getGoogleCampaignMetrics,
  mapGoogleStatus,
  mapGoogleChannelToObjective,
  refreshGoogleToken,
} from '@/lib/integrations/google'
import {
  getTikTokCampaigns,
  getTikTokCampaignMetrics,
  mapTikTokObjective,
  mapTikTokStatus,
} from '@/lib/integrations/tiktok'

const syncSchema = z.object({
  integrationId: z.string(),
})

export const POST = withAuth(async (req, ctx) => {
  try {
    const body = await req.json()
    const { integrationId } = syncSchema.parse(body)

    // Buscar integracao
    const integration = await prisma.integration.findFirst({
      where: {
        id: integrationId,
        organizationId: ctx.organizationId,
        status: 'CONNECTED',
      },
      include: {
        adAccounts: true,
      },
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'Integracao nao encontrada ou nao conectada' },
        { status: 404 }
      )
    }

    // Descriptografar token
    let accessToken = decrypt(integration.accessToken)

    // Verificar se token expirou e renovar se necessario (Google)
    if (integration.platform === 'GOOGLE' && integration.tokenExpiresAt) {
      if (new Date() >= integration.tokenExpiresAt && integration.refreshToken) {
        const refreshToken = decrypt(integration.refreshToken)
        const newTokens = await refreshGoogleToken(refreshToken)

        accessToken = newTokens.accessToken

        // Atualizar token no banco
        const { encrypt } = await import('@/lib/crypto/encryption')
        await prisma.integration.update({
          where: { id: integration.id },
          data: {
            accessToken: encrypt(newTokens.accessToken),
            tokenExpiresAt: new Date(Date.now() + newTokens.expiresIn * 1000),
          },
        })
      }
    }

    let syncedCampaigns = 0
    let syncedMetrics = 0

    // Sincronizar baseado na plataforma
    switch (integration.platform) {
      case 'META':
        for (const adAccount of integration.adAccounts) {
          const campaigns = await getMetaCampaigns(accessToken, adAccount.platformAdAccountId)

          for (const campaign of campaigns) {
            // Buscar ou criar campanha
            const existingCampaign = await prisma.campaign.findFirst({
              where: {
                organizationId: ctx.organizationId,
                platformCampaignId: campaign.id,
              },
            })

            const campaignData = {
              name: campaign.name,
              platform: 'META' as const,
              objective: mapMetaObjective(campaign.objective) as any,
              status: mapMetaStatus(campaign.status) as any,
              budget: parseFloat(campaign.daily_budget || campaign.lifetime_budget || '0') / 100,
              budgetType: campaign.daily_budget ? 'DAILY' as const : 'LIFETIME' as const,
              startDate: campaign.start_time ? new Date(campaign.start_time) : null,
              endDate: campaign.stop_time ? new Date(campaign.stop_time) : null,
              lastSyncAt: new Date(),
            }

            let savedCampaign
            if (existingCampaign) {
              savedCampaign = await prisma.campaign.update({
                where: { id: existingCampaign.id },
                data: campaignData,
              })
            } else {
              savedCampaign = await prisma.campaign.create({
                data: {
                  ...campaignData,
                  organizationId: ctx.organizationId,
                  integrationId: integration.id,
                  adAccountId: adAccount.id,
                  platformCampaignId: campaign.id,
                },
              })
            }

            syncedCampaigns++

            // Buscar metricas
            try {
              const insights = await getMetaCampaignInsights(accessToken, campaign.id)
              if (insights) {
                const periodStart = new Date()
                periodStart.setDate(periodStart.getDate() - 30)
                const periodEnd = new Date()

                // Parsear métricas usando a função expandida
                const parsedMetrics = parseMetaInsights(insights)

                // Calcular métricas derivadas
                const roas = parsedMetrics.spent > 0 ? parsedMetrics.purchaseValue / parsedMetrics.spent : 0
                const conversionRate = parsedMetrics.clicks > 0 ? (parsedMetrics.conversions / parsedMetrics.clicks) * 100 : 0
                const costPerConversion = parsedMetrics.conversions > 0 ? parsedMetrics.spent / parsedMetrics.conversions : 0
                const costPerLead = parsedMetrics.leads > 0 ? parsedMetrics.spent / parsedMetrics.leads : 0
                const costPerResult = parsedMetrics.conversions > 0 ? parsedMetrics.spent / parsedMetrics.conversions : 0
                const uniqueCtr = parsedMetrics.reach > 0 ? (parsedMetrics.uniqueClicks / parsedMetrics.reach) * 100 : 0
                const videoCompletionRate = parsedMetrics.videoViews > 0 ? (parsedMetrics.videoViewsP100 / parsedMetrics.videoViews) * 100 : 0

                const metricsData = {
                  // Alcance
                  impressions: parsedMetrics.impressions,
                  reach: parsedMetrics.reach,
                  frequency: parsedMetrics.frequency,
                  uniqueImpressions: parsedMetrics.reach, // Aproximação

                  // Cliques
                  clicks: parsedMetrics.clicks,
                  uniqueClicks: parsedMetrics.uniqueClicks,
                  linkClicks: parsedMetrics.linkClicks,
                  uniqueLinkClicks: parsedMetrics.uniqueLinkClicks,
                  outboundClicks: parsedMetrics.outboundClicks,
                  ctr: parsedMetrics.ctr,
                  uniqueCtr,

                  // Custo
                  spent: parsedMetrics.spent,
                  cpc: parsedMetrics.cpc,
                  cpm: parsedMetrics.cpm,
                  costPerResult,

                  // Engajamento
                  postEngagement: parsedMetrics.postEngagement,
                  pageEngagement: parsedMetrics.pageEngagement,
                  likes: parsedMetrics.likes,
                  comments: parsedMetrics.comments,
                  shares: parsedMetrics.shares,
                  saves: 0,
                  postReactions: parsedMetrics.postReactions,

                  // Video
                  videoViews: parsedMetrics.videoViews,
                  videoViewsP25: parsedMetrics.videoViewsP25,
                  videoViewsP50: parsedMetrics.videoViewsP50,
                  videoViewsP75: parsedMetrics.videoViewsP75,
                  videoViewsP100: parsedMetrics.videoViewsP100,
                  videoThruplay: parsedMetrics.videoThruplay,
                  videoAvgTimeWatched: 0, // Precisa de processamento adicional
                  videoCompletionRate,

                  // Conversao
                  conversions: parsedMetrics.conversions,
                  conversionRate,
                  costPerConversion,
                  leads: parsedMetrics.leads,
                  costPerLead,
                  purchases: parsedMetrics.purchases,
                  purchaseValue: parsedMetrics.purchaseValue,
                  addToCart: parsedMetrics.addToCart,
                  initiateCheckout: parsedMetrics.initiateCheckout,

                  // Retorno
                  roas,

                  // Landing Page
                  landingPageViews: parsedMetrics.landingPageViews,
                }

                await prisma.campaignMetrics.upsert({
                  where: {
                    campaignId_periodStart_periodEnd: {
                      campaignId: savedCampaign.id,
                      periodStart,
                      periodEnd,
                    },
                  },
                  create: {
                    campaignId: savedCampaign.id,
                    ...metricsData,
                    periodStart,
                    periodEnd,
                  },
                  update: metricsData,
                })

                // Atualizar spent na campanha
                await prisma.campaign.update({
                  where: { id: savedCampaign.id },
                  data: { spent: parsedMetrics.spent },
                })

                syncedMetrics++
              }
            } catch (e) {
              console.error(`Erro ao buscar insights da campanha ${campaign.id}:`, e)
            }
          }
        }
        break

      case 'GOOGLE':
        for (const adAccount of integration.adAccounts) {
          const campaigns = await getGoogleCampaigns(accessToken, adAccount.platformAdAccountId)

          for (const campaign of campaigns) {
            const existingCampaign = await prisma.campaign.findFirst({
              where: {
                organizationId: ctx.organizationId,
                platformCampaignId: campaign.id,
              },
            })

            const campaignData = {
              name: campaign.name,
              platform: 'GOOGLE' as const,
              objective: mapGoogleChannelToObjective(campaign.advertisingChannelType) as any,
              status: mapGoogleStatus(campaign.status) as any,
              budget: 0, // Precisa buscar do budget resource
              budgetType: 'DAILY' as const,
              startDate: campaign.startDate ? new Date(campaign.startDate) : null,
              endDate: campaign.endDate ? new Date(campaign.endDate) : null,
              lastSyncAt: new Date(),
            }

            let savedCampaign
            if (existingCampaign) {
              savedCampaign = await prisma.campaign.update({
                where: { id: existingCampaign.id },
                data: campaignData,
              })
            } else {
              savedCampaign = await prisma.campaign.create({
                data: {
                  ...campaignData,
                  organizationId: ctx.organizationId,
                  integrationId: integration.id,
                  adAccountId: adAccount.id,
                  platformCampaignId: campaign.id,
                },
              })
            }

            syncedCampaigns++
          }
        }
        break

      case 'TIKTOK':
        for (const adAccount of integration.adAccounts) {
          const campaigns = await getTikTokCampaigns(accessToken, adAccount.platformAdAccountId)

          for (const campaign of campaigns) {
            const existingCampaign = await prisma.campaign.findFirst({
              where: {
                organizationId: ctx.organizationId,
                platformCampaignId: campaign.campaign_id,
              },
            })

            const campaignData = {
              name: campaign.campaign_name,
              platform: 'TIKTOK' as const,
              objective: mapTikTokObjective(campaign.objective) as any,
              status: mapTikTokStatus(campaign.status) as any,
              budget: campaign.budget,
              budgetType: campaign.budget_mode === 'BUDGET_MODE_DAY' ? 'DAILY' as const : 'LIFETIME' as const,
              lastSyncAt: new Date(),
            }

            let savedCampaign
            if (existingCampaign) {
              savedCampaign = await prisma.campaign.update({
                where: { id: existingCampaign.id },
                data: campaignData,
              })
            } else {
              savedCampaign = await prisma.campaign.create({
                data: {
                  ...campaignData,
                  organizationId: ctx.organizationId,
                  integrationId: integration.id,
                  adAccountId: adAccount.id,
                  platformCampaignId: campaign.campaign_id,
                },
              })
            }

            syncedCampaigns++
          }
        }
        break
    }

    // Atualizar ultimo sync da integracao
    await prisma.integration.update({
      where: { id: integration.id },
      data: { lastSyncAt: new Date() },
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'campaigns.synced',
      entity: 'integration',
      entityId: integration.id,
      newData: { syncedCampaigns, syncedMetrics },
      request: req,
    })

    return NextResponse.json({
      success: true,
      syncedCampaigns,
      syncedMetrics,
      message: `Sincronizadas ${syncedCampaigns} campanhas e ${syncedMetrics} metricas`,
    })
  } catch (error) {
    console.error('Erro ao sincronizar campanhas:', error)
    return NextResponse.json(
      { error: 'Erro ao sincronizar campanhas' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })
