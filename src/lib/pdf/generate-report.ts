import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Report } from '@/types'

const typeLabels: Record<string, string> = {
  performance: 'Relatório de Performance',
  audience: 'Relatório de Audiência',
  creative: 'Relatório de Criativos',
  custom: 'Relatório Personalizado',
}

const frequencyLabels: Record<string, string> = {
  once: 'Único',
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  custom: 'Personalizado',
}

const platformLabels: Record<string, string> = {
  meta: 'Meta Ads',
  META: 'Meta Ads',
  google: 'Google Ads',
  GOOGLE: 'Google Ads',
  linkedin: 'LinkedIn Ads',
  LINKEDIN: 'LinkedIn Ads',
  tiktok: 'TikTok Ads',
  TIKTOK: 'TikTok Ads',
  twitter: 'Twitter Ads',
  TWITTER: 'Twitter Ads',
}

const metricLabels: Record<string, string> = {
  impressions: 'Impressões',
  clicks: 'Cliques',
  ctr: 'CTR',
  cpc: 'CPC',
  conversions: 'Conversões',
  spent: 'Investimento',
  investment: 'Investimento',
  roas: 'ROAS',
  cpa: 'CPA',
  reach: 'Alcance',
  frequency: 'Frequência',
  leads: 'Leads',
  cpl: 'CPL',
  videoViews: 'Visualizações de Vídeo',
  engagement: 'Engajamento',
}

function formatMetricValue(key: string, value: number | undefined): string {
  if (value === undefined || value === null) return '-'

  switch (key) {
    case 'impressions':
    case 'clicks':
    case 'conversions':
    case 'reach':
    case 'leads':
    case 'videoViews':
      return value.toLocaleString('pt-BR')
    case 'ctr':
    case 'engagement':
      return `${value.toFixed(2)}%`
    case 'cpc':
    case 'cpa':
    case 'cpl':
    case 'spent':
    case 'investment':
      return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    case 'roas':
      return `${value.toFixed(2)}x`
    case 'frequency':
      return value.toFixed(1)
    default:
      return typeof value === 'number' ? value.toLocaleString('pt-BR') : String(value)
  }
}

export function generateReportPDF(report: Report): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header with gradient effect (simulated with rectangles)
  doc.setFillColor(18, 18, 26)
  doc.rect(0, 0, pageWidth, 50, 'F')

  // Logo/Title
  doc.setFontSize(24)
  doc.setTextColor(255, 255, 255)
  doc.text('TrafficPro', 20, 25)

  doc.setFontSize(12)
  doc.setTextColor(107, 107, 123)
  doc.text(typeLabels[report.type] || 'Relatório', 20, 35)

  // Report Info
  doc.setFontSize(18)
  doc.setTextColor(59, 130, 246)
  doc.text(report.name, 20, 70)

  doc.setFontSize(10)
  doc.setTextColor(107, 107, 123)
  doc.text(`Tipo: ${typeLabels[report.type] || report.type}`, 20, 80)
  doc.text(`Frequência: ${frequencyLabels[report.frequency] || report.frequency}`, 20, 87)

  const startDate = new Date(report.dateRange.start).toLocaleDateString('pt-BR')
  const endDate = new Date(report.dateRange.end).toLocaleDateString('pt-BR')
  doc.text(`Período: ${startDate} - ${endDate}`, 20, 94)

  // Platforms
  const platformNames = report.platforms.map(p => platformLabels[p] || p).join(', ')
  doc.text(`Plataformas: ${platformNames}`, 20, 101)

  // Generation date
  const generatedAt = report.reportData?.generatedAt
    ? new Date(report.reportData.generatedAt).toLocaleString('pt-BR')
    : new Date().toLocaleString('pt-BR')
  doc.text(`Gerado em: ${generatedAt}`, 20, 108)

  // Separator
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.line(20, 115, pageWidth - 20, 115)

  // Metrics Summary Section
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text('Resumo de Métricas', 20, 130)

  // Use real data from reportData if available
  const aggregatedMetrics = report.reportData?.aggregatedMetrics
  let metricsData: string[][]

  if (aggregatedMetrics && Object.keys(aggregatedMetrics).length > 0) {
    // Use real data
    metricsData = [['Métrica', 'Valor']]

    // Add metrics based on what was selected
    const metricsToShow = report.metrics.length > 0 ? report.metrics : Object.keys(aggregatedMetrics)

    metricsToShow.forEach(metric => {
      const value = (aggregatedMetrics as any)[metric]
      if (value !== undefined) {
        metricsData.push([
          metricLabels[metric] || metric,
          formatMetricValue(metric, value),
        ])
      }
    })
  } else {
    // Sem dados disponíveis
    metricsData = [
      ['Métrica', 'Valor'],
      ['Impressões', '-'],
      ['Cliques', '-'],
      ['CTR', '-'],
      ['CPC', '-'],
      ['Conversões', '-'],
      ['Investimento', '-'],
      ['ROAS', '-'],
      ['CPA', '-'],
    ]
  }

  autoTable(doc, {
    startY: 135,
    head: [metricsData[0]],
    body: metricsData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: [160, 160, 176],
    },
    alternateRowStyles: {
      fillColor: [24, 24, 35],
    },
    styles: {
      cellPadding: 5,
      fontSize: 10,
    },
  })

  // Campaign Performance Section (if available)
  const finalY = (doc as any).lastAutoTable.finalY + 20
  const campaignData = report.reportData?.campaignData

  if (campaignData && campaignData.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text('Performance por Campanha', 20, finalY)

    const campaignTableData = [
      ['Campanha', 'Status', 'Impressões', 'Cliques', 'Conv.', 'Invest.'],
      ...campaignData.map(campaign => [
        campaign.name.length > 25 ? campaign.name.substring(0, 22) + '...' : campaign.name,
        campaign.status === 'ACTIVE' ? 'Ativa' : campaign.status === 'PAUSED' ? 'Pausada' : campaign.status,
        campaign.impressions.toLocaleString('pt-BR'),
        campaign.clicks.toLocaleString('pt-BR'),
        campaign.conversions.toLocaleString('pt-BR'),
        `R$ ${campaign.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      ])
    ]

    autoTable(doc, {
      startY: finalY + 5,
      head: [campaignTableData[0]],
      body: campaignTableData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [250, 204, 21],
        textColor: [18, 18, 26],
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: [160, 160, 176],
      },
      alternateRowStyles: {
        fillColor: [24, 24, 35],
      },
      styles: {
        cellPadding: 5,
        fontSize: 9,
      },
    })
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFontSize(8)
  doc.setTextColor(107, 107, 123)
  doc.text('TrafficPro - Plataforma de Gestão de Tráfego', 20, pageHeight - 20)
  doc.text(`Página 1 de 1`, pageWidth - 40, pageHeight - 20)

  // Download the PDF
  const fileName = `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

export function generateQuickReportPDF(
  name: string,
  platform: string,
  startDate: string,
  endDate: string,
  metrics: string[],
  reportData?: any
): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(18, 18, 26)
  doc.rect(0, 0, pageWidth, 50, 'F')

  doc.setFontSize(24)
  doc.setTextColor(255, 255, 255)
  doc.text('TrafficPro', 20, 25)

  doc.setFontSize(12)
  doc.setTextColor(107, 107, 123)
  doc.text('Relatório Rápido', 20, 35)

  // Report Info
  doc.setFontSize(18)
  doc.setTextColor(59, 130, 246)
  doc.text(name, 20, 70)

  doc.setFontSize(10)
  doc.setTextColor(107, 107, 123)
  doc.text(`Plataforma: ${platformLabels[platform] || platform}`, 20, 80)
  doc.text(`Período: ${new Date(startDate).toLocaleDateString('pt-BR')} - ${new Date(endDate).toLocaleDateString('pt-BR')}`, 20, 87)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 94)

  // Separator
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.line(20, 100, pageWidth - 20, 100)

  // Selected Metrics
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text('Métricas Selecionadas', 20, 115)

  // Use real data if available
  const aggregatedMetrics = reportData?.aggregatedMetrics
  let selectedMetricsData: string[][]

  if (aggregatedMetrics && Object.keys(aggregatedMetrics).length > 0) {
    selectedMetricsData = metrics.map(metric => [
      metricLabels[metric] || metric,
      formatMetricValue(metric, aggregatedMetrics[metric]),
    ])
  } else {
    // Sem dados disponíveis - mostrar traços
    selectedMetricsData = metrics.map(metric => [
      metricLabels[metric] || metric,
      '-',
    ])
  }

  autoTable(doc, {
    startY: 120,
    head: [['Métrica', 'Valor']],
    body: selectedMetricsData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: [160, 160, 176],
    },
    alternateRowStyles: {
      fillColor: [24, 24, 35],
    },
    styles: {
      cellPadding: 8,
      fontSize: 11,
    },
  })

  // Campaign data if available
  const campaignData = reportData?.campaignData
  if (campaignData && campaignData.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY + 20

    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text('Campanhas Incluídas', 20, finalY)

    const campaignTableData = [
      ['Campanha', 'Status', 'Impressões', 'Cliques', 'Conv.'],
      ...campaignData.slice(0, 10).map((campaign: any) => [
        campaign.name.length > 30 ? campaign.name.substring(0, 27) + '...' : campaign.name,
        campaign.status === 'ACTIVE' ? 'Ativa' : campaign.status === 'PAUSED' ? 'Pausada' : campaign.status,
        campaign.impressions.toLocaleString('pt-BR'),
        campaign.clicks.toLocaleString('pt-BR'),
        campaign.conversions.toLocaleString('pt-BR'),
      ])
    ]

    autoTable(doc, {
      startY: finalY + 5,
      head: [campaignTableData[0]],
      body: campaignTableData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [250, 204, 21],
        textColor: [18, 18, 26],
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: [160, 160, 176],
      },
      alternateRowStyles: {
        fillColor: [24, 24, 35],
      },
      styles: {
        cellPadding: 5,
        fontSize: 9,
      },
    })
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFontSize(8)
  doc.setTextColor(107, 107, 123)
  doc.text('TrafficPro - Plataforma de Gestão de Tráfego', 20, pageHeight - 20)
  doc.text(`Página 1 de 1`, pageWidth - 40, pageHeight - 20)

  // Download
  const fileName = `${name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
