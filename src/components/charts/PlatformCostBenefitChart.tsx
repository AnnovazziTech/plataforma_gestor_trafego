'use client'

import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils/financial'

interface Campaign {
  name: string
  spentMeta: number
  spentGoogle: number
  maxMeta: number
  maxGoogle: number
}

interface Props {
  campaigns: Campaign[]
}

export function PlatformCostBenefitChart({ campaigns }: Props) {
  const filtered = campaigns.filter(c => c.spentMeta > 0 || c.spentGoogle > 0)

  if (filtered.length === 0) {
    return (
      <div style={{
        padding: '24px', borderRadius: '16px',
        backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center', color: '#6B6B7B', fontSize: '13px',
      }}>
        Sem dados de custo-beneficio
      </div>
    )
  }

  const maxVal = Math.max(...filtered.flatMap(c => [c.spentMeta, c.spentGoogle, c.maxMeta, c.maxGoogle]))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: '24px', borderRadius: '16px',
        backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFF', marginBottom: '8px' }}>
        Custo-Beneficio por Plataforma
      </h3>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Meta Gasto', color: '#0081FB' },
          { label: 'Meta Maximo', color: 'rgba(0,129,251,0.3)' },
          { label: 'Google Gasto', color: '#4285F4' },
          { label: 'Google Maximo', color: 'rgba(66,133,244,0.3)' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: l.color }} />
            <span style={{ fontSize: '10px', color: '#6B6B7B' }}>{l.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '180px' }}>
        {filtered.slice(0, 5).map((c, i) => (
          <div key={c.name + i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '160px' }}>
              {/* Meta max (background) */}
              <div style={{ position: 'relative', width: '16px' }}>
                <div style={{
                  position: 'absolute', bottom: 0, width: '100%', borderRadius: '3px 3px 0 0',
                  height: maxVal > 0 ? `${(c.maxMeta / maxVal) * 160}px` : '4px',
                  backgroundColor: 'rgba(0,129,251,0.15)',
                }} />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: maxVal > 0 ? (c.spentMeta / maxVal) * 160 : 4 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  style={{
                    position: 'absolute', bottom: 0, width: '100%',
                    borderRadius: '3px 3px 0 0',
                    backgroundColor: '#0081FB',
                  }}
                />
              </div>
              {/* Google max (background) */}
              <div style={{ position: 'relative', width: '16px' }}>
                <div style={{
                  position: 'absolute', bottom: 0, width: '100%', borderRadius: '3px 3px 0 0',
                  height: maxVal > 0 ? `${(c.maxGoogle / maxVal) * 160}px` : '4px',
                  backgroundColor: 'rgba(66,133,244,0.15)',
                }} />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: maxVal > 0 ? (c.spentGoogle / maxVal) * 160 : 4 }}
                  transition={{ delay: i * 0.1 + 0.1, duration: 0.5 }}
                  style={{
                    position: 'absolute', bottom: 0, width: '100%',
                    borderRadius: '3px 3px 0 0',
                    backgroundColor: '#4285F4',
                  }}
                />
              </div>
            </div>
            <span style={{ fontSize: '10px', color: '#6B6B7B', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
