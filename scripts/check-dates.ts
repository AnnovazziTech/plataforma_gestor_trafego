import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma'

const pool = new Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Verificar metricas diarias dos ultimos 30 dias
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  console.log('Data de corte (30 dias atras):', startDate.toISOString())

  const dailyMetrics = await prisma.campaignDailyMetrics.aggregate({
    where: {
      date: { gte: startDate }
    },
    _sum: {
      spent: true,
      impressions: true,
      clicks: true,
      conversions: true,
    },
    _count: true
  })

  console.log('\nMetricas diarias dos ultimos 30 dias:')
  console.log('Total de registros:', dailyMetrics._count)
  console.log('Spent:', dailyMetrics._sum.spent)
  console.log('Impressions:', dailyMetrics._sum.impressions)
  console.log('Clicks:', dailyMetrics._sum.clicks)
  console.log('Conversions:', dailyMetrics._sum.conversions)

  // Ver datas das metricas
  const dates = await prisma.campaignDailyMetrics.findMany({
    select: { date: true },
    orderBy: { date: 'desc' },
    take: 5
  })
  console.log('\nUltimas 5 datas:', dates.map(d => d.date.toISOString().split('T')[0]))

  // Ver TODAS as datas
  const allDates = await prisma.campaignDailyMetrics.findMany({
    select: { date: true },
    distinct: ['date'],
    orderBy: { date: 'desc' },
  })
  console.log('\nTodas as datas unicas:', allDates.length)
  console.log('Primeira data:', allDates[allDates.length - 1]?.date.toISOString().split('T')[0])
  console.log('Ultima data:', allDates[0]?.date.toISOString().split('T')[0])

  await prisma.$disconnect()
  await pool.end()
}
main()
