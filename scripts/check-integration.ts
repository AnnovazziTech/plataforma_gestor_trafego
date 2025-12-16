// Script de verificacao de integracao backend-frontend
import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma'

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('========================================')
  console.log('VERIFICACAO DE INTEGRACAO BACKEND')
  console.log('========================================\n')

  // 1. Verificar conexao com banco
  console.log('1. Conexao com banco de dados...')
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('   ✅ Banco de dados conectado\n')
  } catch (error) {
    console.log('   ❌ Erro de conexao com banco:', error)
    process.exit(1)
  }

  // 2. Verificar usuario de teste
  console.log('2. Usuario de teste...')
  const user = await prisma.user.findUnique({
    where: { email: 'demo@trafficpro.com' },
  })
  if (user) {
    console.log(`   ✅ Usuario encontrado: ${user.name} (${user.email})`)
    console.log(`   📋 ID: ${user.id}\n`)
  } else {
    console.log('   ❌ Usuario demo nao encontrado. Execute: npx tsx prisma/seed.ts\n')
    process.exit(1)
  }

  // 3. Verificar organizacao
  console.log('3. Organizacao do usuario...')
  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: {
      organization: {
        include: { plan: true },
      },
    },
  })
  if (membership) {
    console.log(`   ✅ Organizacao: ${membership.organization.name}`)
    console.log(`   📋 ID: ${membership.organization.id}`)
    console.log(`   💼 Plano: ${membership.organization.plan.name}`)
    console.log(`   👤 Role: ${membership.role}\n`)
  } else {
    console.log('   ❌ Usuario nao pertence a nenhuma organizacao\n')
    process.exit(1)
  }

  const orgId = membership.organization.id

  // 4. Verificar integracoes
  console.log('4. Integracoes da organizacao...')
  const integrations = await prisma.integration.findMany({
    where: { organizationId: orgId },
  })
  console.log(`   ✅ ${integrations.length} integracoes encontradas:`)
  integrations.forEach((i) => {
    console.log(`      - ${i.platform}: ${i.name} (${i.status})`)
  })
  console.log()

  // 5. Verificar campanhas
  console.log('5. Campanhas da organizacao...')
  const campaigns = await prisma.campaign.findMany({
    where: { organizationId: orgId },
    include: { metrics: { take: 1 } },
  })
  console.log(`   ✅ ${campaigns.length} campanhas encontradas:`)
  campaigns.forEach((c) => {
    const metrics = c.metrics[0]
    console.log(`      - ${c.name} (${c.platform})`)
    console.log(`        Status: ${c.status} | Budget: R$${c.budget} | Spent: R$${c.spent}`)
    if (metrics) {
      console.log(`        Impressions: ${metrics.impressions} | Clicks: ${metrics.clicks}`)
    }
  })
  console.log()

  // 6. Verificar leads
  console.log('6. Leads da organizacao...')
  const leads = await prisma.lead.findMany({
    where: { organizationId: orgId },
  })
  console.log(`   ✅ ${leads.length} leads encontrados:`)
  const leadsByStatus: Record<string, number> = {}
  leads.forEach((l) => {
    leadsByStatus[l.status] = (leadsByStatus[l.status] || 0) + 1
  })
  Object.entries(leadsByStatus).forEach(([status, count]) => {
    console.log(`      - ${status}: ${count}`)
  })
  console.log()

  // 7. Verificar conversas
  console.log('7. Conversas da organizacao...')
  const conversations = await prisma.conversation.findMany({
    where: { organizationId: orgId },
    include: { messages: true },
  })
  console.log(`   ✅ ${conversations.length} conversas encontradas`)
  const totalMessages = conversations.reduce((acc, c) => acc + c.messages.length, 0)
  console.log(`   💬 Total de mensagens: ${totalMessages}\n`)

  // 8. Verificar templates de arte
  console.log('8. Templates de arte (globais)...')
  const templates = await prisma.artTemplate.count()
  console.log(`   ✅ ${templates} templates disponiveis\n`)

  // 9. Verificar criativos
  console.log('9. Criativos da organizacao...')
  const creatives = await prisma.creative.count({
    where: { organizationId: orgId },
  })
  console.log(`   ${creatives > 0 ? '✅' : '⚠️'} ${creatives} criativos salvos`)
  if (creatives === 0) {
    console.log('   (criativos serao criados quando usuarios salvarem do spy)\n')
  } else {
    console.log()
  }

  // 10. Simular resposta da API
  console.log('10. Simulando resposta da API /api/campaigns...')
  const apiCampaigns = campaigns.map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    platform: campaign.platform,
    status: campaign.status,
    objective: campaign.objective,
    budget: campaign.budget,
    budgetType: campaign.budgetType,
    spent: campaign.spent,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    metrics: campaign.metrics[0] || null,
    leadsCount: leads.filter((l) => l.campaignId === campaign.id).length,
    lastSyncAt: campaign.lastSyncAt,
    createdAt: campaign.createdAt,
  }))
  console.log(`   ✅ API retornaria ${apiCampaigns.length} campanhas formatadas\n`)

  // Resumo final
  console.log('========================================')
  console.log('RESULTADO DA VERIFICACAO')
  console.log('========================================')
  console.log('✅ Banco de dados: OK')
  console.log('✅ Usuario demo: OK')
  console.log('✅ Organizacao: OK')
  console.log(`✅ Integracoes: ${integrations.length}`)
  console.log(`✅ Campanhas: ${campaigns.length}`)
  console.log(`✅ Leads: ${leads.length}`)
  console.log(`✅ Conversas: ${conversations.length}`)
  console.log(`✅ Templates: ${templates}`)
  console.log(`${creatives > 0 ? '✅' : '⚠️'} Criativos: ${creatives}`)
  console.log('')
  console.log('========================================')
  console.log('DADOS DE LOGIN PARA TESTE:')
  console.log('========================================')
  console.log('Email: demo@trafficpro.com')
  console.log('Senha: Demo@123')
  console.log('========================================\n')
}

main()
  .catch((e) => {
    console.error('Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
