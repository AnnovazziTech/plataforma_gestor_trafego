'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { DollarSign, Target, TrendingUp, TrendingDown, Award, BarChart3 } from 'lucide-react'

interface CampaignData {
  name: string
  spent: number
  conversions: number
  roas: number
  ctr: number
}

interface CampaignPerformanceProps {
  data: CampaignData[]
}

export function CampaignPerformance({ data }: CampaignPerformanceProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)

  const campaignData = data.length > 0 ? data : []

  // Calculate summary stats
  const { totalSpent, totalConversions, avgRoas, bestCampaign } = useMemo(() => {
    if (campaignData.length === 0) {
      return {
        totalSpent: 0,
        totalConversions: 0,
        avgRoas: 0,
        bestCampaign: { name: '-', roas: 0, spent: 0, conversions: 0, ctr: 0 }
      }
    }
    return {
      totalSpent: campaignData.reduce((acc, c) => acc + (c.spent || 0), 0),
      totalConversions: campaignData.reduce((acc, c) => acc + (c.conversions || 0), 0),
      avgRoas: campaignData.reduce((acc, c) => acc + (c.roas || 0), 0) / campaignData.length,
      bestCampaign: [...campaignData].sort((a, b) => (b.roas || 0) - (a.roas || 0))[0]
    }
  }, [campaignData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null
    const campaign = campaignData.find(c => c.name === label)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'linear-gradient(to bottom right, #1A1A25, #12121A)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          minWidth: '200px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <BarChart3 size={14} style={{ color: '#3B82F6' }} />
          <p
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {payload.map((entry: any) => {
            const Icon = entry.dataKey === 'spent' ? DollarSign : Target
            return (
              <div
                key={entry.dataKey}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ padding: '4px', borderRadius: '4px', backgroundColor: `${entry.color}20` }}>
                    <Icon size={12} style={{ color: entry.color }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#A0A0B0' }}>
                    {entry.dataKey === 'spent' ? 'Investido' :
                     entry.dataKey === 'conversions' ? 'Conversoes' :
                     entry.dataKey === 'roas' ? 'ROAS' : entry.dataKey}
                  </span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                  {entry.dataKey === 'spent' ? formatCurrency(entry.value) :
                   entry.dataKey === 'roas' ? `${entry.value.toFixed(2)}x` :
                   formatCompactNumber(entry.value)}
                </span>
              </div>
            )
          })}
          {campaign && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '4px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
                  <TrendingUp size={12} style={{ color: '#34D399' }} />
                </div>
                <span style={{ fontSize: '12px', color: '#A0A0B0' }}>ROAS</span>
              </div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: campaign.roas >= 4 ? '#3B82F6' : campaign.roas >= 3 ? '#60A5FA' : campaign.roas >= 2 ? '#FACC15' : '#F87171',
                }}
              >
                {campaign.roas.toFixed(2)}x
              </span>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const getTextColor = (roas: number) => {
    if (roas >= 4) return '#3B82F6'
    if (roas >= 3) return '#60A5FA'
    if (roas >= 2) return '#FACC15'
    return '#FF6B6B'
  }

  return (
    <Card variant="gradient" accentColor="blue" showAccentLine>
      <CardHeader>
        <div>
          <CardTitle>Performance das Campanhas</CardTitle>
          <p style={{ fontSize: '12px', color: '#6B6B7B', marginTop: '4px', margin: 0 }}>Comparativo de investimento e resultados</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#3B82F6' }} />
            <span style={{ fontSize: '12px', color: '#3B82F6', fontWeight: 500 }}>Investido</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(250, 204, 21, 0.1)',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#FACC15' }} />
            <span style={{ fontSize: '12px', color: '#FACC15', fontWeight: 500 }}>Conversoes</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <DollarSign size={12} style={{ color: '#3B82F6' }} />
              <span style={{ fontSize: '12px', color: '#6B6B7B', whiteSpace: 'nowrap' }}>Total Investido</span>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{formatCurrency(totalSpent)}</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Target size={12} style={{ color: '#FACC15' }} />
              <span style={{ fontSize: '12px', color: '#6B6B7B', whiteSpace: 'nowrap' }}>Conversoes</span>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{formatCompactNumber(totalConversions)}</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <TrendingUp size={12} style={{ color: '#34D399' }} />
              <span style={{ fontSize: '12px', color: '#6B6B7B', whiteSpace: 'nowrap' }}>ROAS Medio</span>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#3B82F6', margin: 0 }}>{avgRoas.toFixed(2)}x</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Award size={12} style={{ color: '#FACC15' }} />
              <span style={{ fontSize: '12px', color: '#6B6B7B', whiteSpace: 'nowrap' }}>Melhor</span>
            </div>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={bestCampaign.name}
            >
              {bestCampaign.name.split(' ')[0]}
            </p>
          </div>
        </div>

        <div style={{ height: '256px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={campaignData}
              layout="vertical"
              margin={{ left: 0, right: 20, top: 5, bottom: 5 }}
              onMouseMove={(state) => {
                if (state?.activeLabel) {
                  setHoveredBar(state.activeLabel)
                }
              }}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <defs>
                <linearGradient id="spentGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#60A5FA" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="conversionsGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FACC15" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#FDE047" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B6B7B', fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#A0A0B0', fontSize: 10 }}
                width={90}
                tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + '...' : value}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
              <Bar
                dataKey="spent"
                fill="url(#spentGradient)"
                radius={[0, 4, 4, 0]}
                barSize={14}
              />
              <Bar
                dataKey="conversions"
                fill="url(#conversionsGradient)"
                radius={[0, 4, 4, 0]}
                barSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ROAS Indicators */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', color: '#A0A0B0', fontWeight: 500, margin: 0 }}>ROAS por Campanha</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6B6B7B' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#3B82F6' }} />
                &gt;4x
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#FACC15' }} />
                2-4x
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#F87171' }} />
                &lt;2x
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(campaignData.length, 5)}, 1fr)`, gap: '8px' }}>
            {campaignData.slice(0, 5).map((campaign, index) => {
              const isHovered = hoveredBar === campaign.name
              return (
                <motion.div
                  key={campaign.name}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    position: 'relative',
                    padding: '12px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={() => setHoveredBar(campaign.name)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {campaign.roas === bestCampaign?.roas && (
                    <div style={{ position: 'absolute', top: '-4px', right: '-4px' }}>
                      <Award size={14} style={{ color: '#FACC15' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                    {(campaign.roas || 0) >= avgRoas ? (
                      <TrendingUp size={12} style={{ color: '#34D399' }} />
                    ) : (
                      <TrendingDown size={12} style={{ color: '#F87171' }} />
                    )}
                    <p style={{ fontSize: '18px', fontWeight: 700, color: getTextColor(campaign.roas || 0), margin: 0 }}>
                      {(campaign.roas || 0).toFixed(1)}x
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#6B6B7B',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={campaign.name}
                  >
                    {campaign.name?.split(' ')[0] || '-'}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
