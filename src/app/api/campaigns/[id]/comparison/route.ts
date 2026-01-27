// API Route: Comparacao de Campanha (Ultimas 4 Semanas)
// GET - Buscar metricas semanais para comparacao

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { withAuth } from '@/lib/api/middleware'

interface WeeklyMetrics {
  week: number
  weekLabel: string
  startDate: string
  endDate: string
  impressions: number
  reach: number
  clicks: number
  ctr: number
  cpc: number
  cpm: number
  conversions: number
  spent: number
  roas: number
  daysWithData: number
}

interface ComparisonResponse {
  campaign: {
    id: string
    name: string
    platform: string
    status: string
    objective: string
  }
  weeks: WeeklyMetrics[]
  changes: {
    impressions: number
    clicks: number
    conversions: number
    spent: number
    ctr: number
    roas: number
  }
  analysis: {
    trend: 'improving' | 'stable' | 'declining'
    recommendation: 'scale' | 'maintain' | 'optimize' | 'pause'
    insights: string[]
  }
}

// Helper para calcular inicio/fim de cada semana
function getWeekBoundaries(weeksAgo: number): { start: Date; end: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()

  // Fim da semana (domingo anterior ou hoje se domingo)
  const endDate = new Date(now)
  endDate.setDate(now.getDate() - dayOfWeek - (weeksAgo * 7))
  endDate.setHours(23, 59, 59, 999)

  // Inicio da semana (segunda)
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - 6)
  startDate.setHours(0, 0, 0, 0)

  return { start: startDate, end: endDate }
}

// Helper para calcular variacao percentual
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Number((((current - previous) / previous) * 100).toFixed(2))
}

// Helper para formatar label da semana
function formatWeekLabel(start: Date, end: Date): string {
  const formatDate = (d: Date) => {
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    return `${day}/${month}`
  }
  return `${formatDate(start)} - ${formatDate(end)}`
}

// GET - Buscar comparacao de 4 semanas
export const GET = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/campaigns/')[1]?.split('/')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID da campanha obrigatorio' },
        { status: 400 }
      )
    }

    // Buscar campanha
    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        platform: true,
        status: true,
        objective: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campanha nao encontrada' },
        { status: 404 }
      )
    }

    // Buscar metricas das ultimas 4 semanas
    const weeks: WeeklyMetrics[] = []

    for (let i = 0; i < 4; i++) {
      const { start, end } = getWeekBoundaries(i)

      // Buscar metricas diarias desta semana
      const dailyMetrics = await prisma.campaignDailyMetrics.findMany({
        where: {
          campaignId: id,
          date: {
            gte: start,
            lte: end,
          },
        },
      })

      // Agregar metricas da semana
      const aggregated = dailyMetrics.reduce(
        (acc, day) => ({
          impressions: acc.impressions + day.impressions,
          reach: acc.reach + day.reach,
          clicks: acc.clicks + day.clicks,
          conversions: acc.conversions + day.conversions,
          spent: acc.spent + day.spent,
        }),
        { impressions: 0, reach: 0, clicks: 0, conversions: 0, spent: 0 }
      )

      // Calcular metricas derivadas
      const ctr = aggregated.impressions > 0
        ? Number(((aggregated.clicks / aggregated.impressions) * 100).toFixed(2))
        : 0
      const cpc = aggregated.clicks > 0
        ? Number((aggregated.spent / aggregated.clicks).toFixed(2))
        : 0
      const cpm = aggregated.impressions > 0
        ? Number(((aggregated.spent / aggregated.impressions) * 1000).toFixed(2))
        : 0

      // ROAS: considerando valor medio por conversao de R$100
      const estimatedRevenue = aggregated.conversions * 100
      const roas = aggregated.spent > 0
        ? Number((estimatedRevenue / aggregated.spent).toFixed(2))
        : 0

      weeks.push({
        week: 4 - i, // Semana 4 = mais recente, Semana 1 = mais antiga
        weekLabel: formatWeekLabel(start, end),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        impressions: aggregated.impressions,
        reach: aggregated.reach,
        clicks: aggregated.clicks,
        ctr,
        cpc,
        cpm,
        conversions: aggregated.conversions,
        spent: Number(aggregated.spent.toFixed(2)),
        roas,
        daysWithData: dailyMetrics.length,
      })
    }

    // Ordenar semanas da mais antiga para mais recente
    weeks.reverse()

    // Calcular variacoes (semana atual vs semana anterior)
    const currentWeek = weeks[3] // Semana 4
    const previousWeek = weeks[2] // Semana 3

    const changes = {
      impressions: calculateChange(currentWeek.impressions, previousWeek.impressions),
      clicks: calculateChange(currentWeek.clicks, previousWeek.clicks),
      conversions: calculateChange(currentWeek.conversions, previousWeek.conversions),
      spent: calculateChange(currentWeek.spent, previousWeek.spent),
      ctr: calculateChange(currentWeek.ctr, previousWeek.ctr),
      roas: calculateChange(currentWeek.roas, previousWeek.roas),
    }

    // Gerar analise baseada nos dados
    const analysis = generateAnalysis(weeks, changes)

    const response: ComparisonResponse = {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        platform: campaign.platform,
        status: campaign.status,
        objective: campaign.objective,
      },
      weeks,
      changes,
      analysis,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro ao buscar comparacao:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar comparacao de campanha' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })

// Funcao para gerar analise de IA baseada nos dados
function generateAnalysis(
  weeks: WeeklyMetrics[],
  changes: ComparisonResponse['changes']
): ComparisonResponse['analysis'] {
  const insights: string[] = []

  // Analisar tendencia geral
  const week1 = weeks[0]
  const week4 = weeks[3]

  // Calcular crescimento total (semana 1 vs semana 4)
  const totalGrowthConversions = calculateChange(week4.conversions, week1.conversions)
  const totalGrowthROAS = calculateChange(week4.roas, week1.roas)
  const totalGrowthSpent = calculateChange(week4.spent, week1.spent)

  // Determinar tendencia
  let trend: 'improving' | 'stable' | 'declining'
  if (totalGrowthConversions > 10 && totalGrowthROAS > 5) {
    trend = 'improving'
  } else if (totalGrowthConversions < -10 || totalGrowthROAS < -10) {
    trend = 'declining'
  } else {
    trend = 'stable'
  }

  // Determinar recomendacao
  let recommendation: 'scale' | 'maintain' | 'optimize' | 'pause'

  if (week4.roas >= 3 && changes.roas >= 0 && changes.conversions >= 0) {
    recommendation = 'scale'
    insights.push('ROAS excelente e crescente - campanha pronta para escalar')
  } else if (week4.roas >= 2 && week4.roas < 3) {
    recommendation = 'maintain'
    insights.push('ROAS positivo - manter campanha e monitorar')
  } else if (week4.roas >= 1 && week4.roas < 2) {
    recommendation = 'optimize'
    insights.push('ROAS proximo do breakeven - otimizar criativos e segmentacao')
  } else {
    recommendation = 'pause'
    insights.push('ROAS negativo - considerar pausar e revisar estrategia')
  }

  // Insights sobre impressoes
  if (changes.impressions > 20) {
    insights.push(`Alcance cresceu ${changes.impressions.toFixed(0)}% na ultima semana`)
  } else if (changes.impressions < -20) {
    insights.push(`Alcance diminuiu ${Math.abs(changes.impressions).toFixed(0)}% - verificar saturacao de audiencia`)
  }

  // Insights sobre CTR
  if (changes.ctr > 15) {
    insights.push('CTR melhorando - criativos estao performando bem')
  } else if (changes.ctr < -15) {
    insights.push('CTR em queda - considerar testar novos criativos')
  }

  // Insights sobre custo
  if (changes.spent > 30 && changes.conversions < 10) {
    insights.push('Custo aumentando mais que conversoes - otimizar lances')
  }

  // Insights sobre conversoes
  if (changes.conversions > 25) {
    insights.push(`Conversoes cresceram ${changes.conversions.toFixed(0)}% - excelente performance`)
  } else if (changes.conversions < -25 && week4.conversions > 0) {
    insights.push('Queda significativa em conversoes - revisar funil')
  }

  // Insight sobre consistencia
  const avgConversions = weeks.reduce((sum, w) => sum + w.conversions, 0) / 4
  const variance = weeks.reduce((sum, w) => sum + Math.pow(w.conversions - avgConversions, 2), 0) / 4
  const stdDev = Math.sqrt(variance)

  if (stdDev > avgConversions * 0.5) {
    insights.push('Alta variacao entre semanas - campanha instavel')
  } else if (stdDev < avgConversions * 0.2 && avgConversions > 0) {
    insights.push('Performance consistente entre semanas')
  }

  // Garantir pelo menos 2 insights
  if (insights.length < 2) {
    if (week4.daysWithData < 7) {
      insights.push(`Semana atual com apenas ${week4.daysWithData} dias de dados`)
    }
    if (week4.impressions > 10000) {
      insights.push(`Bom volume de ${week4.impressions.toLocaleString()} impressoes na semana`)
    }
  }

  return {
    trend,
    recommendation,
    insights: insights.slice(0, 5), // Maximo 5 insights
  }
}
