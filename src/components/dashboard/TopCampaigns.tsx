'use client'

import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent, Badge, PlatformIcon } from '@/components/ui'
import { campaigns } from '@/data/mock-data'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown, MoreVertical, ExternalLink } from 'lucide-react'

export function TopCampaigns() {
  const topCampaigns = campaigns
    .filter(c => c.status === 'active')
    .sort((a, b) => b.metrics.roas - a.metrics.roas)
    .slice(0, 5)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      active: 'success',
      paused: 'warning',
      ended: 'default' as any,
      error: 'error',
    }
    const labels: Record<string, string> = {
      active: 'Ativo',
      paused: 'Pausado',
      ended: 'Finalizado',
      error: 'Erro',
    }
    return <Badge variant={variants[status] || 'default'}>{labels[status]}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campanhas em Destaque</CardTitle>
        <button className="text-xs text-[#3B82F6] hover:underline">Ver todas</button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
              className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#3B82F6]/20 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-white/5 flex-shrink-0">
                    <PlatformIcon platform={campaign.platform} size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white group-hover:text-[#3B82F6] transition-colors truncate">
                      {campaign.name}
                    </p>
                    <p className="text-xs text-[#6B6B7B] capitalize truncate">{campaign.platform} • {campaign.objective}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStatusBadge(campaign.status)}
                  <button className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                    <MoreVertical size={14} className="text-[#6B6B7B]" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="min-w-0 p-2 rounded-lg bg-white/5 text-center">
                  <p className="text-xs text-[#6B6B7B] mb-1">Investido</p>
                  <p className="text-sm font-semibold text-white">{formatCurrency(campaign.spent)}</p>
                </div>
                <div className="min-w-0 p-2 rounded-lg bg-white/5 text-center">
                  <p className="text-xs text-[#6B6B7B] mb-1">Conversões</p>
                  <p className="text-sm font-semibold text-white">{formatCompactNumber(campaign.metrics.conversions)}</p>
                </div>
                <div className="min-w-0 p-2 rounded-lg bg-white/5 text-center">
                  <p className="text-xs text-[#6B6B7B] mb-1">CTR</p>
                  <p className="text-sm font-semibold text-white">{campaign.metrics.ctr.toFixed(2)}%</p>
                </div>
                <div className="min-w-0 p-2 rounded-lg bg-white/5 text-center">
                  <p className="text-xs text-[#6B6B7B] mb-1">ROAS</p>
                  <p className={`text-sm font-semibold flex items-center justify-center gap-1 ${
                    campaign.metrics.roas >= 3 ? 'text-[#3B82F6]' : campaign.metrics.roas >= 2 ? 'text-[#FACC15]' : 'text-red-400'
                  }`}>
                    {campaign.metrics.roas >= 3 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {campaign.metrics.roas.toFixed(2)}x
                  </p>
                </div>
              </div>

              {/* Budget Progress */}
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#6B6B7B]">Budget utilizado</span>
                  <span className="text-xs text-white">{((campaign.spent / campaign.budget) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#FACC15]"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
