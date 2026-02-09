import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import prisma from '@/lib/db/prisma'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const { searchParams } = new URL(req.url)
  const months = parseInt(searchParams.get('months') || '6')

  // Buscar todas as entradas da organizacao
  const entries = await prisma.financialEntry.findMany({
    where: { organizationId: ctx.organizationId },
    orderBy: { date: 'desc' },
  })

  // Calcular totais
  const totalIncome = entries
    .filter(e => e.type === 'INCOME')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalExpenses = entries
    .filter(e => e.type === 'EXPENSE')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalAssets = entries
    .filter(e => e.type === 'ASSET')
    .reduce((sum, e) => sum + e.amount, 0)

  const balance = totalIncome - totalExpenses

  // Buscar receita mensal de clientes ativos
  const clients = await prisma.client.findMany({
    where: {
      organizationId: ctx.organizationId,
      status: { in: ['ACTIVE', 'TESTING'] },
    },
  })

  const monthlyRevenue = clients.reduce((sum, c) => sum + (c.monthlyValue || 0), 0)

  // Chart data: ultimos N meses
  const chartData = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

    const monthEntries = entries.filter(e => {
      const d = new Date(e.date)
      return d >= monthStart && d <= monthEnd
    })

    const income = monthEntries
      .filter(e => e.type === 'INCOME')
      .reduce((sum, e) => sum + e.amount, 0)

    const expenses = monthEntries
      .filter(e => e.type === 'EXPENSE')
      .reduce((sum, e) => sum + e.amount, 0)

    const assets = monthEntries
      .filter(e => e.type === 'ASSET')
      .reduce((sum, e) => sum + e.amount, 0)

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

    chartData.push({
      month: monthNames[monthStart.getMonth()],
      year: monthStart.getFullYear(),
      income,
      expenses,
      assets,
      balance: income - expenses,
    })
  }

  return NextResponse.json({
    totalIncome,
    totalExpenses,
    totalAssets,
    balance,
    monthlyRevenue,
    activeClients: clients.filter(c => c.status === 'ACTIVE').length,
    testingClients: clients.filter(c => c.status === 'TESTING').length,
    chartData,
  })
})
