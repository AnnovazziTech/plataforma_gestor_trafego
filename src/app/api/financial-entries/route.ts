import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import prisma from '@/lib/db/prisma'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const clientId = searchParams.get('clientId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const where: any = { organizationId: ctx.organizationId }
  if (type) where.type = type
  if (clientId) where.clientId = clientId
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = new Date(startDate)
    if (endDate) where.date.lte = new Date(endDate)
  }

  const entries = await prisma.financialEntry.findMany({
    where,
    include: { client: { select: { id: true, name: true } } },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json({ entries })
})

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const data = await req.json()

  if (!data.type || data.amount == null || !data.date) {
    return NextResponse.json({ error: 'Tipo, valor e data sao obrigatorios' }, { status: 400 })
  }

  const entry = await prisma.financialEntry.create({
    data: {
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: new Date(data.date),
      clientId: data.clientId || null,
    },
    include: { client: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ entry }, { status: 201 })
})
