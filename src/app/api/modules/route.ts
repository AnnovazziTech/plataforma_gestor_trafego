import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

export async function GET() {
  try {
    const modules = await prisma.systemModule.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ modules })
  } catch (error) {
    console.error('Erro ao buscar modulos:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
