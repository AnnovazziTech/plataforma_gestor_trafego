// API Route: Criativos
// GET - Listar criativos
// POST - Criar criativo

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, checkResourceLimit, createAuditLog } from '@/lib/api/middleware'

const createCreativeSchema = z.object({
  title: z.string().min(1, 'Titulo obrigatorio'),
  description: z.string().optional(),
  type: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL', 'TEXT']),
  platform: z.enum(['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN', 'TWITTER']).optional(),
  thumbnailUrl: z.string().url().optional(),
  mediaUrl: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
  sourceAdvertiser: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
})

// GET - Listar criativos
export const GET = withAuth(async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const platform = searchParams.get('platform')
    const search = searchParams.get('search')
    const favorite = searchParams.get('favorite')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      organizationId: ctx.organizationId,
    }

    if (type) {
      where.type = type
    }

    if (platform) {
      where.platform = platform
    }

    if (favorite === 'true') {
      where.isFavorite = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sourceAdvertiser: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }

    const [creatives, total] = await Promise.all([
      prisma.creative.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.creative.count({ where }),
    ])

    // Estatisticas
    const stats = await prisma.creative.groupBy({
      by: ['type'],
      where: { organizationId: ctx.organizationId },
      _count: true,
    })

    return NextResponse.json({
      creatives,
      stats: {
        total,
        byType: stats.reduce((acc, s) => {
          acc[s.type] = s._count
          return acc
        }, {} as Record<string, number>),
        favorites: await prisma.creative.count({
          where: { organizationId: ctx.organizationId, isFavorite: true },
        }),
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao listar criativos:', error)
    return NextResponse.json(
      { error: 'Erro ao listar criativos' },
      { status: 500 }
    )
  }
})

// POST - Criar criativo
export const POST = withAuth(async (req, ctx) => {
  try {
    const body = await req.json()
    const data = createCreativeSchema.parse(body)

    // Verificar limite
    const limit = await checkResourceLimit(ctx.organizationId, 'creatives')
    if (!limit.allowed) {
      return NextResponse.json(
        { error: limit.error },
        { status: 403 }
      )
    }

    const creative = await prisma.creative.create({
      data: {
        organizationId: ctx.organizationId,
        title: data.title,
        description: data.description,
        type: data.type,
        platform: data.platform,
        thumbnailUrl: data.thumbnailUrl,
        mediaUrl: data.mediaUrl,
        sourceUrl: data.sourceUrl,
        sourceAdvertiser: data.sourceAdvertiser,
        tags: data.tags || [],
        isFavorite: data.isFavorite || false,
      },
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'creative.created',
      entity: 'creative',
      entityId: creative.id,
      newData: data,
      request: req,
    })

    return NextResponse.json({ creative }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar criativo:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar criativo' },
      { status: 500 }
    )
  }
})
