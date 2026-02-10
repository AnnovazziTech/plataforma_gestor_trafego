'use client'

import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils/financial'

interface Campaign {
  id: string
  name: string
  currentLeadCost?: number | null
  previousLeadCost?: number | null
}

interface Props {
  campaigns: Campaign[]
}

export function LeadCostChart({ campaigns }: Props) {
  const data = campaigns.filter(c => c.currentLeadCost != null && c.currentLeadCost > 0)

  if (data.length === 0) {
    return (
      <div style={{
        padding: '24px', borderRadius: '16px',
        backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center', color: '#6B6B7B', fontSize: '13px',
      }}>
        Sem dados de custo por lead
      </div>
    )
  }

  const maxCost = Math.max(...data.map(d => d.currentLeadCost!))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: '24px', borderRadius: '16px',
        backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFF', marginBottom: '16px' }}>
        Comparacao Custo por Lead
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.map((c, i) => {
          const improved = c.previousLeadCost != null && c.currentLeadCost! <= c.previousLeadCost
          const diff = c.previousLeadCost != null
            ? ((c.currentLeadCost! - c.previousLeadCost) / c.previousLeadCost * 100).toFixed(1)
            : null

          return (
            <div key={c.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#A0A0B0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                  {c.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>
                    {formatCurrency(c.currentLeadCost!)}
                  </span>
                  {diff != null && (
                    <span style={{
                      fontSize: '11px', fontWeight: 600,
                      color: improved ? '#10B981' : '#EF4444',
                    }}>
                      {improved ? '↓' : '↑'}{Math.abs(parseFloat(diff))}%
                    </span>
                  )}
                </div>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', backgroundColor: '#0A0A0F', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.currentLeadCost! / maxCost) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  style={{
                    height: '100%', borderRadius: '4px',
                    backgroundColor: improved ? '#10B981' : c.previousLeadCost != null ? '#EF4444' : '#3B82F6',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
