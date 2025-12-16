/**
 * Converte uma string de periodo para datas de inicio e fim
 */
export function parseDateRange(rangeString: string): { start: Date; end: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(today)
  end.setHours(23, 59, 59, 999)

  let start = new Date(today)

  switch (rangeString) {
    case 'Hoje':
      // start ja esta em hoje
      break

    case 'Ontem':
      start.setDate(start.getDate() - 1)
      end.setDate(end.getDate() - 1)
      break

    case 'Ultimos 7 dias':
    case 'Últimos 7 dias':
      start.setDate(start.getDate() - 7)
      break

    case 'Ultimos 30 dias':
    case 'Últimos 30 dias':
      start.setDate(start.getDate() - 30)
      break

    case 'Este mes':
    case 'Este mês':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      break

    case 'Mes passado':
    case 'Mês passado':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      end.setDate(0) // ultimo dia do mes anterior
      break

    case 'Ultimos 90 dias':
    case 'Últimos 90 dias':
      start.setDate(start.getDate() - 90)
      break

    case 'Este ano':
      start = new Date(now.getFullYear(), 0, 1)
      break

    default:
      // Default: ultimos 30 dias
      start.setDate(start.getDate() - 30)
      break
  }

  return { start, end }
}

/**
 * Formata datas para uso em query strings da API
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Retorna os parametros de query string para um periodo
 */
export function getDateRangeParams(rangeString: string): string {
  const { start, end } = parseDateRange(rangeString)
  return `startDate=${formatDateForAPI(start)}&endDate=${formatDateForAPI(end)}`
}
