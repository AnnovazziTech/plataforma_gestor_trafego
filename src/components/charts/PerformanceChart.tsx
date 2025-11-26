'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { timeSeriesData } from '@/data/mock-data'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'

type MetricKey = 'impressions' | 'clicks' | 'conversions' | 'spent' | 'revenue'

const metrics: { key: MetricKey; label: string; color: string }[] = [
  { key: 'impressions', label: 'Impressões', color: '#00F5FF' },
  { key: 'clicks', label: 'Cliques', color: '#BF00FF' },
  { key: 'conversions', label: 'Conversões', color: '#00FF88' },
  { key: 'spent', label: 'Investido', color: '#FF6B00' },
  { key: 'revenue', label: 'Receita', color: '#FFE500' },
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null

    return (
      <div className="bg-[#1A1A25] border border-[#00F5FF]/20 rounded-xl p-4 shadow-2xl">
        <p className="text-sm font-medium text-white mb-2">
          {new Date(label).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-[#A0A0B0]">
                  {metrics.find(m => m.key === entry.dataKey)?.label}
                </span>
              </div>
              <span className="text-xs font-medium text-white">
                {entry.dataKey === 'spent' || entry.dataKey === 'revenue'
                  ? formatCurrency(entry.value)
                  : formatCompactNumber(entry.value)
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Performance ao Longo do Tempo</CardTitle>
        <div className="flex items-center gap-2">
          {metrics.map((metric) => (
            <motion.button
              key={metric.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleMetric(metric.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                activeMetrics.includes(metric.key)
                  ? 'text-white'
                  : 'text-[#6B6B7B] hover:text-white'
              }`}
              style={{
                backgroundColor: activeMetrics.includes(metric.key)
                  ? `${metric.color}20`
                  : 'transparent',
                border: `1px solid ${activeMetrics.includes(metric.key) ? metric.color : 'transparent'}`,
              }}
            >
              {metric.label}
            </motion.button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData}>
              <defs>
                {metrics.map((metric) => (
                  <linearGradient key={metric.key} id={`gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={metric.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B6B7B', fontSize: 11 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B6B7B', fontSize: 11 }}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              {metrics.map((metric) =>
                activeMetrics.includes(metric.key) && (
                  <Area
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    stroke={metric.color}
                    strokeWidth={2}
                    fill={`url(#gradient-${metric.key})`}
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
