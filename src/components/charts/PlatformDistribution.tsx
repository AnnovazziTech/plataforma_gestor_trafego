'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent, PlatformIcon } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { Platform } from '@/types'
import { TrendingUp, Target, DollarSign } from 'lucide-react'

interface PlatformMetric {
  platform: string
  spent: number
  impressions: number
  clicks: number
  conversions: number
  roas: number
  campaigns: number
  [key: string]: string | number
}

interface PlatformDistributionProps {
  data: PlatformMetric[]
}

const platformColors: Record<string, string> = {
  meta: '#0081FB',
  META: '#0081FB',
  google: '#4285F4',
  GOOGLE: '#4285F4',
  tiktok: '#00F2EA',
  TIKTOK: '#00F2EA',
  linkedin: '#0A66C2',
  LINKEDIN: '#0A66C2',
  twitter: '#1DA1F2',
  TWITTER: '#1DA1F2',
  pinterest: '#E60023',
  PINTEREST: '#E60023',
}

export function PlatformDistribution({ data }: PlatformDistributionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const { totalSpent, totalCampaigns, avgRoas } = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalSpent: 0, totalCampaigns: 0, avgRoas: 0 }
    }
    return {
      totalSpent: data.reduce((acc, p) => acc + (p.spent || 0), 0),
      totalCampaigns: data.reduce((acc, p) => acc + (p.campaigns || 0), 0),
      avgRoas: data.length > 0 ? data.reduce((acc, p) => acc + (p.roas || 0), 0) / data.length : 0
    }
  }, [data])

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null
    const data = payload[0].payload
    const percentage = (data.spent / totalSpent) * 100
    const platformColor = platformColors[data.platform as Platform] || '#3B82F6'

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
          minWidth: '180px',
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
          <PlatformIcon platform={data.platform} size={20} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', textTransform: 'capitalize' }}>{data.platform}</span>
          <span
            style={{
              marginLeft: 'auto',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: `${platformColor}20`,
              color: platformColor,
            }}
          >
            {percentage.toFixed(1)}%
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#A0A0B0' }}>
              <DollarSign size={12} />
              Investido
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>{formatCurrency(data.spent)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#A0A0B0' }}>
              <Target size={12} />
              Campanhas
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>{data.campaigns}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#A0A0B0' }}>
              <TrendingUp size={12} />
              ROAS
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: data.roas >= 3 ? '#3B82F6' : data.roas >= 2 ? '#FACC15' : '#F87171',
              }}
            >
              {data.roas.toFixed(2)}x
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <Card variant="gradient" accentColor="blue" showAccentLine>
      <CardHeader>
        <div>
          <CardTitle>Distribuicao por Plataforma</CardTitle>
          <p style={{ fontSize: '12px', color: '#6B6B7B', marginTop: '4px', margin: 0 }}>Investimento por canal de aquisicao</p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{formatCurrency(totalSpent)}</p>
            <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Total Investido</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{totalCampaigns}</p>
            <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Campanhas</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#3B82F6', margin: 0 }}>{avgRoas.toFixed(2)}x</p>
            <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>ROAS Medio</p>
          </div>
        </div>

        {/* Pie Chart */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ width: '192px', height: '192px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="spent"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.platform}
                      fill={platformColors[entry.platform]}
                      stroke="transparent"
                      style={{
                        filter: activeIndex === index ? 'brightness(1.2)' : 'brightness(1)',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <AnimatePresence mode="wait">
                {activeIndex !== null && data[activeIndex] ? (
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{ textAlign: 'center' }}
                  >
                    <PlatformIcon platform={data[activeIndex].platform.toLowerCase() as Platform} size={24} />
                    <span
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#FFFFFF',
                        textTransform: 'capitalize',
                        marginTop: '4px',
                      }}
                    >
                      {data[activeIndex].platform.toLowerCase()}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="total"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{ textAlign: 'center' }}
                  >
                    <span style={{ display: 'block', fontSize: '10px', color: '#6B6B7B' }}>Total</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{formatCurrency(totalSpent)}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Legend - compact list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {data.map((platform, index) => {
            const percentage = totalSpent > 0 ? (platform.spent / totalSpent) * 100 : 0
            const isActive = activeIndex === index
            const platformKey = platform.platform.toLowerCase()

            return (
              <motion.div
                key={platform.platform}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
              >
                <PlatformIcon platform={platformKey as Platform} size={18} />
                <span
                  style={{
                    fontSize: '14px',
                    textTransform: 'capitalize',
                    width: '56px',
                    flexShrink: 0,
                    color: isActive ? '#FFFFFF' : '#A0A0B0',
                    fontWeight: isActive ? 500 : 400,
                    transition: 'color 0.2s ease',
                  }}
                >
                  {platformKey}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    minWidth: '60px',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    style={{
                      height: '100%',
                      borderRadius: '9999px',
                      backgroundColor: platformColors[platform.platform] || '#3B82F6',
                      boxShadow: isActive ? `0 0 10px ${platformColors[platform.platform] || '#3B82F6'}50` : 'none',
                      transition: 'box-shadow 0.2s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '12px', color: '#6B6B7B', width: '40px', textAlign: 'right', flexShrink: 0 }}>
                  {percentage.toFixed(0)}%
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    width: '56px',
                    textAlign: 'right',
                    flexShrink: 0,
                    color: platform.roas >= 3 ? '#3B82F6' : platform.roas >= 2 ? '#FACC15' : '#F87171',
                  }}
                >
                  {(platform.roas || 0).toFixed(1)}x
                </span>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
