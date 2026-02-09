import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import prisma from '@/lib/db/prisma'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const id = req.url.split('/budget-strategies/')[1]?.split('?')[0]

  const strategy = await prisma.budgetStrategy.findFirst({
    where: { id, organizationId: ctx.organizationId },
    include: {
      client: { select: { id: true, name: true } },
      campaigns: true,
    },
  })

  if (!strategy) {
    return NextResponse.json({ error: 'Estrategia nao encontrada' }, { status: 404 })
  }

  return NextResponse.json({ strategy })
})

export const DELETE = withAuth(async (req: NextRequest, ctx) => {
  const id = req.url.split('/budget-strategies/')[1]?.split('?')[0]

  const result = await prisma.budgetStrategy.deleteMany({
    where: { id, organizationId: ctx.organizationId },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: 'Estrategia nao encontrada' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
})
