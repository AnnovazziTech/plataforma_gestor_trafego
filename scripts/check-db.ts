// Script para verificar dados no banco de dados
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
  console.log('Verificando dados no banco de dados...\n')

  // 1. Planos
  const plans = await prisma.plan.findMany()
  console.log(`📋 PLANOS: ${plans.length}`)
  plans.forEach(p => console.log(`   - ${p.name} (${p.slug}) - R$${p.priceMonthly}/mês`))

  // 2. Usuários
  const users = await prisma.user.findMany()
  console.log(`\n👤 USUÁRIOS: ${users.length}`)
  users.forEach(u => console.log(`   - ${u.name} (${u.email})`))

  // 3. Organizações
  const orgs = await prisma.organization.findMany({ include: { plan: true } })
  console.log(`\n🏢 ORGANIZAÇÕES: ${orgs.length}`)
  orgs.forEach(o => console.log(`   - ${o.name} (${o.slug}) - Plano: ${o.plan.name}`))

  // 4. Membros
  const members = await prisma.organizationMember.findMany({
    include: { user: true, organization: true }
  })
  console.log(`\n👥 MEMBROS: ${members.length}`)
  members.forEach(m => console.log(`   - ${m.user.name} @ ${m.organization.name} (${m.role})`))

  // 5. Integrações
  const integrations = await prisma.integration.findMany()
  console.log(`\n🔗 INTEGRAÇÕES: ${integrations.length}`)
  integrations.forEach(i => console.log(`   - ${i.name} (${i.platform}) - ${i.status}`))

  // 6. Campanhas
  const campaigns = await prisma.campaign.findMany({
    include: { metrics: true }
  })
  console.log(`\n📢 CAMPANHAS: ${campaigns.length}`)
  campaigns.forEach(c => {
    const metrics = c.metrics[0]
    console.log(`   - ${c.name} (${c.platform})`)
    console.log(`     Status: ${c.status} | Budget: R$${c.budget} | Spent: R$${c.spent}`)
    if (metrics) {
      console.log(`     Impressions: ${metrics.impressions} | Clicks: ${metrics.clicks} | CTR: ${metrics.ctr}%`)
    }
  })

  // 7. Métricas Diárias
  const dailyMetrics = await prisma.campaignDailyMetrics.count()
  console.log(`\n📊 MÉTRICAS DIÁRIAS: ${dailyMetrics} registros`)

  // 8. Leads
  const leads = await prisma.lead.findMany()
  const leadsByStatus: Record<string, number> = {}
  leads.forEach(l => {
    leadsByStatus[l.status] = (leadsByStatus[l.status] || 0) + 1
  })
  console.log(`\n🎯 LEADS: ${leads.length}`)
  Object.entries(leadsByStatus).forEach(([status, count]) => {
    console.log(`   - ${status}: ${count}`)
  })

  // 9. Conversas
  const conversations = await prisma.conversation.findMany({
    include: { messages: true }
  })
  console.log(`\n💬 CONVERSAS: ${conversations.length}`)
  let totalMessages = 0
  conversations.forEach(c => {
    totalMessages += c.messages.length
    console.log(`   - ${c.contactName} (${c.contactPhone}) - ${c.messages.length} msgs`)
  })
  console.log(`   Total de mensagens: ${totalMessages}`)

  // 10. Templates de Arte
  const templates = await prisma.artTemplate.findMany()
  const templatesByNiche: Record<string, number> = {}
  templates.forEach(t => {
    templatesByNiche[t.niche] = (templatesByNiche[t.niche] || 0) + 1
  })
  console.log(`\n🎨 TEMPLATES DE ARTE: ${templates.length}`)
  Object.entries(templatesByNiche).forEach(([niche, count]) => {
    console.log(`   - ${niche}: ${count}`)
  })

  // 11. Criativos
  const creatives = await prisma.creative.count()
  console.log(`\n🖼️ CRIATIVOS: ${creatives}`)

  console.log('\n========================================')
  console.log('✅ VERIFICAÇÃO COMPLETA')
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
