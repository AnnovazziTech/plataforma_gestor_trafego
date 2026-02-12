'use client'

import { motion } from 'framer-motion'
import { Trash2, Target, Edit3 } from 'lucide-react'
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
  onEdit: () => void
}

export function StrategyCard({ strategy, isSelected, onClick, onRemove, onEdit }: Props) {
  const totalSpent = strategy.campaigns.reduce((sum: number, c: any) => sum + (c.spentMeta || 0) + (c.spentGoogle || 0), 0)
  const remaining = strategy.totalBudget - totalSpent
  const percentUsed = strategy.totalBudget > 0 ? (totalSpent / strategy.totalBudget) * 100 : 0

  const barColor = percentUsed > 90 ? '#EF4444' : percentUsed > 70 ? '#FACC15' : '#10B981'

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      style={{
        minWidth: '260px',
        borderRadius: '16px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        background: isSelected
          ? 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(37,99,235,0.06) 100%)'
          : 'linear-gradient(135deg, rgba(18,18,26,0.95) 0%, rgba(13,13,20,0.98) 100%)',
        border: `1px solid ${isSelected ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
        backdropFilter: 'blur(12px)',
        transition: 'border-color 0.3s, background 0.3s',
        boxShadow: isSelected
          ? '0 4px 24px rgba(59,130,246,0.15), inset 0 1px 0 rgba(59,130,246,0.1)'
          : '0 2px 12px rgba(0,0,0,0.2)',
      }}
    >
      {/* Subtle gradient accent at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: isSelected
          ? 'linear-gradient(90deg, #3B82F6, #8B5CF6)'
          : 'linear-gradient(90deg, rgba(59,130,246,0.3), rgba(139,92,246,0.1))',
        opacity: isSelected ? 1 : 0.5,
        transition: 'opacity 0.3s',
      }} />

      <div style={{ padding: '18px 18px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: isSelected
                ? 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.15))'
                : 'rgba(59,130,246,0.1)',
              color: '#3B82F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(59,130,246,0.15)',
              transition: 'all 0.3s',
            }}>
              <Target size={17} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFF', lineHeight: 1.3 }}>{strategy.name}</div>
              {strategy.client && (
                <div style={{ fontSize: '11px', color: '#6B6B7B', marginTop: '1px' }}>{strategy.client.name}</div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            <button
              onClick={e => { e.stopPropagation(); onEdit(); }}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px', color: '#6B6B7B', cursor: 'pointer', padding: '4px',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Editar estrategia"
            >
              <Edit3 size={13} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onRemove(); }}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px', color: '#6B6B7B', cursor: 'pointer', padding: '4px',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Remover estrategia"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Budget bar */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '10px', color: '#6B6B7B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Utilizado
            </span>
            <span style={{ fontSize: '11px', color: barColor, fontWeight: 600 }}>
              {Math.min(percentUsed, 100).toFixed(0)}%
            </span>
          </div>
          <div style={{
            height: '6px', borderRadius: '3px',
            backgroundColor: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentUsed, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                height: '100%', borderRadius: '3px',
                background: percentUsed > 90
                  ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                  : percentUsed > 70
                    ? 'linear-gradient(90deg, #FACC15, #EAB308)'
                    : 'linear-gradient(90deg, #10B981, #059669)',
              }}
            />
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
          padding: '10px', borderRadius: '10px',
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#6B6B7B', marginBottom: '2px' }}>Gasto</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#A0A0B0' }}>{formatCurrency(totalSpent)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#6B6B7B', marginBottom: '2px' }}>Restante</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: remaining >= 0 ? '#10B981' : '#EF4444' }}>
              {formatCurrency(remaining)}
            </div>
          </div>
        </div>

        <div style={{
          fontSize: '14px', fontWeight: 700, color: '#FFF', marginTop: '10px',
          textAlign: 'center', padding: '6px 0',
          background: 'rgba(59,130,246,0.05)', borderRadius: '8px',
          border: '1px solid rgba(59,130,246,0.08)',
        }}>
          {formatCurrency(strategy.totalBudget)}
        </div>
      </div>
    </motion.div>
  )
}
