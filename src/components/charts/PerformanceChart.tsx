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
  ReferenceLine,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { timeSeriesData } from '@/data/mock-data'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown, Activity, Eye, MousePointer, DollarSign } from 'lucide-react'

type MetricKey = 'impressions' | 'clicks' | 'conversions' | 'spent' | 'revenue'

const metrics: { key: MetricKey; label: string; color: string; icon: any }[] = [
  { key: 'impressions', label: 'Impressões', color: '#3B82F6', icon: Eye },
  { key: 'clicks', label: 'Cliques', color: '#60A5FA', icon: MousePointer },
  { key: 'conversions', label: 'Conversões', color: '#FACC15', icon: Activity },
  { key: 'spent', label: 'Investido', color: '#1D4ED8', icon: DollarSign },
  { key: 'revenue', label: 'Receita', color: '#FDE047', icon: DollarSign },
]

export function PerformanceChart() {
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
    return metrics.reduce((acc, metric) => {
      const values = timeSeriesData.map(d => d[metric.key])
      const current = values[values.length - 1]
      const previous = values[values.length - 2]
      const change = previous ? ((current - previous) / previous) * 100 : 0
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      acc[metric.key] = { current, change, avg }
      return acc
    }, {} as Record<MetricKey, { current: number; change: number; avg: number }>)
  }, [])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[#1A1A25] to-[#12121A] border border-[#3B82F6]/30 rounded-xl p-4 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
          <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
          <p className="text-sm font-semibold text-white">
            {new Date(label).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
          </p>
        </div>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => {
            const metric = metrics.find(m => m.key === entry.dataKey)
            const Icon = metric?.icon || Activity
            return (
              <motion.div
                key={entry.dataKey}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between gap-6"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded" style={{ backgroundColor: `${entry.color}20` }}>
                    <Icon size={12} style={{ color: entry.color }} />
                  </div>
                  <span className="text-xs text-[#A0A0B0]">
                    {metric?.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-white">
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
    <Card className="col-span-2" variant="gradient" accentColor="blue" showAccentLine>
      <CardHeader>
        <div>
          <CardTitle>Performance ao Longo do Tempo</CardTitle>
          <p className="text-xs text-[#6B6B7B] mt-1">Acompanhe a evolução das suas métricas principais</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <motion.button
                key={metric.key}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => toggleMetric(metric.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeMetrics.includes(metric.key)
                    ? 'text-white shadow-lg'
                    : 'text-[#6B6B7B] hover:text-white'
                }`}
                style={{
                  backgroundColor: activeMetrics.includes(metric.key)
                    ? `${metric.color}20`
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeMetrics.includes(metric.key) ? metric.color : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: activeMetrics.includes(metric.key) ? `0 0 20px ${metric.color}20` : 'none'
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
        <div className="grid grid-cols-3 gap-3 mb-4">
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
                className="p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} style={{ color: metric.color }} />
                    <span className="text-xs text-[#6B6B7B]">{metric.label}</span>
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs ${stats.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stats.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(stats.change).toFixed(1)}%
                  </div>
                </div>
                <p className="text-lg font-bold text-white">
                  {key === 'spent' || key === 'revenue'
                    ? formatCurrency(stats.current)
                    : formatCompactNumber(stats.current)}
                </p>
              </motion.div>
            )
          })}
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
