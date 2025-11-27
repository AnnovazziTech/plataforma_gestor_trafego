'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent, PlatformIcon } from '@/components/ui'
import { platformMetrics } from '@/data/mock-data'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { Platform } from '@/types'
import { TrendingUp, Users, Target, DollarSign } from 'lucide-react'

const platformColors: Record<Platform, string> = {
  meta: '#0081FB',
  google: '#4285F4',
  tiktok: '#00F2EA',
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  pinterest: '#E60023',
}

export function PlatformDistribution() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const totalSpent = platformMetrics.reduce((acc, p) => acc + p.spent, 0)
  const totalCampaigns = platformMetrics.reduce((acc, p) => acc + p.campaigns, 0)
  const avgRoas = platformMetrics.reduce((acc, p) => acc + p.roas, 0) / platformMetrics.length

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))' }}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 4}
          outerRadius={innerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.3}
        />
      </g>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null
    const data = payload[0].payload
    const percentage = (data.spent / totalSpent) * 100
    const platformColor = platformColors[data.platform as Platform] || '#3B82F6'

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[#1A1A25] to-[#12121A] border border-white/20 rounded-xl p-4 shadow-2xl min-w-[180px]"
      >
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
          <PlatformIcon platform={data.platform} size={20} />
          <span className="text-sm font-semibold text-white capitalize">{data.platform}</span>
          <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${platformColor}20`, color: platformColor }}>
            {percentage.toFixed(1)}%
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#A0A0B0]">
              <DollarSign size={12} />
              Investido
            </div>
            <span className="text-sm font-medium text-white">{formatCurrency(data.spent)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#A0A0B0]">
              <Target size={12} />
              Campanhas
            </div>
            <span className="text-sm font-medium text-white">{data.campaigns}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#A0A0B0]">
              <TrendingUp size={12} />
              ROAS
            </div>
            <span className={`text-sm font-semibold ${data.roas >= 3 ? 'text-[#3B82F6]' : data.roas >= 2 ? 'text-[#FACC15]' : 'text-red-400'}`}>
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
          <CardTitle>Distribuição por Plataforma</CardTitle>
          <p className="text-xs text-[#6B6B7B] mt-1">Investimento por canal de aquisição</p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2.5 rounded-lg bg-white/5 text-center">
            <p className="text-lg font-bold text-white">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-[#6B6B7B]">Total Investido</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5 text-center">
            <p className="text-lg font-bold text-white">{totalCampaigns}</p>
            <p className="text-xs text-[#6B6B7B]">Campanhas</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5 text-center">
            <p className="text-lg font-bold text-[#3B82F6]">{avgRoas.toFixed(2)}x</p>
            <p className="text-xs text-[#6B6B7B]">ROAS Médio</p>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="flex justify-center mb-4">
          <div className="w-48 h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformMetrics}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="spent"
                >
                  {platformMetrics.map((entry, index) => (
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
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <AnimatePresence mode="wait">
                {activeIndex !== null ? (
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center"
                  >
                    <PlatformIcon platform={platformMetrics[activeIndex].platform} size={24} className="mx-auto mb-1" />
                    <span className="text-xs font-medium text-white capitalize block">
                      {platformMetrics[activeIndex].platform}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="total"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center"
                  >
                    <span className="text-[10px] text-[#6B6B7B] block">Total</span>
                    <span className="text-sm font-bold text-white">{formatCurrency(totalSpent)}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Legend - compact list */}
        <div className="space-y-1.5">
          {platformMetrics.map((platform, index) => {
            const percentage = (platform.spent / totalSpent) * 100
            const isActive = activeIndex === index

            return (
              <motion.div
                key={platform.platform}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all cursor-pointer ${
                  isActive ? 'bg-white/10 scale-[1.02]' : 'hover:bg-white/5'
                }`}
              >
                <PlatformIcon platform={platform.platform} size={18} className="flex-shrink-0" />
                <span className={`text-sm capitalize w-14 flex-shrink-0 transition-colors ${isActive ? 'text-white font-medium' : 'text-[#A0A0B0]'}`}>
                  {platform.platform}
                </span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden min-w-[60px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full rounded-full transition-all"
                    style={{
                      backgroundColor: platformColors[platform.platform],
                      boxShadow: isActive ? `0 0 10px ${platformColors[platform.platform]}50` : 'none'
                    }}
                  />
                </div>
                <span className="text-xs text-[#6B6B7B] w-10 text-right flex-shrink-0">{percentage.toFixed(0)}%</span>
                <span className={`text-xs font-medium w-14 text-right flex-shrink-0 ${
                  platform.roas >= 3 ? 'text-[#3B82F6]' : platform.roas >= 2 ? 'text-[#FACC15]' : 'text-red-400'
                }`}>
                  {platform.roas.toFixed(1)}x
                </span>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
