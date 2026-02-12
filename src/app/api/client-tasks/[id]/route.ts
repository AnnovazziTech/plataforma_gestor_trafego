import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import prisma from '@/lib/db/prisma'

export const PATCH = withAuth(async (req: NextRequest, ctx) => {
  const id = req.url.split('/client-tasks/')[1]?.split('?')[0]
  const data = await req.json()

  const existing = await prisma.clientTask.findFirst({
    where: { id, organizationId: ctx.organizationId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 })
  }

  const task = await prisma.clientTask.update({
    where: { id },
    data: {
      completed: typeof data.completed === 'boolean' ? data.completed : existing.completed,
      description: data.description || existing.description,
      date: data.date ? new Date(data.date) : existing.date,
      clientId: data.clientId || existing.clientId,
    },
    include: { client: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ task })
})

export const DELETE = withAuth(async (req: NextRequest, ctx) => {
  const id = req.url.split('/client-tasks/')[1]?.split('?')[0]

  const result = await prisma.clientTask.deleteMany({
    where: { id, organizationId: ctx.organizationId },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
})
