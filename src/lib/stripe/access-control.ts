// Controle de acesso por módulo baseado em pacotes
import prisma from '@/lib/db/prisma'

// Grace period: PAST_DUE ainda tem acesso por 7 dias apos fim do periodo
const GRACE_PERIOD_DAYS = 7

/**
 * Retorna array de slugs de módulos acessíveis para uma organização
 */
export async function getOrganizationModules(orgId: string): Promise<string[]> {
  // Buscar pacotes ativos ou em grace period
  const orgPackages = await prisma.organizationPackage.findMany({
    where: {
      organizationId: orgId,
      status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] },
    },
    include: {
      package: true,
    },
  })

  // Filtrar PAST_DUE que ja passaram do grace period
  const now = new Date()
  const validPackages = orgPackages.filter(op => {
    if (op.status === 'PAST_DUE' && op.currentPeriodEnd) {
      const graceDeadline = new Date(op.currentPeriodEnd)
      graceDeadline.setDate(graceDeadline.getDate() + GRACE_PERIOD_DAYS)
      return now < graceDeadline
    }
    return true
  })

  // Sempre incluir módulos do Starter (free)
  const starterPackage = await prisma.package.findFirst({
    where: { isFree: true, isActive: true },
  })

  const accessibleSlugs = new Set<string>()

  // Adicionar módulos do Starter
  if (starterPackage) {
    for (const slug of starterPackage.modulesSlugs) {
      accessibleSlugs.add(slug)
    }
  }

  // Se tem pacote bundle ativo, retornar TODOS os módulos
  const hasBundle = validPackages.some(op => op.package.isBundle)
  if (hasBundle) {
    const allModules = await prisma.systemModule.findMany({
      where: { isEnabled: true },
      select: { slug: true },
    })
    for (const mod of allModules) {
      accessibleSlugs.add(mod.slug)
    }
    return Array.from(accessibleSlugs)
  }

  // Adicionar módulos dos pacotes ativos
  for (const op of validPackages) {
    for (const slug of op.package.modulesSlugs) {
      accessibleSlugs.add(slug)
    }
  }

  return Array.from(accessibleSlugs)
}

/**
 * Verifica se organização pode acessar um módulo específico
 */
export async function canAccessModule(orgId: string, moduleSlug: string): Promise<boolean> {
  const modules = await getOrganizationModules(orgId)
  return modules.includes(moduleSlug)
}
