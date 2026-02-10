'use client'

import { motion } from 'framer-motion'

interface ChartDataPoint {
  month: string
  income: number
  expenses: number
  assets: number
  balance: number
}

interface Props {
  data: ChartDataPoint[]
}

export function FinanceChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6B6B7B' }}>
        Sem dados para exibir
      </div>
    )
  }

  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expenses, d.assets]))
  const scale = maxValue > 0 ? 200 / maxValue : 1

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
        Evolução Financeira
      </h3>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: 'Receita', color: '#10B981' },
          { label: 'Despesas', color: '#EF4444' },
          { label: 'Patrimônio', color: '#3B82F6' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color }} />
            <span style={{ fontSize: '12px', color: '#A0A0B0' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '220px' }}>
        {data.map((point, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '200px' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: Math.max(point.income * scale, 4) }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{
                  width: '14px', borderRadius: '4px 4px 0 0',
                  backgroundColor: '#10B981',
                }}
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: Math.max(point.expenses * scale, 4) }}
                transition={{ delay: i * 0.1 + 0.1, duration: 0.5 }}
                style={{
                  width: '14px', borderRadius: '4px 4px 0 0',
                  backgroundColor: '#EF4444',
                }}
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: Math.max(point.assets * scale, 4) }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                style={{
                  width: '14px', borderRadius: '4px 4px 0 0',
                  backgroundColor: '#3B82F6',
                }}
              />
            </div>
            <span style={{ fontSize: '11px', color: '#6B6B7B' }}>{point.month}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
