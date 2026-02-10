// Seed dos modulos do sistema
// Executar: npx tsx prisma/seed-modules.ts

import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma'

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
  max: 5,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.DIRECT_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined,
})

const adapter = new PrismaPg(pool, { schema: 'sistema_gestor' })
const prisma = new PrismaClient({ adapter })

const modules = [
  // Módulos FREE (isEnabled: true, isFree: true)
  { slug: 'financeiro', name: 'Dashboard Financeiro', icon: 'DollarSign', route: '/dashboard', sortOrder: 0, isEnabled: true, isFree: true, description: 'Gestão financeira completa' },
  { slug: 'clientes', name: 'Clientes', icon: 'Users', route: '/clientes', sortOrder: 1, isEnabled: true, isFree: true, description: 'Gerenciamento de clientes' },
  { slug: 'controle-ads', name: 'Controle ADS', icon: 'Target', route: '/controle-ads', sortOrder: 2, isEnabled: true, isFree: true, description: 'Controle de orçamento de campanhas' },
  { slug: 'criativos-free', name: 'Criativos', icon: 'Image', route: '/criativos', sortOrder: 3, isEnabled: true, isFree: true, description: 'Biblioteca de criativos' },
  { slug: 'noticias', name: 'Notícias', icon: 'Newspaper', route: '/noticias', sortOrder: 4, isEnabled: true, isFree: true, description: 'Feed de notícias da plataforma' },
  { slug: 'resumo', name: 'Resumo', icon: 'LayoutDashboard', route: '/resumo', sortOrder: 5, isEnabled: true, isFree: true, description: 'Resumo por cliente com métricas' },
  { slug: 'agenda', name: 'Agenda', icon: 'CalendarDays', route: '/agenda', sortOrder: 6, isEnabled: true, isFree: true, description: 'Agenda de tarefas e compromissos' },
  { slug: 'orcamento', name: 'Orçamento', icon: 'Receipt', route: '/orcamento', sortOrder: 7, isEnabled: true, isFree: true, description: 'Propostas e orçamentos para clientes' },

  // Módulos PAGOS (isEnabled: false, isFree: false)
  { slug: 'campanhas', name: 'Campanhas', icon: 'BarChart3', route: '/campaigns', sortOrder: 10, isEnabled: false, isFree: false, description: 'Dashboard de campanhas com métricas' },
  { slug: 'analytics', name: 'Analytics', icon: 'TrendingUp', route: '/analytics', sortOrder: 11, isEnabled: false, isFree: false, description: 'Análise avançada de dados' },
  { slug: 'relatorios', name: 'Relatórios', icon: 'FileText', route: '/reports', sortOrder: 12, isEnabled: false, isFree: false, description: 'Geração de relatórios' },
  { slug: 'social', name: 'Redes Sociais', icon: 'Share2', route: '/social', sortOrder: 13, isEnabled: false, isFree: false, description: 'Agendamento de posts' },
  { slug: 'mensagens', name: 'Mensagens', icon: 'MessageSquare', route: '/mensagens', sortOrder: 14, isEnabled: false, isFree: false, description: 'CRM de mensagens' },
  { slug: 'automacao', name: 'Automação', icon: 'Zap', route: '/automation', sortOrder: 15, isEnabled: false, isFree: false, description: 'Automações inteligentes' },
  { slug: 'prospeccao', name: 'Prospecção', icon: 'Search', route: '/prospeccao', sortOrder: 16, isEnabled: false, isFree: false, description: 'Prospecção de clientes' },
  { slug: 'marketplace', name: 'Marketplace', icon: 'ShoppingBag', route: '/marketplace', sortOrder: 17, isEnabled: false, isFree: false, description: 'Loja de recursos' },
  { slug: 'cursos', name: 'Cursos', icon: 'GraduationCap', route: '/cursos', sortOrder: 18, isEnabled: false, isFree: false, description: 'Plataforma de cursos' },
  { slug: 'meu-link', name: 'Meu Link', icon: 'Link', route: '/meu-link', sortOrder: 19, isEnabled: false, isFree: false, description: 'Página de links personalizada' },
  { slug: 'meu-pensamento', name: 'Meu Pensamento', icon: 'Brain', route: '/meu-pensamento', sortOrder: 20, isEnabled: false, isFree: false, description: 'Notas e ideias' },
]

async function main() {
  console.log('Seeding system modules...')

  for (const mod of modules) {
    await prisma.systemModule.upsert({
      where: { slug: mod.slug },
      update: {
        name: mod.name,
        icon: mod.icon,
        route: mod.route,
        sortOrder: mod.sortOrder,
        isEnabled: mod.isEnabled,
        isFree: mod.isFree,
        description: mod.description,
      },
      create: mod,
    })
    console.log(`  ${mod.isEnabled ? '✓' : '○'} ${mod.name} (${mod.slug})`)
  }

  console.log(`\n${modules.length} modules seeded successfully!`)
}

main()
  .catch(e => {
    console.error('Error seeding modules:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
