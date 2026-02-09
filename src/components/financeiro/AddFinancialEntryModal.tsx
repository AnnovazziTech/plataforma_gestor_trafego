'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, DollarSign, TrendingDown, Building2 } from 'lucide-react'
import { useApp } from '@/contexts'

interface Props {
  isOpen: boolean
  onClose: () => void
  clients: Array<{ id: string; name: string }>
}

export function AddFinancialEntryModal({ isOpen, onClose, clients }: Props) {
  const { addFinancialEntry } = useApp()
  const [type, setType] = useState<'INCOME' | 'EXPENSE' | 'ASSET'>('INCOME')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [clientId, setClientId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !date) return
    setLoading(true)
    const result = await addFinancialEntry({
      type,
      amount: parseFloat(amount),
      description,
      date,
      clientId: clientId || undefined,
    })
    setLoading(false)
    if (result) {
      setAmount('')
      setDescription('')
      setClientId('')
      onClose()
    }
  }

  const typeOptions = [
    { value: 'INCOME', label: 'Receita', icon: <DollarSign size={16} />, color: '#10B981' },
    { value: 'EXPENSE', label: 'Despesa', icon: <TrendingDown size={16} />, color: '#EF4444' },
    { value: 'ASSET', label: 'Patrimonio', icon: <Building2 size={16} />, color: '#3B82F6' },
  ]

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
              width: '100%', maxWidth: '480px', backgroundColor: '#12121A',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFF' }}>Novo Lancamento</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Type selector */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {typeOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value as any)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid',
                      borderColor: type === opt.value ? opt.color : 'rgba(255,255,255,0.1)',
                      backgroundColor: type === opt.value ? `${opt.color}15` : 'transparent',
                      color: type === opt.value ? opt.color : '#8B8B9B',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      fontSize: '13px', fontWeight: 500,
                    }}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFF', fontSize: '14px', outline: 'none',
                  }}
                  placeholder="0.00"
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Descricao</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFF', fontSize: '14px', outline: 'none',
                  }}
                  placeholder="Descricao do lancamento"
                />
              </div>

              {/* Date */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFF', fontSize: '14px', outline: 'none',
                  }}
                />
              </div>

              {/* Client */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Cliente (opcional)</label>
                <select
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFF', fontSize: '14px', outline: 'none',
                  }}
                >
                  <option value="">Sem cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                  color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Salvando...' : 'Adicionar Lancamento'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
