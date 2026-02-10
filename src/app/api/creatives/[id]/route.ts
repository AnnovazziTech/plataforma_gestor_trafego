// API Route: Criativo Individual
// GET - Buscar criativo
// PATCH - Atualizar criativo
// DELETE - Deletar criativo

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog } from '@/lib/api/middleware'

const updateCreativeSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL', 'TEXT']).optional(),
  platform: z.enum(['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN', 'TWITTER']).nullable().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  mediaUrl: z.string().url().nullable().optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
})

// GET - Buscar criativo
export const GET = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/creatives/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID do criativo obrigatorio' },
        { status: 400 }
      )
    }

    const creative = await prisma.creative.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
    })

    if (!creative) {
      return NextResponse.json(
        { error: 'Criativo nao encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ creative })
  } catch (error) {
    console.error('Erro ao buscar criativo:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar criativo' },
      { status: 500 }
    )
  }
})

// PATCH - Atualizar criativo
export const PATCH = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/creatives/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID do criativo obrigatorio' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const data = updateCreativeSchema.parse(body)

    // Verificar se criativo existe
    const existing = await prisma.creative.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Criativo nao encontrado' },
        { status: 404 }
      )
    }

    const creative = await prisma.creative.update({
      where: { id },
      data,
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'creative.updated',
      entity: 'creative',
      entityId: id,
      oldData: existing,
      newData: data,
      request: req,
    })

    return NextResponse.json({ creative })
  } catch (error) {
    console.error('Erro ao atualizar criativo:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar criativo' },
      { status: 500 }
    )
  }
})

// DELETE - Deletar criativo
export const DELETE = withAuth(async (req, ctx) => {
  try {
    const id = req.url.split('/creatives/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID do criativo obrigatorio' },
        { status: 400 }
      )
    }

    // Verificar se criativo existe
    const existing = await prisma.creative.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Criativo nao encontrado' },
        { status: 404 }
      )
    }

    await prisma.creative.delete({
      where: { id },
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'creative.deleted',
      entity: 'creative',
      entityId: id,
      oldData: existing,
      request: req,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar criativo:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar criativo' },
      { status: 500 }
    )
  }
})
