import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import prisma from '@/lib/db/prisma'
import { getOrganizationModules } from '@/lib/stripe/access-control'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    // SuperAdmin: ve TODOS os modulos (inclusive inativos), todos acessiveis
    if (token?.isSuperAdmin) {
      const allModules = await prisma.systemModule.findMany({
        orderBy: { sortOrder: 'asc' },
      })
      const modulesWithAccess = allModules.map(mod => ({
        ...mod,
        isAccessible: true,
      }))
      return NextResponse.json({ modules: modulesWithAccess })
    }

    // Usuarios normais: so modulos ativos (isEnabled = true)
    const modules = await prisma.systemModule.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: 'asc' },
    })

    // Se autenticado, adicionar isAccessible baseado em pacotes
    if (token?.organizationId) {
      const accessibleSlugs = await getOrganizationModules(token.organizationId as string)
      const modulesWithAccess = modules.map(mod => ({
        ...mod,
        isAccessible: accessibleSlugs.includes(mod.slug),
      }))
      return NextResponse.json({ modules: modulesWithAccess })
    }

    // Sem auth: todos os modulos free sao acessiveis
    const modulesWithAccess = modules.map(mod => ({
      ...mod,
      isAccessible: mod.isFree,
    }))
    return NextResponse.json({ modules: modulesWithAccess })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
