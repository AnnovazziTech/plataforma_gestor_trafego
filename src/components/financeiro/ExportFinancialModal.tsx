'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileDown } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/financial'

interface Entry {
  id: string
  type: 'INCOME' | 'EXPENSE' | 'ASSET'
  amount: number
  description?: string
  date: string
  client?: { id: string; name: string }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  entries: Entry[]
}

export function ExportFinancialModal({ isOpen, onClose, entries }: Props) {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
  const [includeIncome, setIncludeIncome] = useState(true)
  const [includeExpenses, setIncludeExpenses] = useState(true)
  const [includeDescriptions, setIncludeDescriptions] = useState(true)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)

    const filtered = entries.filter(e => {
      const d = new Date(e.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59)
      if (d < start || d > end) return false
      if (!includeIncome && e.type === 'INCOME') return false
      if (!includeExpenses && e.type === 'EXPENSE') return false
      return true
    })

    const totalIncome = filtered.filter(e => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0)
    const totalExpenses = filtered.filter(e => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0)
    const totalAssets = filtered.filter(e => e.type === 'ASSET').reduce((s, e) => s + e.amount, 0)
    const balance = totalIncome - totalExpenses

    const typeLabels: Record<string, string> = { INCOME: 'Receita', EXPENSE: 'Despesa', ASSET: 'Patrimonio' }
    const typeColors: Record<string, string> = { INCOME: '#10B981', EXPENSE: '#EF4444', ASSET: '#3B82F6' }

    const rows = filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(e => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${formatDate(e.date)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;color:${typeColors[e.type]};font-weight:600">${typeLabels[e.type]}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:right">${formatCurrency(e.amount)}</td>
        ${includeDescriptions ? `<td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${e.description || '-'}</td>` : ''}
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${e.client?.name || '-'}</td>
      </tr>
    `).join('')

    const html = `
      <html><head><title>Relatorio Financeiro</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#333}
      h1{text-align:center;font-size:24px;margin-bottom:4px}
      .sub{text-align:center;color:#666;font-size:13px;margin-bottom:30px}
      .summary{display:flex;justify-content:center;gap:20px;margin-bottom:30px}
      .summary-box{padding:12px 24px;border-radius:8px;text-align:center;color:#fff;font-weight:700;font-size:15px}
      .summary-label{font-size:11px;font-weight:400;opacity:0.9;display:block;margin-bottom:4px}
      table{width:100%;border-collapse:collapse}
      th{padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;background:#f5f5f5;border-bottom:2px solid #ddd}
      th.right{text-align:right}
      </style></head><body>
      <h1>Relatorio Financeiro</h1>
      <div class="sub">Periodo: ${formatDate(startDate)} a ${formatDate(endDate)}<br>Gerado em: ${formatDate(new Date().toISOString())} as ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
      <div class="summary">
        <div class="summary-box" style="background:#10B981"><span class="summary-label">Total Receitas</span>${formatCurrency(totalIncome)}</div>
        <div class="summary-box" style="background:#EF4444"><span class="summary-label">Total Despesas</span>${formatCurrency(totalExpenses)}</div>
        <div class="summary-box" style="background:${balance >= 0 ? '#3B82F6' : '#EF4444'}"><span class="summary-label">Saldo</span>${formatCurrency(balance)}</div>
      </div>
      <table>
        <thead><tr>
          <th>Data</th><th>Tipo</th><th class="right">Valor</th>
          ${includeDescriptions ? '<th>Descricao</th>' : ''}
          <th>Cliente</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${filtered.length === 0 ? '<p style="text-align:center;color:#999;padding:40px">Nenhum lancamento no periodo selecionado.</p>' : ''}
      </body></html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }

    setExporting(false)
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)',
    color: '#FFF', fontSize: '14px', outline: 'none',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '420px', backgroundColor: '#12121A',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileDown size={20} /> Exportar Relatorio Financeiro
                </h2>
                <p style={{ fontSize: '12px', color: '#6B6B7B', marginTop: '4px' }}>Configure os filtros para gerar o relatorio em PDF.</p>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Period */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block', fontWeight: 600 }}>Periodo</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#6B6B7B', display: 'block', marginBottom: '4px' }}>Data Inicial</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#6B6B7B', display: 'block', marginBottom: '4px' }}>Data Final</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '10px', display: 'block', fontWeight: 600 }}>Incluir no relatorio</label>
              {[
                { label: 'Receitas', checked: includeIncome, onChange: setIncludeIncome },
                { label: 'Despesas', checked: includeExpenses, onChange: setIncludeExpenses },
                { label: 'Descricoes detalhadas', checked: includeDescriptions, onChange: setIncludeDescriptions },
              ].map(item => (
                <label key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer', color: '#CACADB', fontSize: '14px' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: item.checked ? '#EF4444' : 'transparent',
                    border: item.checked ? 'none' : '2px solid rgba(255,255,255,0.2)',
                  }}>
                    {item.checked && <span style={{ color: '#FFF', fontSize: '12px', fontWeight: 700 }}>✓</span>}
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={e => item.onChange(e.target.checked)}
                    style={{ display: 'none' }}
                  />
                  {item.label}
                </label>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'transparent', color: '#FFF', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                  backgroundColor: '#EF4444', color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  opacity: exporting ? 0.7 : 1,
                }}
              >
                <FileDown size={16} /> Exportar PDF
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
