'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown, Activity, Eye, MousePointer, DollarSign } from 'lucide-react'

type MetricKey = 'impressions' | 'clicks' | 'conversions' | 'spent' | 'revenue'

interface TimeSeriesItem {
  date: string
  impressions: number
  clicks: number
  conversions: number
  spent: number
  revenue: number
}

interface PerformanceChartProps {
  data: TimeSeriesItem[]
}

const metrics: { key: MetricKey; label: string; color: string; icon: any }[] = [
  { key: 'impressions', label: 'Impressões', color: '#3B82F6', icon: Eye },
  { key: 'clicks', label: 'Cliques', color: '#60A5FA', icon: MousePointer },
  { key: 'conversions', label: 'Conversões', color: '#FACC15', icon: Activity },
  { key: 'spent', label: 'Investido', color: '#1D4ED8', icon: DollarSign },
  { key: 'revenue', label: 'Receita', color: '#FDE047', icon: DollarSign },
]

export function PerformanceChart({ data }: PerformanceChartProps) {
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(['impressions', 'clicks', 'conversions'])

  const toggleMetric = (key: MetricKey) => {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  // Calculate metric stats
  const metricStats = useMemo(() => {
    if (!data || data.length === 0) {
      return metrics.reduce((acc, metric) => {
        acc[metric.key] = { current: 0, change: 0, avg: 0 }
        return acc
      }, {} as Record<MetricKey, { current: number; change: number; avg: number }>)
    }
    return metrics.reduce((acc, metric) => {
      const values = data.map(d => d[metric.key] || 0)
      const current = values[values.length - 1] || 0
      const previous = values[values.length - 2] || 0
      const change = previous ? ((current - previous) / previous) * 100 : 0
      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
      acc[metric.key] = { current, change, avg }
      return acc
    }, {} as Record<MetricKey, { current: number; change: number; avg: number }>)
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'linear-gradient(to bottom right, #1A1A25, #12121A)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(12px)',
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
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '9999px',
              backgroundColor: '#3B82F6',
            }}
          />
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
            {new Date(label).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {payload.map((entry: any, index: number) => {
            const metric = metrics.find(m => m.key === entry.dataKey)
            const Icon = metric?.icon || Activity
            return (
              <motion.div
                key={entry.dataKey}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ padding: '4px', borderRadius: '4px', backgroundColor: `${entry.color}20` }}>
                    <Icon size={12} style={{ color: entry.color }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#A0A0B0' }}>
                    {metric?.label}
                  </span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                  {entry.dataKey === 'spent' || entry.dataKey === 'revenue'
                    ? formatCurrency(entry.value)
                    : formatCompactNumber(entry.value)
                  }
                </span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    )
  }

  return (
    <Card style={{ gridColumn: 'span 2' }} variant="gradient" accentColor="blue" showAccentLine>
      <CardHeader>
        <div>
          <CardTitle>Performance ao Longo do Tempo</CardTitle>
          <p style={{ fontSize: '12px', color: '#6B6B7B', marginTop: '4px', margin: 0 }}>Acompanhe a evolução das suas métricas principais</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <motion.button
                key={metric.key}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => toggleMetric(metric.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  color: activeMetrics.includes(metric.key) ? '#FFFFFF' : '#6B6B7B',
                  backgroundColor: activeMetrics.includes(metric.key)
                    ? `${metric.color}20`
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeMetrics.includes(metric.key) ? metric.color : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: activeMetrics.includes(metric.key) ? `0 0 20px ${metric.color}20` : 'none',
                }}
              >
                <Icon size={12} />
                {metric.label}
              </motion.button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent>
        {/* Mini Stats for Active Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {activeMetrics.slice(0, 3).map((key) => {
            const metric = metrics.find(m => m.key === key)
            const stats = metricStats[key]
            if (!metric || !stats) return null
            const Icon = metric.icon
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={12} style={{ color: metric.color }} />
                    <span style={{ fontSize: '12px', color: '#6B6B7B' }}>{metric.label}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontSize: '12px',
                      color: stats.change >= 0 ? '#34D399' : '#F87171',
                    }}
                  >
                    {stats.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(stats.change).toFixed(1)}%
                  </div>
                </div>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  {key === 'spent' || key === 'revenue'
                    ? formatCurrency(stats.current)
                    : formatCompactNumber(stats.current)}
                </p>
              </motion.div>
            )
          })}
        </div>

        <div style={{ height: '288px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                {metrics.map((metric) => (
                  <linearGradient key={metric.key} id={`gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={metric.color} stopOpacity={0.4} />
                    <stop offset="50%" stopColor={metric.color} stopOpacity={0.1} />
                    <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B6B7B', fontSize: 10 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B6B7B', fontSize: 10 }}
                tickFormatter={formatYAxis}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              {metrics.map((metric) =>
                activeMetrics.includes(metric.key) && (
                  <Area
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    stroke={metric.color}
                    strokeWidth={2.5}
                    fill={`url(#gradient-${metric.key})`}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: metric.color,
                      stroke: '#12121A',
                      strokeWidth: 2,
                    }}
                  />
                )
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
