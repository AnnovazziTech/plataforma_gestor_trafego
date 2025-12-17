import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Quote } from '@/types'

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  sent: 'Enviado',
  viewed: 'Visualizado',
  accepted: 'Aceito',
  rejected: 'Rejeitado',
  expired: 'Expirado',
}

export function generateQuotePDF(quote: Quote): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Header with gradient effect (simulated with rectangles)
  doc.setFillColor(18, 18, 26)
  doc.rect(0, 0, pageWidth, 55, 'F')

  // Logo/Title
  doc.setFontSize(28)
  doc.setTextColor(255, 255, 255)
  doc.text('TrafficPro', 20, 25)

  doc.setFontSize(11)
  doc.setTextColor(107, 107, 123)
  doc.text('Plataforma de Gestão de Tráfego', 20, 35)

  // Quote number and date (right side of header)
  doc.setFontSize(14)
  doc.setTextColor(250, 204, 21)
  doc.text(quote.number, pageWidth - 20, 25, { align: 'right' })

  doc.setFontSize(10)
  doc.setTextColor(107, 107, 123)
  doc.text(`Emitido em: ${new Date(quote.createdAt).toLocaleDateString('pt-BR')}`, pageWidth - 20, 35, { align: 'right' })
  doc.text(`Válido até: ${new Date(quote.validUntil).toLocaleDateString('pt-BR')}`, pageWidth - 20, 43, { align: 'right' })

  // Title
  doc.setFontSize(20)
  doc.setTextColor(59, 130, 246)
  doc.text('ORÇAMENTO', 20, 72)

  // Client Info Box
  doc.setFillColor(24, 24, 35)
  doc.roundedRect(20, 80, pageWidth - 40, 40, 3, 3, 'F')

  doc.setFontSize(10)
  doc.setTextColor(107, 107, 123)
  doc.text('CLIENTE', 28, 92)

  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text(quote.client.name, 28, 102)

  doc.setFontSize(10)
  doc.setTextColor(160, 160, 176)
  let clientInfoY = 112
  if (quote.client.company) {
    doc.text(`Empresa: ${quote.client.company}`, 28, clientInfoY)
    clientInfoY += 7
  }

  // Client contact info on the right side
  doc.setTextColor(160, 160, 176)
  doc.text(quote.client.email, pageWidth - 28, 92, { align: 'right' })
  if (quote.client.phone) {
    doc.text(quote.client.phone, pageWidth - 28, 100, { align: 'right' })
  }
  if (quote.client.document) {
    doc.text(`CPF/CNPJ: ${quote.client.document}`, pageWidth - 28, 108, { align: 'right' })
  }

  // Services Table
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text('Serviços', 20, 135)

  const servicesData = quote.services.map(service => [
    service.name,
    service.description,
    service.quantity.toString(),
    `R$ ${service.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `R$ ${service.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  ])

  autoTable(doc, {
    startY: 140,
    head: [['Serviço', 'Descrição', 'Qtd', 'Preço Unit.', 'Total']],
    body: servicesData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      textColor: [160, 160, 176],
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [24, 24, 35],
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 55 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
    styles: {
      cellPadding: 6,
      fontSize: 9,
    },
  })

  const finalY = (doc as any).lastAutoTable.finalY + 10

  // Totals Box
  const totalsX = pageWidth - 90
  doc.setFillColor(24, 24, 35)
  doc.roundedRect(totalsX, finalY, 70, 50, 3, 3, 'F')

  doc.setFontSize(10)
  doc.setTextColor(160, 160, 176)
  doc.text('Subtotal:', totalsX + 8, finalY + 12)
  doc.setTextColor(255, 255, 255)
  doc.text(`R$ ${quote.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, totalsX + 62, finalY + 12, { align: 'right' })

  if (quote.discount > 0) {
    doc.setTextColor(160, 160, 176)
    const discountLabel = quote.discountType === 'percent' ? `Desconto (${quote.discount}%):` : 'Desconto:'
    doc.text(discountLabel, totalsX + 8, finalY + 22)
    const discountValue = quote.discountType === 'percent'
      ? quote.subtotal * (quote.discount / 100)
      : quote.discount
    doc.setTextColor(239, 68, 68)
    doc.text(`- R$ ${discountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, totalsX + 62, finalY + 22, { align: 'right' })
  }

  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.line(totalsX + 8, finalY + 32, totalsX + 62, finalY + 32)

  doc.setFontSize(12)
  doc.setTextColor(59, 130, 246)
  doc.text('Total:', totalsX + 8, finalY + 42)
  doc.setFontSize(14)
  doc.setTextColor(59, 130, 246)
  doc.text(`R$ ${quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, totalsX + 62, finalY + 42, { align: 'right' })

  // Notes and Payment Terms
  let notesY = finalY + 70

  if (quote.paymentTerms) {
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text('Condições de Pagamento', 20, notesY)

    doc.setFontSize(10)
    doc.setTextColor(160, 160, 176)
    const paymentLines = doc.splitTextToSize(quote.paymentTerms, pageWidth - 40)
    doc.text(paymentLines, 20, notesY + 8)
    notesY += 8 + (paymentLines.length * 5) + 10
  }

  if (quote.notes) {
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text('Observações', 20, notesY)

    doc.setFontSize(10)
    doc.setTextColor(160, 160, 176)
    const notesLines = doc.splitTextToSize(quote.notes, pageWidth - 40)
    doc.text(notesLines, 20, notesY + 8)
  }

  // Footer
  doc.setFillColor(18, 18, 26)
  doc.rect(0, pageHeight - 25, pageWidth, 25, 'F')

  doc.setFontSize(8)
  doc.setTextColor(107, 107, 123)
  doc.text('TrafficPro - Plataforma de Gestão de Tráfego', 20, pageHeight - 12)
  doc.text('Este orçamento é válido pelo período indicado', 20, pageHeight - 6)

  doc.text(`Status: ${statusLabels[quote.status] || quote.status}`, pageWidth - 20, pageHeight - 12, { align: 'right' })
  doc.text(`Página 1 de 1`, pageWidth - 20, pageHeight - 6, { align: 'right' })

  // Download the PDF
  const fileName = `Orcamento_${quote.number}_${quote.client.name.replace(/\s+/g, '_')}.pdf`
  doc.save(fileName)
}

export function previewQuotePDF(quote: Quote): string {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Same content as generateQuotePDF but return as base64/blob URL
  // Header
  doc.setFillColor(18, 18, 26)
  doc.rect(0, 0, pageWidth, 55, 'F')

  doc.setFontSize(28)
  doc.setTextColor(255, 255, 255)
  doc.text('TrafficPro', 20, 25)

  doc.setFontSize(11)
  doc.setTextColor(107, 107, 123)
  doc.text('Plataforma de Gestão de Tráfego', 20, 35)

  doc.setFontSize(14)
  doc.setTextColor(250, 204, 21)
  doc.text(quote.number, pageWidth - 20, 25, { align: 'right' })

  doc.setFontSize(10)
  doc.setTextColor(107, 107, 123)
  doc.text(`Emitido em: ${new Date(quote.createdAt).toLocaleDateString('pt-BR')}`, pageWidth - 20, 35, { align: 'right' })
  doc.text(`Válido até: ${new Date(quote.validUntil).toLocaleDateString('pt-BR')}`, pageWidth - 20, 43, { align: 'right' })

  doc.setFontSize(20)
  doc.setTextColor(59, 130, 246)
  doc.text('ORÇAMENTO', 20, 72)

  doc.setFillColor(24, 24, 35)
  doc.roundedRect(20, 80, pageWidth - 40, 40, 3, 3, 'F')

  doc.setFontSize(10)
  doc.setTextColor(107, 107, 123)
  doc.text('CLIENTE', 28, 92)

  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text(quote.client.name, 28, 102)

  doc.setTextColor(160, 160, 176)
  doc.setFontSize(10)
  doc.text(quote.client.email, pageWidth - 28, 92, { align: 'right' })
  if (quote.client.phone) {
    doc.text(quote.client.phone, pageWidth - 28, 100, { align: 'right' })
  }

  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text('Serviços', 20, 135)

  const servicesData = quote.services.map(service => [
    service.name,
    service.description,
    service.quantity.toString(),
    `R$ ${service.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `R$ ${service.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  ])

  autoTable(doc, {
    startY: 140,
    head: [['Serviço', 'Descrição', 'Qtd', 'Preço Unit.', 'Total']],
    body: servicesData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      textColor: [160, 160, 176],
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [24, 24, 35],
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 55 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
    styles: {
      cellPadding: 6,
      fontSize: 9,
    },
  })

  const finalY = (doc as any).lastAutoTable.finalY + 10

  const totalsX = pageWidth - 90
  doc.setFillColor(24, 24, 35)
  doc.roundedRect(totalsX, finalY, 70, 50, 3, 3, 'F')

  doc.setFontSize(10)
  doc.setTextColor(160, 160, 176)
  doc.text('Subtotal:', totalsX + 8, finalY + 12)
  doc.setTextColor(255, 255, 255)
  doc.text(`R$ ${quote.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, totalsX + 62, finalY + 12, { align: 'right' })

  if (quote.discount > 0) {
    doc.setTextColor(160, 160, 176)
    const discountLabel = quote.discountType === 'percent' ? `Desconto (${quote.discount}%):` : 'Desconto:'
    doc.text(discountLabel, totalsX + 8, finalY + 22)
    const discountValue = quote.discountType === 'percent'
      ? quote.subtotal * (quote.discount / 100)
      : quote.discount
    doc.setTextColor(239, 68, 68)
    doc.text(`- R$ ${discountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, totalsX + 62, finalY + 22, { align: 'right' })
  }

  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.line(totalsX + 8, finalY + 32, totalsX + 62, finalY + 32)

  doc.setFontSize(12)
  doc.setTextColor(59, 130, 246)
  doc.text('Total:', totalsX + 8, finalY + 42)
  doc.setFontSize(14)
  doc.text(`R$ ${quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, totalsX + 62, finalY + 42, { align: 'right' })

  doc.setFillColor(18, 18, 26)
  doc.rect(0, pageHeight - 25, pageWidth, 25, 'F')

  doc.setFontSize(8)
  doc.setTextColor(107, 107, 123)
  doc.text('TrafficPro - Plataforma de Gestão de Tráfego', 20, pageHeight - 12)
  doc.text(`Status: ${statusLabels[quote.status] || quote.status}`, pageWidth - 20, pageHeight - 12, { align: 'right' })

  return doc.output('bloburl').toString()
}
