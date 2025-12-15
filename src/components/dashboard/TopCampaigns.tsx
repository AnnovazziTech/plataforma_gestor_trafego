'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent, Badge, PlatformIcon } from '@/components/ui'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown, MoreVertical } from 'lucide-react'
import { Campaign } from '@/types'

interface TopCampaignsProps {
  campaigns: Campaign[]
}

export function TopCampaigns({ campaigns }: TopCampaignsProps) {
  const topCampaigns = useMemo(() => {
    return campaigns
      .filter(c => c.status === 'active')
      .sort((a, b) => (b.metrics?.roas || 0) - (a.metrics?.roas || 0))
      .slice(0, 5)
  }, [campaigns])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
      active: 'success',
      paused: 'warning',
      ended: 'default',
      error: 'error',
    }
    const labels: Record<string, string> = {
      active: 'Ativo',
      paused: 'Pausado',
      ended: 'Finalizado',
      error: 'Erro',
    }
    return <Badge variant={variants[status] || 'default'}>{labels[status]}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campanhas em Destaque</CardTitle>
        <button style={{ fontSize: '12px', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}>
          Ver todas
        </button>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', flexShrink: 0 }}>
                    <PlatformIcon platform={campaign.platform} size={20} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {campaign.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {campaign.platform} - {campaign.objective}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {getStatusBadge(campaign.status)}
                  <button style={{ padding: '4px', borderRadius: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <MoreVertical size={14} style={{ color: '#6B6B7B' }} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div style={{ minWidth: 0, padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', marginBottom: '4px', margin: 0 }}>Investido</p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{formatCurrency(campaign.spent)}</p>
                </div>
                <div style={{ minWidth: 0, padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', marginBottom: '4px', margin: 0 }}>Conversoes</p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{formatCompactNumber(campaign.metrics.conversions)}</p>
                </div>
                <div style={{ minWidth: 0, padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', marginBottom: '4px', margin: 0 }}>CTR</p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{campaign.metrics.ctr.toFixed(2)}%</p>
                </div>
                <div style={{ minWidth: 0, padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', marginBottom: '4px', margin: 0 }}>ROAS</p>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    margin: 0,
                    color: campaign.metrics.roas >= 3 ? '#3B82F6' : campaign.metrics.roas >= 2 ? '#FACC15' : '#EF4444',
                  }}>
                    {campaign.metrics.roas >= 3 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {campaign.metrics.roas.toFixed(2)}x
                  </p>
                </div>
              </div>

              {/* Budget Progress */}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Budget utilizado</span>
                  <span style={{ fontSize: '12px', color: '#FFFFFF' }}>{((campaign.spent / campaign.budget) * 100).toFixed(0)}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    style={{
                      height: '100%',
                      borderRadius: '9999px',
                      background: 'linear-gradient(to right, #3B82F6, #FACC15)',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
