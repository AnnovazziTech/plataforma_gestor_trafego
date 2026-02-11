import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const organizationId = session.user.organizationId

    // Buscar audit logs recentes
    const auditLogs = await prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // Buscar campanhas recentes para enriquecer os dados
    const recentCampaigns = await prisma.campaign.findMany({
      where: { organizationId },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        status: true,
        platform: true,
        updatedAt: true,
        createdAt: true,
      },
    })

    // Mapear audit logs para atividades
    const activities = auditLogs.map((log) => {
      let type: string = 'campaign_edited'
      let title = ''
      let description = ''
      let platform: string | undefined

      // Determinar tipo baseado na ação
      switch (log.action) {
        case 'CAMPAIGN_CREATED':
          type = 'campaign_created'
          title = 'Nova campanha criada'
          description = log.entity || 'Campanha configurada'
          break
        case 'CAMPAIGN_UPDATED':
          type = 'campaign_edited'
          title = 'Campanha atualizada'
          description = log.entity || 'Configurações alteradas'
          break
        case 'CAMPAIGN_STARTED':
        case 'CAMPAIGN_ACTIVATED':
          type = 'campaign_started'
          title = 'Campanha iniciada'
          description = log.entity ? `${log.entity} está ativa` : 'Campanha ativada'
          break
        case 'CAMPAIGN_PAUSED':
          type = 'campaign_paused'
          title = 'Campanha pausada'
          description = log.entity || 'Campanha pausada'
          break
        case 'CAMPAIGN_DELETED':
          type = 'alert'
          title = 'Campanha excluída'
          description = log.entity || 'Campanha removida'
          break
        case 'BUDGET_UPDATED':
        case 'BUDGET_INCREASED':
          type = 'budget_increased'
          title = 'Budget atualizado'
          description = log.entity ? `${log.entity} - Budget alterado` : 'Budget atualizado'
          break
        case 'ALERT_TRIGGERED':
          type = 'alert'
          title = 'Alerta disparado'
          description = log.entity || 'Verificar métricas'
          break
        case 'MILESTONE_REACHED':
          type = 'milestone_reached'
          title = 'Meta atingida'
          description = log.entity || 'Meta alcançada'
          break
        default:
          type = 'campaign_edited'
          title = log.action.replace(/_/g, ' ').toLowerCase()
          description = log.entity || ''
      }

      // Tentar extrair plataforma do log
      if (log.newData && typeof log.newData === 'object') {
        const data = log.newData as Record<string, unknown>
        if (data.platform) {
          platform = String(data.platform).toLowerCase()
        }
      }

      return {
        id: log.id,
        type,
        title,
        description,
        platform,
        timestamp: log.createdAt.toISOString(),
      }
    })

    // Se não houver logs suficientes, gerar atividades das campanhas recentes
    if (activities.length < 5) {
      const campaignActivities = recentCampaigns.map((campaign) => {
        const isRecent = (new Date().getTime() - campaign.createdAt.getTime()) < 86400000 * 7 // 7 dias

        return {
          id: `campaign-${campaign.id}`,
          type: isRecent && campaign.createdAt.getTime() === campaign.updatedAt.getTime()
            ? 'campaign_created'
            : campaign.status === 'ACTIVE' ? 'campaign_started' : 'campaign_paused',
          title: isRecent && campaign.createdAt.getTime() === campaign.updatedAt.getTime()
            ? 'Campanha criada'
            : campaign.status === 'ACTIVE' ? 'Campanha ativa' : 'Campanha pausada',
          description: campaign.name,
          platform: campaign.platform?.toLowerCase(),
          timestamp: campaign.updatedAt.toISOString(),
        }
      })

      // Mesclar e ordenar
      const merged = [...activities, ...campaignActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)

      return NextResponse.json(merged)
    }

    return NextResponse.json(activities.slice(0, 10))
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar atividades' }, { status: 500 })
  }
}
