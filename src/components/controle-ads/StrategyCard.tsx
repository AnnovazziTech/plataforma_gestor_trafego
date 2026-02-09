'use client'

import { motion } from 'framer-motion'
import { Trash2, Target } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/financial'

interface Strategy {
  id: string
  name: string
  totalBudget: number
  client?: { id: string; name: string }
  campaigns: any[]
}

interface Props {
  strategy: Strategy
  isSelected: boolean
  onClick: () => void
  onRemove: () => void
}

export function StrategyCard({ strategy, isSelected, onClick, onRemove }: Props) {
  const totalSpent = strategy.campaigns.reduce((sum: number, c: any) => sum + (c.spentMeta || 0) + (c.spentGoogle || 0), 0)
  const remaining = strategy.totalBudget - totalSpent
  const percentUsed = strategy.totalBudget > 0 ? (totalSpent / strategy.totalBudget) * 100 : 0

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      style={{
        minWidth: '240px', padding: '16px', borderRadius: '14px', cursor: 'pointer',
        backgroundColor: isSelected ? 'rgba(59,130,246,0.1)' : '#0D0D14',
        border: `1px solid ${isSelected ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            backgroundColor: 'rgba(59,130,246,0.15)', color: '#3B82F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Target size={16} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFF' }}>{strategy.name}</div>
            {strategy.client && (
              <div style={{ fontSize: '11px', color: '#6B6B7B' }}>{strategy.client.name}</div>
            )}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer', padding: '2px' }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Budget bar */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{
          height: '6px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '3px', width: `${Math.min(percentUsed, 100)}%`,
            backgroundColor: percentUsed > 90 ? '#EF4444' : percentUsed > 70 ? '#FACC15' : '#10B981',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
        <span style={{ color: '#6B6B7B' }}>Gasto: {formatCurrency(totalSpent)}</span>
        <span style={{ color: remaining >= 0 ? '#10B981' : '#EF4444' }}>
          Restante: {formatCurrency(remaining)}
        </span>
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFF', marginTop: '4px' }}>
        Total: {formatCurrency(strategy.totalBudget)}
      </div>
    </motion.div>
  )
}
