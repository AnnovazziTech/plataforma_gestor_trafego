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
      <div className="bg-[#1A1A25] border border-[#00F5FF]/20 rounded-xl p-4 shadow-2xl min-w-48">
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
    if (roas >= 4) return '#00FF88'
    if (roas >= 3) return '#00F5FF'
    if (roas >= 2) return '#FFE500'
    return '#FF6B6B'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance das Campanhas</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#00F5FF]" />
            <span className="text-xs text-[#6B6B7B]">Investido</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#BF00FF]" />
            <span className="text-xs text-[#6B6B7B]">Conversões</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
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
                tick={{ fill: '#A0A0B0', fontSize: 11 }}
                width={150}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 245, 255, 0.05)' }} />
              <Bar dataKey="spent" fill="#00F5FF" radius={[0, 4, 4, 0]} barSize={16} />
              <Bar dataKey="conversions" fill="#BF00FF" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ROAS Indicators */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-[#6B6B7B] mb-3">ROAS por Campanha</p>
          <div className="flex items-center gap-2">
            {campaignComparison.map((campaign, index) => (
              <motion.div
                key={campaign.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex-1 p-3 rounded-lg bg-white/5 text-center"
              >
                <p className="text-lg font-bold" style={{ color: getBarColor(campaign.roas) }}>
                  {campaign.roas.toFixed(2)}x
                </p>
                <p className="text-xs text-[#6B6B7B] truncate mt-1" title={campaign.name}>
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
