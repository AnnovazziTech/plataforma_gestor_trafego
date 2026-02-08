// API Route: Superadmin - Audit Logs
// GET - Listar logs de auditoria globais

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { withSuperAdmin } from '@/lib/api/middleware'

export const GET = withSuperAdmin(async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const orgId = searchParams.get('organizationId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: any = {}
    if (action) where.action = { contains: action, mode: 'insensitive' }
    if (orgId) where.organizationId = orgId
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          organization: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Erro ao buscar audit logs:', error)
    return NextResponse.json({ error: 'Erro ao buscar logs' }, { status: 500 })
  }
})
