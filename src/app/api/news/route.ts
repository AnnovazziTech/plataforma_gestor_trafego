import { NextRequest, NextResponse } from 'next/server'
import { withSuperAdmin } from '@/lib/api/middleware'
import prisma from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const showAll = req.nextUrl.searchParams.get('all') === 'true'
    const posts = await prisma.newsPost.findMany({
      where: showAll ? {} : { isPublished: true },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ posts })
  } catch (error) {
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
      linkUrl: data.linkUrl || null,
      isPublished: data.isPublished !== false,
      authorId: ctx.userId,
    },
    include: { author: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ post }, { status: 201 })
})
