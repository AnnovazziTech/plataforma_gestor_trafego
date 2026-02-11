// API Route: Relatório Individual
// GET - Buscar relatório por ID
// PATCH - Atualizar relatório
// DELETE - Remover relatório

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog } from '@/lib/api/middleware'

// Schema para atualizar relatório
const updateReportSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
  frequency: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']).optional(),
  recipients: z.array(z.string()).optional(),
  sendMethod: z.enum(['EMAIL', 'WHATSAPP', 'DOWNLOAD']).optional(),
})

// GET - Buscar relatório por ID
export const GET = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/reports/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID do relatório obrigatório' },
        { status: 400 }
      )
    }

    const report = await prisma.report.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
        isActive: true,
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Relatório não encontrado' },
        { status: 404 }
      )
    }

    // Formatar para o frontend
    const formattedReport = {
      id: report.id,
      name: report.name,
      type: report.type.toLowerCase(),
      frequency: report.frequency.toLowerCase(),
      status: report.status.toLowerCase(),
      platforms: report.platforms.map(p => p.toLowerCase()),
      metrics: report.metrics,
      dateRange: {
        start: report.dateRangeStart.toISOString(),
        end: report.dateRangeEnd.toISOString(),
      },
      recipients: report.recipients,
      sendMethod: report.sendMethod?.toLowerCase(),
      lastGenerated: report.lastGenerated?.toISOString(),
      generatedCount: report.generatedCount,
      reportData: report.reportData,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    }

    return NextResponse.json({ report: formattedReport })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar relatório' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canViewReports'] })

// PATCH - Atualizar relatório
export const PATCH = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/reports/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID do relatório obrigatório' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const data = updateReportSchema.parse(body)

    // Verificar se o relatório existe
    const existing = await prisma.report.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
        isActive: true,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Relatório não encontrado' },
        { status: 404 }
      )
    }

    // Preparar dados para atualização
    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.status) updateData.status = data.status
    if (data.frequency) updateData.frequency = data.frequency
    if (data.recipients) updateData.recipients = data.recipients
    if (data.sendMethod) updateData.sendMethod = data.sendMethod

    // Atualizar relatório
    const report = await prisma.report.update({
      where: { id },
      data: updateData,
    })

    // Registrar no audit log
    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      userEmail: ctx.email,
      action: 'report.updated',
      entity: 'report',
      entityId: report.id,
      oldData: { name: existing.name, status: existing.status },
      newData: updateData,
      request: req,
    })

    // Formatar para o frontend
    const formattedReport = {
      id: report.id,
      name: report.name,
      type: report.type.toLowerCase(),
      frequency: report.frequency.toLowerCase(),
      status: report.status.toLowerCase(),
      platforms: report.platforms.map(p => p.toLowerCase()),
      metrics: report.metrics,
      dateRange: {
        start: report.dateRangeStart.toISOString(),
        end: report.dateRangeEnd.toISOString(),
      },
      recipients: report.recipients,
      sendMethod: report.sendMethod?.toLowerCase(),
      lastGenerated: report.lastGenerated?.toISOString(),
      generatedCount: report.generatedCount,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      report: formattedReport,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar relatório' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canViewReports'] })

// DELETE - Remover relatório (soft delete)
export const DELETE = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/reports/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID do relatório obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o relatório existe
    const existing = await prisma.report.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
        isActive: true,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Relatório não encontrado' },
        { status: 404 }
      )
    }

    // Soft delete
    await prisma.report.update({
      where: { id },
      data: { isActive: false },
    })

    // Registrar no audit log
    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      userEmail: ctx.email,
      action: 'report.deleted',
      entity: 'report',
      entityId: id,
      oldData: { name: existing.name },
      request: req,
    })

    return NextResponse.json({
      success: true,
      message: 'Relatório removido com sucesso',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao remover relatório' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canViewReports'] })
