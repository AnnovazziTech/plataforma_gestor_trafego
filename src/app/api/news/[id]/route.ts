import { NextRequest, NextResponse } from 'next/server'
import { withSuperAdmin } from '@/lib/api/middleware'
import prisma from '@/lib/db/prisma'

export const PATCH = withSuperAdmin(async (req: NextRequest) => {
  const id = req.url.split('/news/')[1]?.split('?')[0]
  const data = await req.json()

  const existing = await prisma.newsPost.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Noticia nao encontrada' }, { status: 404 })
  }

  const updateData: any = {}
  if (data.title) updateData.title = data.title
  if (data.content) updateData.content = data.content
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl
  if (typeof data.isPublished === 'boolean') updateData.isPublished = data.isPublished

  const post = await prisma.newsPost.update({
    where: { id },
    data: updateData,
    include: { author: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ post })
})

export const DELETE = withSuperAdmin(async (req: NextRequest) => {
  const id = req.url.split('/news/')[1]?.split('?')[0]

  const result = await prisma.newsPost.findUnique({ where: { id } })
  if (!result) {
    return NextResponse.json({ error: 'Noticia nao encontrada' }, { status: 404 })
  }

  await prisma.newsPost.delete({ where: { id } })
  return NextResponse.json({ success: true })
})
