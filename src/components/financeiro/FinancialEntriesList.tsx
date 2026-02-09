'use client'

import { motion } from 'framer-motion'
import { Trash2, DollarSign, TrendingDown, Building2 } from 'lucide-react'
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
  entries: Entry[]
  onRemove: (id: string) => void
}

const typeConfig = {
  INCOME: { label: 'Receita', icon: <DollarSign size={16} />, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  EXPENSE: { label: 'Despesa', icon: <TrendingDown size={16} />, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  ASSET: { label: 'Patrimonio', icon: <Building2 size={16} />, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
}

export function FinancialEntriesList({ entries, onRemove }: Props) {
  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6B6B7B' }}>
        Nenhum lancamento encontrado
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {entries.map((entry, i) => {
        const config = typeConfig[entry.type]
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px',
              backgroundColor: '#0D0D14', border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              backgroundColor: config.bg, color: config.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {config.icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#FFF' }}>
                {entry.description || config.label}
              </div>
              <div style={{ fontSize: '12px', color: '#6B6B7B', display: 'flex', gap: '8px' }}>
                <span>{formatDate(entry.date)}</span>
                {entry.client && <span>• {entry.client.name}</span>}
              </div>
            </div>

            <div style={{
              fontSize: '14px', fontWeight: 600,
              color: entry.type === 'EXPENSE' ? '#EF4444' : entry.type === 'INCOME' ? '#10B981' : '#3B82F6',
            }}>
              {entry.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(entry.amount)}
            </div>

            <button
              onClick={() => onRemove(entry.id)}
              style={{
                padding: '6px', borderRadius: '8px', border: 'none',
                backgroundColor: 'transparent', color: '#6B6B7B', cursor: 'pointer',
              }}
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}
