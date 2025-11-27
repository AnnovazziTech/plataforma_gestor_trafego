'use client'

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
import { formatCurrency } from '@/lib/utils'

export function CampaignPerformance() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null

    return (
      <div className="bg-[#1A1A25] border border-[#3B82F6]/20 rounded-xl p-4 shadow-2xl min-w-48">
        <p className="text-sm font-medium text-white mb-3 truncate">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-[#A0A0B0]">
                  {entry.dataKey === 'spent' ? 'Investido' :
                   entry.dataKey === 'conversions' ? 'Conversões' :
                   entry.dataKey === 'roas' ? 'ROAS' : entry.dataKey}
                </span>
              </div>
              <span className="text-xs font-medium text-white">
                {entry.dataKey === 'spent' ? formatCurrency(entry.value) :
                 entry.dataKey === 'roas' ? `${entry.value.toFixed(2)}x` :
                 entry.value.toLocaleString('pt-BR')}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getBarColor = (roas: number) => {
    if (roas >= 4) return '#3B82F6'
    if (roas >= 3) return '#60A5FA'
    if (roas >= 2) return '#FACC15'
    return '#FF6B6B'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance das Campanhas</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="text-xs text-[#6B6B7B]">Investido</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#FACC15]" />
            <span className="text-xs text-[#6B6B7B]">Conversões</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={campaignComparison}
              layout="vertical"
              margin={{ left: 0, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B6B7B', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#A0A0B0', fontSize: 10 }}
                width={100}
                tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
              <Bar dataKey="spent" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={16} />
              <Bar dataKey="conversions" fill="#FACC15" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ROAS Indicators */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="text-sm text-[#A0A0B0] mb-4 font-medium">ROAS por Campanha</p>
          <div className="flex items-center gap-3">
            {campaignComparison.map((campaign, index) => (
              <motion.div
                key={campaign.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex-1 p-4 rounded-xl bg-white/5 text-center"
              >
                <p className="text-xl font-bold mb-1" style={{ color: getBarColor(campaign.roas) }}>
                  {campaign.roas.toFixed(2)}x
                </p>
                <p className="text-xs text-[#6B6B7B] truncate" title={campaign.name}>
                  {campaign.name.split(' ')[0]}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
