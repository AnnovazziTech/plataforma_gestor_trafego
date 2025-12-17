// API Route: Posts Agendados
// GET - Listar posts agendados
// POST - Criar novo post agendado

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog } from '@/lib/api/middleware'

// GET - Listar posts agendados
export const GET = withAuth(async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      organizationId: ctx.organizationId,
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    if (platform) {
      where.platform = platform.toUpperCase()
    }

    if (startDate) {
      where.scheduledDate = {
        ...where.scheduledDate,
        gte: new Date(startDate),
      }
    }

    if (endDate) {
      where.scheduledDate = {
        ...where.scheduledDate,
        lte: new Date(endDate),
      }
    }

    // Buscar posts agendados
    const [posts, total] = await Promise.all([
      prisma.scheduledPost.findMany({
        where,
        orderBy: [
          { scheduledDate: 'asc' },
          { scheduledTime: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.scheduledPost.count({ where }),
    ])

    // Formatar resposta
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      name: post.name,
      platform: post.platform.toLowerCase(),
      date: post.scheduledDate.toISOString().split('T')[0],
      time: post.scheduledTime,
      format: post.format.toLowerCase(),
      text: post.text,
      media: post.mediaUrl,
      mediaType: post.mediaType?.toLowerCase(),
      status: post.status.toLowerCase(),
      publishedAt: post.publishedAt,
      errorMessage: post.errorMessage,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }))

    // Estatísticas
    const stats = await prisma.scheduledPost.groupBy({
      by: ['status'],
      where: { organizationId: ctx.organizationId },
      _count: true,
    })

    const statsFormatted = {
      total,
      scheduled: stats.find(s => s.status === 'SCHEDULED')?._count || 0,
      published: stats.find(s => s.status === 'PUBLISHED')?._count || 0,
      failed: stats.find(s => s.status === 'FAILED')?._count || 0,
    }

    return NextResponse.json({
      posts: formattedPosts,
      stats: statsFormatted,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao listar posts agendados:', error)
    return NextResponse.json(
      { error: 'Erro ao listar posts agendados' },
      { status: 500 }
    )
  }
})

// POST - Criar post agendado
const createPostSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  platform: z.enum(['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TWITTER', 'TIKTOK']),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
  format: z.enum(['FEED', 'STORY', 'REELS', 'CAROUSEL']).default('FEED'),
  text: z.string().optional(),
  media: z.string().optional(),
  mediaType: z.enum(['IMAGE', 'VIDEO']).optional(),
})

export const POST = withAuth(async (req, ctx) => {
  try {
    const body = await req.json()
    const data = createPostSchema.parse(body)

    // Validar que a data não é no passado
    const scheduledDateTime = new Date(`${data.date}T${data.time}`)
    if (scheduledDateTime < new Date()) {
      return NextResponse.json(
        { error: 'Não é possível agendar para uma data no passado' },
        { status: 400 }
      )
    }

    // Criar post agendado
    const post = await prisma.scheduledPost.create({
      data: {
        organizationId: ctx.organizationId,
        name: data.name,
        platform: data.platform,
        scheduledDate: new Date(data.date),
        scheduledTime: data.time,
        format: data.format,
        text: data.text,
        mediaUrl: data.media,
        mediaType: data.mediaType,
        status: 'SCHEDULED',
      },
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'scheduled_post.created',
      entity: 'scheduled_post',
      entityId: post.id,
      newData: data,
      request: req,
    })

    return NextResponse.json({
      post: {
        id: post.id,
        name: post.name,
        platform: post.platform.toLowerCase(),
        date: post.scheduledDate.toISOString().split('T')[0],
        time: post.scheduledTime,
        format: post.format.toLowerCase(),
        text: post.text,
        media: post.mediaUrl,
        mediaType: post.mediaType?.toLowerCase(),
        status: post.status.toLowerCase(),
        createdAt: post.createdAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar post agendado:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar post agendado' },
      { status: 500 }
    )
  }
})
