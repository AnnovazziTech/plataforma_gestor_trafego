// API Route: Packages (público)
// GET - Listar todos os pacotes ativos

import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        priceMonthly: true,
        currency: true,
        modulesSlugs: true,
        isBundle: true,
        isFree: true,
        sortOrder: true,
      },
    })

    return NextResponse.json({ packages })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar pacotes' }, { status: 500 })
  }
}
