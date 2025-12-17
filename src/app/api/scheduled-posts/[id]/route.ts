// API Route: Post Agendado Individual
// GET - Obter post por ID
// PUT - Atualizar post
// DELETE - Excluir post

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import { withAuth, createAuditLog, AuthContext } from '@/lib/api/middleware'

// GET - Obter post por ID
export const GET = withAuth(async (req: NextRequest, ctx: AuthContext) => {
  try {
    const id = req.url.split('/scheduled-posts/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID do post é obrigatório' },
        { status: 400 }
      )
    }

    const post = await prisma.scheduledPost.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

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
        publishedAt: post.publishedAt,
        errorMessage: post.errorMessage,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar post:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar post' },
      { status: 500 }
    )
  }
})

// PUT - Atualizar post
const updatePostSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  platform: z.enum(['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TWITTER', 'TIKTOK']).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  format: z.enum(['FEED', 'STORY', 'REELS', 'CAROUSEL']).optional(),
  text: z.string().optional(),
  media: z.string().optional(),
  mediaType: z.enum(['IMAGE', 'VIDEO']).optional(),
  status: z.enum(['SCHEDULED', 'CANCELLED']).optional(),
})

export const PUT = withAuth(async (req: NextRequest, ctx: AuthContext) => {
  try {
    const id = req.url.split('/scheduled-posts/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID do post é obrigatório' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const data = updatePostSchema.parse(body)

    // Verificar se o post existe
    const existingPost = await prisma.scheduledPost.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Não permitir edição de posts já publicados
    if (existingPost.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Não é possível editar um post já publicado' },
        { status: 400 }
      )
    }

    // Validar data se fornecida
    if (data.date && data.time) {
      const scheduledDateTime = new Date(`${data.date}T${data.time}`)
      if (scheduledDateTime < new Date()) {
        return NextResponse.json(
          { error: 'Não é possível agendar para uma data no passado' },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualização
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (data.name) updateData.name = data.name
    if (data.platform) updateData.platform = data.platform
    if (data.date) updateData.scheduledDate = new Date(data.date)
    if (data.time) updateData.scheduledTime = data.time
    if (data.format) updateData.format = data.format
    if (data.text !== undefined) updateData.text = data.text
    if (data.media !== undefined) updateData.mediaUrl = data.media
    if (data.mediaType) updateData.mediaType = data.mediaType
    if (data.status) updateData.status = data.status

    // Atualizar post
    const post = await prisma.scheduledPost.update({
      where: { id },
      data: updateData,
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'scheduled_post.updated',
      entity: 'scheduled_post',
      entityId: post.id,
      oldData: existingPost,
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
        updatedAt: post.updatedAt,
      },
    })
  } catch (error) {
    console.error('Erro ao atualizar post:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar post' },
      { status: 500 }
    )
  }
})

// DELETE - Excluir post
export const DELETE = withAuth(async (req: NextRequest, ctx: AuthContext) => {
  try {
    const id = req.url.split('/scheduled-posts/')[1]?.split('?')[0]

    if (!id) {
      return NextResponse.json(
        { error: 'ID do post é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o post existe
    const existingPost = await prisma.scheduledPost.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Não permitir exclusão de posts já publicados
    if (existingPost.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Não é possível excluir um post já publicado' },
        { status: 400 }
      )
    }

    // Excluir post
    await prisma.scheduledPost.delete({
      where: { id },
    })

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      action: 'scheduled_post.deleted',
      entity: 'scheduled_post',
      entityId: id,
      oldData: existingPost,
      request: req,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir post:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir post' },
      { status: 500 }
    )
  }
})
