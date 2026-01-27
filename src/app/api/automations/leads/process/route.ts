// API Route: Processar Automacoes de Leads
// POST - Executar regras de remarketing pendentes

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog } from '@/lib/api/middleware'

interface LeadAutomation {
  id: string
  name: string
  type: 'lead_status_change' | 'lead_inactivity' | 'lead_remarketing'
  status: 'active' | 'paused'
  trigger: {
    fromStatus?: string
    toStatus?: string
    inactiveDays?: number
    lostDaysAgo?: number
  }
  action: {
    type: 'change_status' | 'send_message' | 'create_task' | 'notify'
    newStatus?: string
    messageTemplate?: string
    messageChannel?: string
    taskTitle?: string
    notificationMessage?: string
  }
  filters?: {
    sources?: string[]
    campaigns?: string[]
    minValue?: number
    maxValue?: number
  }
  organizationId: string
}

// POST - Processar automacoes
export const POST = withAuth(async (req, ctx) => {
  try {
    const body = await req.json()
    const { automationId } = body // Opcional: processar apenas uma automacao especifica

    // Buscar automacoes ativas
    const where: any = {
      organizationId: ctx.organizationId,
      action: 'lead_automation.created',
    }

    const automationLogs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    let automations: LeadAutomation[] = automationLogs
      .map((log) => ({
        id: log.id,
        ...(log.newData as any),
      }))
      .filter((a) => a.status === 'active')

    // Filtrar por ID se especificado
    if (automationId) {
      automations = automations.filter((a) => a.id === automationId)
    }

    let processedLeads = 0
    let executedActions = 0
    const results: any[] = []

    for (const automation of automations) {
      const result = await processAutomation(automation, ctx)
      results.push({
        automationId: automation.id,
        name: automation.name,
        ...result,
      })
      processedLeads += result.processedLeads
      executedActions += result.executedActions
    }

    return NextResponse.json({
      success: true,
      processedAutomations: automations.length,
      processedLeads,
      executedActions,
      results,
    })
  } catch (error) {
    console.error('Erro ao processar automacoes de leads:', error)
    return NextResponse.json(
      { error: 'Erro ao processar automacoes de leads' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })

async function processAutomation(
  automation: LeadAutomation,
  ctx: { organizationId: string; userId: string; email: string }
) {
  let processedLeads = 0
  let executedActions = 0

  try {
    // Construir filtro base
    const baseFilter: any = {
      organizationId: automation.organizationId,
    }

    // Aplicar filtros adicionais
    if (automation.filters?.sources?.length) {
      baseFilter.source = { in: automation.filters.sources }
    }
    if (automation.filters?.campaigns?.length) {
      baseFilter.campaignId = { in: automation.filters.campaigns }
    }
    if (automation.filters?.minValue !== undefined) {
      baseFilter.value = { ...(baseFilter.value || {}), gte: automation.filters.minValue }
    }
    if (automation.filters?.maxValue !== undefined) {
      baseFilter.value = { ...(baseFilter.value || {}), lte: automation.filters.maxValue }
    }

    let leads: any[] = []

    switch (automation.type) {
      case 'lead_inactivity':
        // Buscar leads sem atividade por X dias
        if (automation.trigger.inactiveDays) {
          const inactiveDate = new Date()
          inactiveDate.setDate(inactiveDate.getDate() - automation.trigger.inactiveDays)

          leads = await prisma.lead.findMany({
            where: {
              ...baseFilter,
              status: { notIn: ['WON', 'LOST', 'REMARKETING'] },
              updatedAt: { lt: inactiveDate },
            },
            take: 100, // Limitar processamento por vez
          })
        }
        break

      case 'lead_remarketing':
        // Buscar leads perdidos ha X dias para remarketing
        if (automation.trigger.lostDaysAgo) {
          const lostDate = new Date()
          lostDate.setDate(lostDate.getDate() - automation.trigger.lostDaysAgo)

          leads = await prisma.lead.findMany({
            where: {
              ...baseFilter,
              status: 'LOST',
              lostAt: { lte: lostDate },
            },
            take: 100,
          })
        }
        break

      case 'lead_status_change':
        // Este tipo e tratado via webhook/trigger quando status muda
        // Aqui buscamos leads que mudaram recentemente
        if (automation.trigger.toStatus) {
          const recentDate = new Date()
          recentDate.setHours(recentDate.getHours() - 1) // Ultima hora

          const recentChanges = await prisma.leadHistory.findMany({
            where: {
              toStatus: automation.trigger.toStatus as any,
              ...(automation.trigger.fromStatus && { fromStatus: automation.trigger.fromStatus as any }),
              createdAt: { gte: recentDate },
            },
            include: { lead: true },
            take: 100,
          })

          // Filtrar apenas leads da organizacao
          const filteredChanges = recentChanges.filter(
            (h) => h.lead.organizationId === automation.organizationId
          )
          leads = filteredChanges.map((h) => h.lead)
        }
        break
    }

    processedLeads = leads.length

    // Executar acoes para cada lead
    for (const lead of leads) {
      try {
        await executeAction(automation, lead, ctx)
        executedActions++
      } catch (e) {
        console.error(`Erro ao executar acao para lead ${lead.id}:`, e)
      }
    }

    // Registrar execucao
    await prisma.auditLog.create({
      data: {
        organizationId: automation.organizationId,
        userId: ctx.userId,
        userEmail: ctx.email,
        action: 'lead_automation.executed',
        entity: 'lead_automation',
        entityId: automation.id,
        newData: {
          automationName: automation.name,
          processedLeads,
          executedActions,
        } as any,
      },
    })

    return { processedLeads, executedActions, error: null }
  } catch (error) {
    console.error(`Erro ao processar automacao ${automation.id}:`, error)
    return { processedLeads, executedActions, error: String(error) }
  }
}

async function executeAction(
  automation: LeadAutomation,
  lead: any,
  ctx: { organizationId: string; userId: string; email: string }
) {
  const action = automation.action

  switch (action.type) {
    case 'change_status':
      if (action.newStatus && action.newStatus !== lead.status) {
        // Atualizar status do lead
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            status: action.newStatus as any,
            ...(action.newStatus === 'WON' && { convertedAt: new Date() }),
            ...(action.newStatus === 'LOST' && { lostAt: new Date() }),
          },
        })

        // Criar historico
        await prisma.leadHistory.create({
          data: {
            leadId: lead.id,
            fromStatus: lead.status,
            toStatus: action.newStatus as any,
            note: `Alterado automaticamente por regra: ${automation.name}`,
            changedById: ctx.userId,
          },
        })
      }
      break

    case 'send_message':
      // TODO: Integrar com sistema de mensagens (WhatsApp, Email, SMS)
      // Por enquanto, apenas registra a intencao
      await prisma.auditLog.create({
        data: {
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          userEmail: ctx.email,
          action: 'lead_automation.message_queued',
          entity: 'lead',
          entityId: lead.id,
          newData: {
            channel: action.messageChannel,
            template: action.messageTemplate,
            leadName: lead.name,
            leadPhone: lead.phone,
            leadEmail: lead.email,
          } as any,
        },
      })
      break

    case 'create_task':
      // TODO: Integrar com sistema de tarefas
      // Por enquanto, registra como audit log
      await prisma.auditLog.create({
        data: {
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          userEmail: ctx.email,
          action: 'lead_automation.task_created',
          entity: 'lead',
          entityId: lead.id,
          newData: {
            taskTitle: action.taskTitle || `Follow-up: ${lead.name}`,
            leadId: lead.id,
            leadName: lead.name,
          } as any,
        },
      })
      break

    case 'notify':
      // Criar notificacao como audit log (TODO: integrar com sistema de notificacoes)
      await prisma.auditLog.create({
        data: {
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          userEmail: ctx.email,
          action: 'lead_automation.notification',
          entity: 'lead',
          entityId: lead.id,
          newData: {
            type: 'AUTOMATION',
            title: `Automacao: ${automation.name}`,
            message: action.notificationMessage || `Lead ${lead.name} processado pela regra de automacao`,
            leadId: lead.id,
            leadName: lead.name,
            automationId: automation.id,
          } as any,
        },
      })
      break
  }
}
