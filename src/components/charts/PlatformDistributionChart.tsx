'use client'

import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils/financial'

interface Campaign {
  spentMeta: number
  spentGoogle: number
}

interface Props {
  campaigns: Campaign[]
}

export function PlatformDistributionChart({ campaigns }: Props) {
  const totalMeta = campaigns.reduce((s, c) => s + c.spentMeta, 0)
  const totalGoogle = campaigns.reduce((s, c) => s + c.spentGoogle, 0)
  const total = totalMeta + totalGoogle

  if (total === 0) {
    return (
      <div style={{
        padding: '24px', borderRadius: '16px',
        backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center', color: '#6B6B7B', fontSize: '13px',
      }}>
        Sem dados de gastos por plataforma
      </div>
    )
  }

  const metaPct = (totalMeta / total) * 100
  const googlePct = (totalGoogle / total) * 100

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
        Distribuicao de Gasto por Plataforma
      </h3>

      {/* Stacked bar */}
      <div style={{ height: '32px', borderRadius: '8px', overflow: 'hidden', display: 'flex', marginBottom: '16px' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${metaPct}%` }}
          transition={{ duration: 0.6 }}
          style={{
            height: '100%', backgroundColor: '#0081FB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {metaPct > 15 && <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFF' }}>{metaPct.toFixed(0)}%</span>}
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${googlePct}%` }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            height: '100%', backgroundColor: '#4285F4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {googlePct > 15 && <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFF' }}>{googlePct.toFixed(0)}%</span>}
        </motion.div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#0081FB' }} />
          <div>
            <div style={{ fontSize: '12px', color: '#A0A0B0' }}>Meta Ads</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFF' }}>{formatCurrency(totalMeta)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#4285F4' }} />
          <div>
            <div style={{ fontSize: '12px', color: '#A0A0B0' }}>Google Ads</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFF' }}>{formatCurrency(totalGoogle)}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
