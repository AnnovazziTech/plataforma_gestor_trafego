'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { campaignComparison } from '@/data/mock-data'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { DollarSign, Target, TrendingUp, TrendingDown, Award, BarChart3 } from 'lucide-react'

export function CampaignPerformance() {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)

  // Calculate summary stats
  const totalSpent = campaignComparison.reduce((acc, c) => acc + c.spent, 0)
  const totalConversions = campaignComparison.reduce((acc, c) => acc + c.conversions, 0)
  const avgRoas = campaignComparison.reduce((acc, c) => acc + c.roas, 0) / campaignComparison.length
  const bestCampaign = [...campaignComparison].sort((a, b) => b.roas - a.roas)[0]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null
    const campaign = campaignComparison.find(c => c.name === label)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[#1A1A25] to-[#12121A] border border-white/20 rounded-xl p-4 shadow-2xl min-w-[200px]"
      >
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
          <BarChart3 size={14} className="text-[#3B82F6]" />
          <p className="text-sm font-semibold text-white truncate">{label}</p>
        </div>
        <div className="space-y-2.5">
          {payload.map((entry: any) => {
            const Icon = entry.dataKey === 'spent' ? DollarSign : Target
            return (
              <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded" style={{ backgroundColor: `${entry.color}20` }}>
                    <Icon size={12} style={{ color: entry.color }} />
                  </div>
                  <span className="text-xs text-[#A0A0B0]">
                    {entry.dataKey === 'spent' ? 'Investido' :
                     entry.dataKey === 'conversions' ? 'Conversões' :
                     entry.dataKey === 'roas' ? 'ROAS' : entry.dataKey}
                  </span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {entry.dataKey === 'spent' ? formatCurrency(entry.value) :
                   entry.dataKey === 'roas' ? `${entry.value.toFixed(2)}x` :
                   formatCompactNumber(entry.value)}
                </span>
              </div>
            )
          })}
          {campaign && (
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-emerald-500/20">
                  <TrendingUp size={12} className="text-emerald-400" />
                </div>
                <span className="text-xs text-[#A0A0B0]">ROAS</span>
              </div>
              <span className={`text-sm font-bold ${getBarColor(campaign.roas).replace('bg-', 'text-').replace('/20', '')}`}>
                {campaign.roas.toFixed(2)}x
              </span>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const getBarColor = (roas: number) => {
    if (roas >= 4) return 'bg-[#3B82F6]/20 text-[#3B82F6]'
    if (roas >= 3) return 'bg-[#60A5FA]/20 text-[#60A5FA]'
    if (roas >= 2) return 'bg-[#FACC15]/20 text-[#FACC15]'
    return 'bg-red-500/20 text-red-400'
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
          <p className="text-xs text-[#6B6B7B] mt-1">Comparativo de investimento e resultados</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#3B82F6]/10">
            <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="text-xs text-[#3B82F6] font-medium">Investido</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#FACC15]/10">
            <div className="w-2 h-2 rounded-full bg-[#FACC15]" />
            <span className="text-xs text-[#FACC15] font-medium">Conversões</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="p-2.5 rounded-lg bg-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign size={12} className="text-[#3B82F6]" />
              <span className="text-xs text-[#6B6B7B]">Total Investido</span>
            </div>
            <p className="text-sm font-bold text-white">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Target size={12} className="text-[#FACC15]" />
              <span className="text-xs text-[#6B6B7B]">Conversões</span>
            </div>
            <p className="text-sm font-bold text-white">{formatCompactNumber(totalConversions)}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={12} className="text-emerald-400" />
              <span className="text-xs text-[#6B6B7B]">ROAS Médio</span>
            </div>
            <p className="text-sm font-bold text-[#3B82F6]">{avgRoas.toFixed(2)}x</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Award size={12} className="text-[#FACC15]" />
              <span className="text-xs text-[#6B6B7B]">Melhor</span>
            </div>
            <p className="text-sm font-bold text-white truncate" title={bestCampaign.name}>
              {bestCampaign.name.split(' ')[0]}
            </p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={campaignComparison}
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
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-[#A0A0B0] font-medium">ROAS por Campanha</p>
            <div className="flex items-center gap-2 text-xs text-[#6B6B7B]">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                &gt;4x
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#FACC15]" />
                2-4x
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                &lt;2x
              </span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {campaignComparison.map((campaign, index) => {
              const isHovered = hoveredBar === campaign.name
              return (
                <motion.div
                  key={campaign.name}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-3 rounded-xl text-center transition-all cursor-pointer ${
                    isHovered ? 'bg-white/10 scale-105' : 'bg-white/5 hover:bg-white/8'
                  }`}
                  onMouseEnter={() => setHoveredBar(campaign.name)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {campaign.roas === bestCampaign.roas && (
                    <div className="absolute -top-1 -right-1">
                      <Award size={14} className="text-[#FACC15]" />
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {campaign.roas >= avgRoas ? (
                      <TrendingUp size={12} className="text-emerald-400" />
                    ) : (
                      <TrendingDown size={12} className="text-red-400" />
                    )}
                    <p className="text-lg font-bold" style={{ color: getTextColor(campaign.roas) }}>
                      {campaign.roas.toFixed(1)}x
                    </p>
                  </div>
                  <p className="text-xs text-[#6B6B7B] truncate" title={campaign.name}>
                    {campaign.name.split(' ')[0]}
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
