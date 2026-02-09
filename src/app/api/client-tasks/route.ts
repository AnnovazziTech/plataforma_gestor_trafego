import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import prisma from '@/lib/db/prisma'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')

  const where: any = { organizationId: ctx.organizationId }
  if (clientId) where.clientId = clientId

  const tasks = await prisma.clientTask.findMany({
    where,
    include: { client: { select: { id: true, name: true } } },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json({ tasks })
})

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const data = await req.json()

  if (!data.clientId || !data.description || !data.date) {
    return NextResponse.json({ error: 'Cliente, descricao e data sao obrigatorios' }, { status: 400 })
  }

  const task = await prisma.clientTask.create({
    data: {
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      clientId: data.clientId,
      description: data.description,
      date: new Date(data.date),
    },
    include: { client: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ task }, { status: 201 })
})
