import { NextRequest, NextResponse } from 'next/server'
import { withSuperAdmin } from '@/lib/api/middleware'
import prisma from '@/lib/db/prisma'

export const GET = withSuperAdmin(async () => {
  const modules = await prisma.systemModule.findMany({
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json({ modules })
})

export const PATCH = withSuperAdmin(async (req: NextRequest) => {
  const { id, isEnabled, sortOrder } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'ID do modulo obrigatorio' }, { status: 400 })
  }

  const data: any = {}
  if (typeof isEnabled === 'boolean') data.isEnabled = isEnabled
  if (typeof sortOrder === 'number') data.sortOrder = sortOrder

  const module = await prisma.systemModule.update({
    where: { id },
    data,
  })

  return NextResponse.json({ module })
})
