'use client'

import { motion } from 'framer-motion'
import { Trash2, Edit3 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/financial'
import { calcularPrevisao30D, calcularFinalizaraEm } from '@/lib/utils/financial'

interface BudgetCampaign {
  id: string
  name: string
  maxMeta: number
  maxGoogle: number
  dailyBudget: number
  startDate: string
  spentMeta: number
  spentGoogle: number
  previousLeadCost?: number
  currentLeadCost?: number
  strategy?: { id: string; name: string; totalBudget: number }
}

interface Props {
  campaigns: BudgetCampaign[]
  onUpdate: (id: string, data: any) => void
  onRemove: (id: string) => void
}

export function BudgetCampaignsTable({ campaigns, onUpdate, onRemove }: Props) {
  if (campaigns.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6B6B7B' }}>
        Nenhuma campanha de orcamento encontrada
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Campanha', 'Meta (Max)', 'Google (Max)', 'Diario', 'Gasto Meta', 'Gasto Google', 'Previsao 30D', 'Custo/Lead', 'Acoes'].map(h => (
              <th key={h} style={{
                padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: '#6B6B7B',
                textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c, i) => {
            const totalSpent = c.spentMeta + c.spentGoogle
            const totalMax = c.maxMeta + c.maxGoogle
            const daysLeft = calcularFinalizaraEm(totalMax, totalSpent, c.dailyBudget)

            return (
              <motion.tr
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <td style={{ padding: '12px', fontSize: '13px', fontWeight: 500, color: '#FFF' }}>
                  {c.name}
                  <div style={{ fontSize: '11px', color: '#6B6B7B' }}>Inicio: {formatDate(c.startDate)}</div>
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#A0A0B0' }}>{formatCurrency(c.maxMeta)}</td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#A0A0B0' }}>{formatCurrency(c.maxGoogle)}</td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#3B82F6', fontWeight: 500 }}>{formatCurrency(c.dailyBudget)}</td>
                <td style={{ padding: '12px', fontSize: '13px', color: c.spentMeta > c.maxMeta ? '#EF4444' : '#10B981' }}>
                  {formatCurrency(c.spentMeta)}
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: c.spentGoogle > c.maxGoogle ? '#EF4444' : '#10B981' }}>
                  {formatCurrency(c.spentGoogle)}
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#A0A0B0' }}>
                  {formatCurrency(calcularPrevisao30D(c.dailyBudget))}
                  <div style={{ fontSize: '11px', color: '#6B6B7B' }}>
                    {daysLeft === Infinity ? '-' : `~${daysLeft} dias restantes`}
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  {c.currentLeadCost != null ? (
                    <div style={{ fontSize: '13px', color: '#FFF', fontWeight: 500 }}>
                      {formatCurrency(c.currentLeadCost)}
                      {c.previousLeadCost != null && (
                        <span style={{
                          fontSize: '11px', marginLeft: '4px',
                          color: c.currentLeadCost <= c.previousLeadCost ? '#10B981' : '#EF4444',
                        }}>
                          {c.currentLeadCost <= c.previousLeadCost ? '↓' : '↑'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#6B6B7B' }}>-</span>
                  )}
                </td>
                <td style={{ padding: '12px', display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => onRemove(c.id)}
                    style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
