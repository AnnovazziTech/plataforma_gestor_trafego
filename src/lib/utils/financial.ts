export function calculateTotalRevenue(monthlyValue: number, startDate: string | Date): number {
  const start = new Date(startDate)
  const now = new Date()
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  return Math.max(0, months) * monthlyValue
}

export function calcularPrevisao30D(dailyBudget: number): number {
  return dailyBudget * 30
}

export function calcularFinalizaraEm(totalBudget: number, spent: number, dailyBudget: number): number {
  if (dailyBudget <= 0) return Infinity
  const remaining = totalBudget - spent
  return Math.max(0, Math.ceil(remaining / dailyBudget))
}

export function calcularSobrou(totalBudget: number, campaignSpents: number[]): number {
  const totalSpent = campaignSpents.reduce((sum, s) => sum + s, 0)
  return totalBudget - totalSpent
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}
