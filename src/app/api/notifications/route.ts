// API Route: Notificacoes
// GET - Listar notificacoes
// POST - Criar notificacao
// PATCH - Marcar como lida

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth } from '@/lib/api/middleware'

// GET - Listar notificacoes (do audit log)
export const GET = withAuth(async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Buscar acoes importantes do audit log
    const importantActions = [
      'campaign.created',
      'campaign.updated',
      'campaign.deleted',
      'lead.created',
      'lead.status_changed',
      'integration.connected',
      'integration.disconnected',
      'automation.executed',
      'report.generated',
    ]

    const where: any = {
      organizationId: ctx.organizationId,
      action: { in: importantActions },
    }

    const [notifications, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    // Formatar notificacoes
    const formattedNotifications = notifications.map((n) => {
      let title = ''
      let message = ''
      let type: 'info' | 'success' | 'warning' | 'error' = 'info'

      switch (n.action) {
        case 'campaign.created':
          title = 'Nova campanha criada'
          message = `Campanha "${(n.newData as any)?.name || 'Nova'}" foi criada`
          type = 'success'
          break
        case 'campaign.updated':
          title = 'Campanha atualizada'
          message = `Campanha foi atualizada`
          type = 'info'
          break
        case 'lead.created':
          title = 'Novo lead capturado'
          message = `Lead "${(n.newData as any)?.name || 'Novo'}" foi adicionado`
          type = 'success'
          break
        case 'lead.status_changed':
          title = 'Status do lead alterado'
          message = `Lead movido para ${(n.newData as any)?.status || 'novo status'}`
          type = 'info'
          break
        case 'integration.connected':
          title = 'Integracao conectada'
          message = `Nova integracao conectada com sucesso`
          type = 'success'
          break
        case 'automation.executed':
          title = 'Automacao executada'
          message = `Automacao "${(n.newData as any)?.name || ''}" foi executada`
          type = 'info'
          break
        default:
          title = n.action.replace('.', ' ').replace('_', ' ')
          message = `Acao realizada: ${n.action}`
      }

      return {
        id: n.id,
        title,
        message,
        type,
        action: n.action,
        entity: n.entity,
        entityId: n.entityId,
        data: n.newData,
        createdAt: n.createdAt,
        read: false, // Por enquanto todas sao nao lidas
      }
    })

    // Contar nao lidas (ultimas 24h)
    const unreadCount = await prisma.auditLog.count({
      where: {
        ...where,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    })

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao listar notificacoes:', error)
    return NextResponse.json(
      { error: 'Erro ao listar notificacoes' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canViewReports'] })
