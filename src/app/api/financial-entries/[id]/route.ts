import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import prisma from '@/lib/db/prisma'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const id = req.url.split('/financial-entries/')[1]?.split('?')[0]

  const entry = await prisma.financialEntry.findFirst({
    where: { id, organizationId: ctx.organizationId },
    include: { client: { select: { id: true, name: true } } },
  })

  if (!entry) {
    return NextResponse.json({ error: 'Lancamento nao encontrado' }, { status: 404 })
  }

  return NextResponse.json({ entry })
})

export const DELETE = withAuth(async (req: NextRequest, ctx) => {
  const id = req.url.split('/financial-entries/')[1]?.split('?')[0]

  const result = await prisma.financialEntry.deleteMany({
    where: { id, organizationId: ctx.organizationId },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: 'Lancamento nao encontrado' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
})
