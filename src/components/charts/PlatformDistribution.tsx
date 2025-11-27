'use client'

import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent, PlatformIcon } from '@/components/ui'
import { platformMetrics } from '@/data/mock-data'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { Platform } from '@/types'

const platformColors: Record<Platform, string> = {
  meta: '#0081FB',
  google: '#4285F4',
  tiktok: '#00F2EA',
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  pinterest: '#E60023',
}

export function PlatformDistribution() {
  const totalSpent = platformMetrics.reduce((acc, p) => acc + p.spent, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null
    const data = payload[0].payload

    return (
      <div className="bg-[#1A1A25] border border-[#3B82F6]/20 rounded-xl p-4 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <PlatformIcon platform={data.platform} size={20} />
          <span className="text-sm font-medium text-white capitalize">{data.platform}</span>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[#A0A0B0]">
            Investido: <span className="text-white">{formatCurrency(data.spent)}</span>
          </p>
          <p className="text-xs text-[#A0A0B0]">
            Campanhas: <span className="text-white">{data.campaigns}</span>
          </p>
          <p className="text-xs text-[#A0A0B0]">
            ROAS: <span className="text-[#3B82F6]">{data.roas.toFixed(2)}x</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Plataforma</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Pie Chart */}
        <div className="flex justify-center mb-6">
          <div className="w-44 h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformMetrics}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="spent"
                >
                  {platformMetrics.map((entry) => (
                    <Cell
                      key={entry.platform}
                      fill={platformColors[entry.platform]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-[#6B6B7B]">Total</span>
              <span className="text-sm font-bold text-white">{formatCurrency(totalSpent)}</span>
            </div>
          </div>
        </div>

        {/* Legend - compact list */}
        <div className="space-y-2.5">
          {platformMetrics.map((platform, index) => {
            const percentage = (platform.spent / totalSpent) * 100

            return (
              <motion.div
                key={platform.platform}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 py-2 px-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <PlatformIcon platform={platform.platform} size={18} className="flex-shrink-0" />
                <span className="text-sm text-white capitalize w-16 flex-shrink-0">{platform.platform}</span>
                <span className="text-xs text-[#A0A0B0] w-12 flex-shrink-0">{percentage.toFixed(1)}%</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden min-w-[40px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: platformColors[platform.platform] }}
                  />
                </div>
                <span className="text-sm font-medium text-white text-right w-24 flex-shrink-0">{formatCurrency(platform.spent)}</span>
                <span className="text-xs text-[#3B82F6] font-medium w-20 text-right flex-shrink-0">ROAS {platform.roas.toFixed(1)}x</span>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
