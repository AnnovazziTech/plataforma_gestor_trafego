'use client'

import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils/financial'

interface ClientRevenue {
  name: string
  monthlyValue: number
  color: string
}

interface Props {
  clients: Array<{
    name: string
    monthlyValue?: number
  }>
}

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']

export function ClientsRevenueChart({ clients }: Props) {
  const data: ClientRevenue[] = clients
    .filter(c => c.monthlyValue && c.monthlyValue > 0)
    .sort((a, b) => (b.monthlyValue || 0) - (a.monthlyValue || 0))
    .slice(0, 6)
    .map((c, i) => ({
      name: c.name,
      monthlyValue: c.monthlyValue || 0,
      color: COLORS[i % COLORS.length],
    }))

  if (data.length === 0) {
    return (
      <div style={{
        padding: '24px', borderRadius: '16px',
        backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center', color: '#6B6B7B',
      }}>
        Nenhum cliente com valor mensal cadastrado
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.monthlyValue))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: '24px', borderRadius: '16px',
        backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFF', marginBottom: '20px' }}>
        Receita Mensal por Cliente
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.map((item, i) => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '120px', fontSize: '13px', color: '#A0A0B0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              {item.name}
            </div>
            <div style={{ flex: 1, height: '28px', backgroundColor: '#0A0A0F', borderRadius: '6px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.monthlyValue / maxValue) * 100}%` }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                style={{
                  height: '100%', borderRadius: '6px',
                  background: `linear-gradient(90deg, ${item.color}, ${item.color}CC)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  paddingRight: '8px', minWidth: '80px',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#FFF' }}>
                  {formatCurrency(item.monthlyValue)}
                </span>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
