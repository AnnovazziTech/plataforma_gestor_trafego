import { NextRequest, NextResponse } from 'next/server'
import { withSuperAdmin } from '@/lib/api/middleware'
import prisma from '@/lib/db/prisma'

export async function GET() {
  try {
    const posts = await prisma.newsPost.findMany({
      where: { isPublished: true },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Erro ao buscar noticias:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export const POST = withSuperAdmin(async (req: NextRequest, ctx) => {
  const data = await req.json()

  if (!data.title || !data.content) {
    return NextResponse.json({ error: 'Titulo e conteudo sao obrigatorios' }, { status: 400 })
  }

  const post = await prisma.newsPost.create({
    data: {
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl,
      isPublished: data.isPublished !== false,
      authorId: ctx.userId,
    },
    include: { author: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ post }, { status: 201 })
})
