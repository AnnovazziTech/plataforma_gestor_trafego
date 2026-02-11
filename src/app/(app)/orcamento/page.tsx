'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout'
import { useApp } from '@/contexts'
import { formatCurrency, formatDate } from '@/lib/utils/financial'
import {
  Loader2, Plus, Edit3, Trash2, FileDown, Receipt, Send, CheckCircle2,
  XCircle, Clock, X, Eye,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ServiceItem {
  description: string
  type: 'servico' | 'campanha'
  value: number
}

interface Quote {
  id: string
  clientName: string
  clientEmail?: string
  services: ServiceItem[]
  totalValue: number
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  validUntil?: string
  notes?: string
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  DRAFT: { label: 'Rascunho', color: '#6B6B7B', bg: 'rgba(107,107,123,0.15)', icon: <Clock size={14} /> },
  SENT: { label: 'Enviado', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', icon: <Send size={14} /> },
  ACCEPTED: { label: 'Aceito', color: '#10B981', bg: 'rgba(16,185,129,0.15)', icon: <CheckCircle2 size={14} /> },
  REJECTED: { label: 'Recusado', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: <XCircle size={14} /> },
  EXPIRED: { label: 'Expirado', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: <Clock size={14} /> },
}

const emptyItem: ServiceItem = { description: '', type: 'servico', value: 0 }

export default function OrcamentoPage() {
  const { showToast } = useApp()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [viewQuote, setViewQuote] = useState<Quote | null>(null)

  // Form state
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [items, setItems] = useState<ServiceItem[]>([{ ...emptyItem }])
  const [discount, setDiscount] = useState(0)
  const [validUntil, setValidUntil] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/quotes${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`)
      if (res.ok) {
        const data = await res.json()
        setQuotes(Array.isArray(data) ? data : [])
      }
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  const subtotal = items.reduce((s, item) => s + item.value, 0)
  const total = subtotal - discount

  const resetForm = () => {
    setClientName('')
    setClientEmail('')
    setItems([{ ...emptyItem }])
    setDiscount(0)
    setValidUntil('')
    setNotes('')
    setEditingQuote(null)
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (quote: Quote) => {
    setEditingQuote(quote)
    setClientName(quote.clientName)
    setClientEmail(quote.clientEmail || '')
    setItems(Array.isArray(quote.services) ? quote.services : [{ ...emptyItem }])
    setDiscount(subtotalOf(quote.services) - quote.totalValue)
    setValidUntil(quote.validUntil ? quote.validUntil.split('T')[0] : '')
    setNotes(quote.notes || '')
    setShowModal(true)
  }

  const subtotalOf = (services: ServiceItem[]) => {
    if (!Array.isArray(services)) return 0
    return services.reduce((s, item) => s + (item.value || 0), 0)
  }

  const addItem = () => setItems(prev => [...prev, { ...emptyItem }])
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index))
  const updateItem = (index: number, field: keyof ServiceItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName || items.length === 0) {
      showToast('Preencha o nome do cliente e adicione pelo menos um item', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        clientName,
        clientEmail: clientEmail || null,
        services: items.filter(i => i.description),
        totalValue: total > 0 ? total : 0,
        validUntil: validUntil || null,
        notes: notes || null,
      }

      if (editingQuote) {
        const res = await fetch(`/api/quotes/${editingQuote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          showToast('Orçamento atualizado!', 'success')
          setShowModal(false)
          resetForm()
          fetchQuotes()
        } else {
          showToast('Erro ao atualizar', 'error')
        }
      } else {
        const res = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          showToast('Orçamento criado!', 'success')
          setShowModal(false)
          resetForm()
          fetchQuotes()
        } else {
          showToast('Erro ao criar', 'error')
        }
      }
    } catch {
      showToast('Erro ao salvar orçamento', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setQuotes(prev => prev.filter(q => q.id !== id))
        showToast('Orçamento removido!', 'success')
      }
    } catch {
      showToast('Erro ao remover', 'error')
    }
  }

  const handleStatusChange = async (quote: Quote, newStatus: string) => {
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...quote, status: newStatus }),
      })
      if (res.ok) {
        fetchQuotes()
        showToast('Status atualizado!', 'success')
      }
    } catch {
      showToast('Erro ao atualizar status', 'error')
    }
  }

  const handleExportPDF = (quote: Quote) => {
    const services = Array.isArray(quote.services) ? quote.services : []
    const sub = services.reduce((s: number, item: ServiceItem) => s + (item.value || 0), 0)
    const disc = sub - quote.totalValue

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Orçamento - ${quote.clientName}</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 40px; color: #333; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #3B82F6; }
  .title { font-size: 28px; font-weight: 700; color: #1a1a2e; }
  .subtitle { font-size: 14px; color: #666; margin-top: 4px; }
  .client-info { text-align: right; }
  .client-name { font-size: 18px; font-weight: 600; }
  .client-email { font-size: 13px; color: #666; }
  table { width: 100%; border-collapse: collapse; margin: 30px 0; }
  th { background: #f0f4ff; padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 600; color: #3B82F6; border-bottom: 2px solid #e0e0e0; }
  td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  .type-badge { padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .type-servico { background: #dbeafe; color: #2563EB; }
  .type-campanha { background: #fef3c7; color: #D97706; }
  .totals { margin-top: 20px; text-align: right; }
  .totals div { margin: 8px 0; font-size: 15px; }
  .total-final { font-size: 22px; font-weight: 700; color: #3B82F6; border-top: 2px solid #3B82F6; padding-top: 12px; }
  .notes { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
  .notes-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
  .notes-text { font-size: 13px; color: #555; white-space: pre-wrap; }
  .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
  @media print { body { padding: 20px; } }
</style></head><body>
  <div class="header">
    <div>
      <div class="title">Orçamento</div>
      <div class="subtitle">Data: ${formatDate(quote.createdAt)}${quote.validUntil ? ` | Válido até: ${formatDate(quote.validUntil)}` : ''}</div>
    </div>
    <div class="client-info">
      <div class="client-name">${quote.clientName}</div>
      ${quote.clientEmail ? `<div class="client-email">${quote.clientEmail}</div>` : ''}
    </div>
  </div>
  <table>
    <thead><tr><th>Item</th><th>Tipo</th><th style="text-align:right">Valor</th></tr></thead>
    <tbody>
      ${services.map((s: ServiceItem) => `
        <tr>
          <td>${s.description}</td>
          <td><span class="type-badge type-${s.type}">${s.type === 'servico' ? 'Serviço' : 'Campanha'}</span></td>
          <td style="text-align:right;font-weight:500">${formatCurrency(s.value)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="totals">
    <div>Subtotal: <strong>${formatCurrency(sub)}</strong></div>
    ${disc > 0 ? `<div style="color:#10B981">Desconto: <strong>-${formatCurrency(disc)}</strong></div>` : ''}
    <div class="total-final">Total: ${formatCurrency(quote.totalValue)}</div>
  </div>
  ${quote.notes ? `<div class="notes"><div class="notes-title">Observações</div><div class="notes-text">${quote.notes}</div></div>` : ''}
  <div class="footer">Documento gerado automaticamente | TrafficPro</div>
</body></html>`

    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close(); w.print() }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header title="Orçamento" subtitle="Propostas e orçamentos" variant="simple" />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={48} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header title="Orçamento" subtitle="Propostas e orçamentos" variant="simple" />

      <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '6px 14px', borderRadius: '10px', border: 'none',
                  fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                  backgroundColor: filterStatus === status ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: filterStatus === status ? '#3B82F6' : '#6B6B7B',
                }}
              >
                {status === 'all' ? 'Todos' : statusConfig[status]?.label || status}
              </button>
            ))}
          </div>
          <button
            onClick={openAddModal}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
              borderRadius: '10px', border: 'none',
              background: 'linear-gradient(to right, #3B82F6, #2563EB)',
              color: '#FFF', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Novo Orçamento
          </button>
        </div>

        {/* Quotes list */}
        {quotes.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px', color: '#6B6B7B',
            backgroundColor: '#12121A', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Receipt size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: '16px', fontWeight: 500 }}>Nenhum orçamento</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>Crie seu primeiro orçamento clicando em "Novo Orçamento".</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {quotes.map((quote, i) => {
              const sc = statusConfig[quote.status] || statusConfig.DRAFT
              const services = Array.isArray(quote.services) ? quote.services : []
              return (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    padding: '20px', borderRadius: '16px',
                    backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 600, color: '#FFF' }}>{quote.clientName}</span>
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '2px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                          backgroundColor: sc.bg, color: sc.color,
                        }}>
                          {sc.icon} {sc.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B6B7B', marginBottom: '4px' }}>
                        {services.length} ite{services.length !== 1 ? 'ns' : 'm'} | Criado em {formatDate(quote.createdAt)}
                        {quote.validUntil && ` | Válido até ${formatDate(quote.validUntil)}`}
                      </div>
                      {quote.clientEmail && (
                        <div style={{ fontSize: '12px', color: '#6B6B7B' }}>{quote.clientEmail}</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#3B82F6' }}>
                        {formatCurrency(quote.totalValue)}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '8px', justifyContent: 'flex-end' }}>
                        <IconBtn title="Visualizar" onClick={() => setViewQuote(quote)}><Eye size={14} /></IconBtn>
                        <IconBtn title="Exportar PDF" onClick={() => handleExportPDF(quote)}><FileDown size={14} /></IconBtn>
                        <IconBtn title="Editar" onClick={() => openEditModal(quote)}><Edit3 size={14} /></IconBtn>
                        <IconBtn title="Remover" onClick={() => handleDelete(quote.id)}><Trash2 size={14} /></IconBtn>
                      </div>
                    </div>
                  </div>

                  {/* Quick status buttons */}
                  {quote.status === 'DRAFT' && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '8px' }}>
                      <SmallBtn label="Marcar como Enviado" color="#3B82F6" onClick={() => handleStatusChange(quote, 'SENT')} />
                    </div>
                  )}
                  {quote.status === 'SENT' && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '8px' }}>
                      <SmallBtn label="Aceito" color="#10B981" onClick={() => handleStatusChange(quote, 'ACCEPTED')} />
                      <SmallBtn label="Recusado" color="#EF4444" onClick={() => handleStatusChange(quote, 'REJECTED')} />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      {/* View Quote Modal */}
      <AnimatePresence>
        {viewQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewQuote(null)}
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
                width: '100%', maxWidth: '560px', backgroundColor: '#12121A',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', padding: '24px',
                maxHeight: '90vh', overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFF' }}>Orçamento</h2>
                <button onClick={() => setViewQuote(null)} style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#FFF' }}>{viewQuote.clientName}</div>
                {viewQuote.clientEmail && <div style={{ fontSize: '13px', color: '#6B6B7B' }}>{viewQuote.clientEmail}</div>}
              </div>

              {/* Items table */}
              <div style={{ marginBottom: '16px' }}>
                {(Array.isArray(viewQuote.services) ? viewQuote.services : []).map((item: ServiceItem, i: number) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#FFF' }}>{item.description}</div>
                      <span style={{
                        fontSize: '10px', fontWeight: 600, padding: '1px 8px', borderRadius: '4px',
                        backgroundColor: item.type === 'servico' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
                        color: item.type === 'servico' ? '#3B82F6' : '#F59E0B',
                      }}>
                        {item.type === 'servico' ? 'Serviço' : 'Campanha'}
                      </span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFF' }}>{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#3B82F6' }}>
                  Total: {formatCurrency(viewQuote.totalValue)}
                </div>
              </div>

              {viewQuote.notes && (
                <div style={{
                  marginTop: '16px', padding: '12px', borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#A0A0B0', marginBottom: '4px' }}>Observações</div>
                  <div style={{ fontSize: '13px', color: '#FFF', whiteSpace: 'pre-wrap' }}>{viewQuote.notes}</div>
                </div>
              )}

              <button
                onClick={() => { handleExportPDF(viewQuote); setViewQuote(null) }}
                style={{
                  width: '100%', marginTop: '16px', padding: '12px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                  color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <FileDown size={16} /> Exportar PDF
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Quote Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowModal(false); resetForm() }}
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
                width: '100%', maxWidth: '560px', backgroundColor: '#12121A',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', padding: '24px',
                maxHeight: '90vh', overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFF' }}>
                  {editingQuote ? 'Editar Orçamento' : 'Novo Orçamento'}
                </h2>
                <button onClick={() => { setShowModal(false); resetForm() }} style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Client info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={labelStyle}>Nome do Cliente *</label>
                    <input value={clientName} onChange={e => setClientName(e.target.value)} required style={inputStyle} placeholder="Nome" />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} style={inputStyle} placeholder="email@exemplo.com" />
                  </div>
                </div>

                {/* Line items */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ ...labelStyle, marginBottom: '10px' }}>Itens</label>
                  {items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <input
                        value={item.description}
                        onChange={e => updateItem(i, 'description', e.target.value)}
                        placeholder="Descrição do item"
                        style={{ ...inputStyle, flex: 2 }}
                      />
                      <select
                        value={item.type}
                        onChange={e => updateItem(i, 'type', e.target.value)}
                        style={{ ...inputStyle, flex: 0, width: '120px' }}
                      >
                        <option value="servico">Serviço</option>
                        <option value="campanha">Campanha</option>
                      </select>
                      <input
                        type="number"
                        value={item.value || ''}
                        onChange={e => updateItem(i, 'value', parseFloat(e.target.value) || 0)}
                        placeholder="Valor"
                        step="0.01"
                        style={{ ...inputStyle, flex: 0, width: '120px', textAlign: 'right' }}
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItem}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '6px 12px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.15)',
                      backgroundColor: 'transparent', color: '#6B6B7B', fontSize: '12px', cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} /> Adicionar item
                  </button>
                </div>

                {/* Discount + valid until */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={labelStyle}>Desconto (R$)</label>
                    <input
                      type="number"
                      value={discount || ''}
                      onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                      step="0.01"
                      style={inputStyle}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Válido até</label>
                    <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Observações</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="Condições, formas de pagamento, etc."
                  />
                </div>

                {/* Totals */}
                <div style={{
                  padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#A0A0B0' }}>Subtotal</span>
                    <span style={{ fontSize: '14px', color: '#FFF', fontWeight: 500 }}>{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#10B981' }}>Desconto</span>
                      <span style={{ fontSize: '14px', color: '#10B981', fontWeight: 500 }}>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '15px', color: '#FFF', fontWeight: 600 }}>Total</span>
                    <span style={{ fontSize: '18px', color: '#3B82F6', fontWeight: 700 }}>{formatCurrency(total > 0 ? total : 0)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                    color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Salvando...' : editingQuote ? 'Salvar Alterações' : 'Criar Orçamento'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '10px',
  backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)',
  color: '#FFF', fontSize: '14px', outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block',
}

function IconBtn({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: '30px', height: '30px', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.06)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        color: '#6B6B7B', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </button>
  )
}

function SmallBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: '8px', border: 'none',
        fontSize: '12px', fontWeight: 500, cursor: 'pointer',
        backgroundColor: `${color}20`, color,
      }}
    >
      {label}
    </button>
  )
}
