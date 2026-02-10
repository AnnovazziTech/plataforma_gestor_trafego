// API Route: Automação Individual
// GET - Buscar automação
// PATCH - Atualizar automação
// DELETE - Deletar automação

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog } from '@/lib/api/middleware'

const updateAutomationSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['active', 'paused']).optional(),
  condition: z.object({
    metric: z.enum(['cpa', 'roas', 'ctr', 'cpc', 'impressions', 'conversions']),
    operator: z.enum(['greater_than', 'less_than', 'equal', 'greater_equal', 'less_equal']),
    value: z.number(),
  }).optional(),
  period: z.enum(['last_hour', 'last_day', 'last_week']).optional(),
  action: z.enum(['pause', 'activate', 'adjust_budget', 'notify']).optional(),
  actionValue: z.number().optional(),
})

// GET - Buscar automação
export const GET = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/automations/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID da automação obrigatório' },
        { status: 400 }
      )
    }

    const automationLog = await prisma.auditLog.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
        action: 'automation.created',
      },
    })

    if (!automationLog) {
      return NextResponse.json(
        { error: 'Automação não encontrada' },
        { status: 404 }
      )
    }

    // Buscar execuções
    const executions = await prisma.auditLog.findMany({
      where: {
        organizationId: ctx.organizationId,
        action: 'automation.executed',
        entityId: id,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      automation: {
        id: automationLog.id,
        ...(automationLog.newData as any),
        createdAt: automationLog.createdAt,
      },
      executions: executions.map((e) => ({
        id: e.id,
        data: e.newData,
        createdAt: e.createdAt,
      })),
    })
  } catch (error) {
    console.error('Erro ao buscar automação:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar automação' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })

// PATCH - Atualizar automação
export const PATCH = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/automations/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID da automação obrigatório' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const data = updateAutomationSchema.parse(body)

    // Buscar automação existente
    const existingLog = await prisma.auditLog.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
        action: 'automation.created',
      },
    })

    if (!existingLog) {
      return NextResponse.json(
        { error: 'Automação não encontrada' },
        { status: 404 }
      )
    }

    const existingData = existingLog.newData as any

    // Criar novo log com dados atualizados
    const updatedData = {
      ...existingData,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      userEmail: ctx.email,
      action: 'automation.updated',
      entity: 'automation',
      entityId: id,
      oldData: existingData,
      newData: updatedData,
      request: req,
    })

    return NextResponse.json({
      success: true,
      automation: {
        id,
        ...updatedData,
      },
    })
  } catch (error) {
    console.error('Erro ao atualizar automação:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar automação' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })

// DELETE - Deletar automação
export const DELETE = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/automations/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID da automação obrigatório' },
        { status: 400 }
      )
    }

    // Buscar automação existente
    const existingLog = await prisma.auditLog.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
        action: 'automation.created',
      },
    })

    if (!existingLog) {
      return NextResponse.json(
        { error: 'Automação não encontrada' },
        { status: 404 }
      )
    }

    // Criar log de deleção
    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      userEmail: ctx.email,
      action: 'automation.deleted',
      entity: 'automation',
      entityId: id,
      oldData: existingLog.newData,
      request: req,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar automação:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar automação' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })
