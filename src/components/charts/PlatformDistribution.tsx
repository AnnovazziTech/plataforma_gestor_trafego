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
      <div className="bg-[#1A1A25] border border-[#00F5FF]/20 rounded-xl p-4 shadow-2xl">
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
            ROAS: <span className="text-[#00FF88]">{data.roas.toFixed(2)}x</span>
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
        <div className="flex items-center gap-6">
          {/* Pie Chart */}
          <div className="w-48 h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformMetrics}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
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
              <span className="text-xs text-[#6B6B7B]">Total</span>
              <span className="text-lg font-bold text-white">{formatCurrency(totalSpent)}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            {platformMetrics.map((platform, index) => {
              const percentage = (platform.spent / totalSpent) * 100

              return (
                <motion.div
                  key={platform.platform}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <PlatformIcon platform={platform.platform} size={20} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white capitalize">{platform.platform}</span>
                      <span className="text-xs text-[#A0A0B0]">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: platformColors[platform.platform] }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{formatCurrency(platform.spent)}</p>
                    <p className="text-xs text-[#00FF88]">ROAS {platform.roas.toFixed(2)}x</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
