// API Route: Templates de Arte
// GET - Listar templates globais

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { withAuth } from '@/lib/api/middleware'

// GET - Listar templates de arte
export const GET = withAuth(async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const niche = searchParams.get('niche')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const isNew = searchParams.get('new') === 'true'
    const isPremium = searchParams.get('premium') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      isActive: true,
    }

    if (niche && niche !== 'all') {
      where.niche = niche
    }

    if (type && type !== 'all') {
      where.type = type
    }

    if (isNew) {
      where.isNew = true
    }

    if (isPremium) {
      where.isPremium = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
        { niche: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [templates, total] = await Promise.all([
      prisma.artTemplate.findMany({
        where,
        orderBy: [
          { isNew: 'desc' },
          { downloads: 'desc' },
          { rating: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.artTemplate.count({ where }),
    ])

    // Buscar nichos e tipos disponiveis
    const [niches, types] = await Promise.all([
      prisma.artTemplate.groupBy({
        by: ['niche'],
        where: { isActive: true },
        _count: true,
      }),
      prisma.artTemplate.groupBy({
        by: ['type'],
        where: { isActive: true },
        _count: true,
      }),
    ])

    // Buscar templates salvos pelo usuario
    const savedTemplates = await prisma.artTemplateSaved.findMany({
      where: { organizationId: ctx.organizationId },
      select: { templateId: true },
    })
    const savedIds = savedTemplates.map((s) => s.templateId)

    return NextResponse.json({
      templates: templates.map((t) => ({
        ...t,
        isSaved: savedIds.includes(t.id),
      })),
      filters: {
        niches: niches.map((n) => ({ value: n.niche, count: n._count })),
        types: types.map((t) => ({ value: t.type, count: t._count })),
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao listar templates:', error)
    return NextResponse.json(
      { error: 'Erro ao listar templates' },
      { status: 500 }
    )
  }
}, { requiredPermissions: ['canManageCampaigns'] })
