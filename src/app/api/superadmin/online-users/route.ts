import { NextRequest, NextResponse } from 'next/server'
import { withSuperAdmin } from '@/lib/api/middleware'
import prisma from '@/lib/db/prisma'

export const GET = withSuperAdmin(async (_req: NextRequest) => {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)

  const users = await prisma.user.findMany({
    where: {
      lastActivityAt: { gte: twoMinutesAgo },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      lastActivityAt: true,
    },
    orderBy: { lastActivityAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({
    count: users.length,
    users,
  })
})
