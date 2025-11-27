'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Card, CardContent, Button, Badge, PlatformIcon } from '@/components/ui'
import { campaigns } from '@/data/mock-data'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { Campaign, Platform, CampaignStatus } from '@/types'
import {
  Plus,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Edit,
  Copy,
  TrendingUp,
  TrendingDown,
  MousePointer,
  DollarSign,
  Target,
  Calendar,
  LayoutGrid,
  List,
  ChevronDown,
} from 'lucide-react'

const statusLabels: Record<CampaignStatus, string> = {
  active: 'Ativo',
  paused: 'Pausado',
  ended: 'Finalizado',
  draft: 'Rascunho',
  error: 'Erro',
}

const statusColors: Record<CampaignStatus, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  active: 'success',
  paused: 'warning',
  ended: 'default',
  draft: 'info',
  error: 'error',
}

export default function CampaignsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<CampaignStatus | 'all'>('all')
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlatform = selectedPlatform === 'all' || campaign.platform === selectedPlatform
    const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus
    return matchesSearch && matchesPlatform && matchesStatus
  })

  const platforms: Platform[] = ['meta', 'google', 'tiktok', 'linkedin', 'twitter']
  const statuses: CampaignStatus[] = ['active', 'paused', 'ended', 'draft', 'error']

  return (
    <div className="min-h-screen">
      <Header
        title="Campanhas"
        subtitle="Gerencie todas as suas campanhas de tráfego pago"
      />

      <main className="p-6 md:p-8">
        {/* Filters Bar - Filtros e Visualização */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Filtros */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filtro por Plataforma */}
            <div className="relative">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as Platform | 'all')}
                className="h-11 pl-4 pr-10 rounded-xl bg-white/5 border border-white/10 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6]/50 hover:border-[#3B82F6]/30 transition-all"
              >
                <option value="all">Todas Plataformas</option>
                {platforms.map((platform) => (
                  <option key={platform} value={platform} className="bg-[#12121A]">
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B7B] pointer-events-none" />
            </div>

            {/* Filtro por Status */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as CampaignStatus | 'all')}
                className="h-11 pl-4 pr-10 rounded-xl bg-white/5 border border-white/10 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6]/50 hover:border-[#3B82F6]/30 transition-all"
              >
                <option value="all">Todos Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status} className="bg-[#12121A]">
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B7B] pointer-events-none" />
            </div>
          </div>

          {/* Modo de Visualização */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-[#6B6B7B] hover:text-white'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-[#6B6B7B] hover:text-white'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total de Campanhas', value: campaigns.length, icon: Target, color: 'blue' },
            { label: 'Campanhas Ativas', value: campaigns.filter(c => c.status === 'active').length, icon: Play, color: 'yellow' },
            { label: 'Total Investido', value: formatCurrency(campaigns.reduce((acc, c) => acc + c.spent, 0)), icon: DollarSign, color: 'blue' },
            { label: 'ROAS Médio', value: `${(campaigns.reduce((acc, c) => acc + c.metrics.roas, 0) / campaigns.length).toFixed(2)}x`, icon: TrendingUp, color: 'yellow' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-xl bg-gradient-to-br from-[#12121A] to-[#0D0D14] border border-white/10 hover:border-[#3B82F6]/30 transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 rounded-xl mb-3 ${stat.color === 'blue' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-[#FACC15]/10 text-[#FACC15]'}`}>
                  <stat.icon size={22} />
                </div>
                <p className="text-sm text-[#A0A0B0] mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Campaigns Grid/List */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredCampaigns.map((campaign, index) => (
                <CampaignCard key={campaign.id} campaign={campaign} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CampaignTable campaigns={filteredCampaigns} />
            </motion.div>
          )}
        </AnimatePresence>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#6B6B7B]">Nenhuma campanha encontrada</p>
          </div>
        )}
      </main>
    </div>
  )
}

function CampaignCard({ campaign, index }: { campaign: Campaign; index: number }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative p-5 rounded-2xl bg-[#12121A]/80 border border-white/5 hover:border-[#3B82F6]/30 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5">
            <PlatformIcon platform={campaign.platform} size={22} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-[#3B82F6] transition-colors line-clamp-1">
              {campaign.name}
            </h3>
            <p className="text-xs text-[#6B6B7B] capitalize">{campaign.objective}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusColors[campaign.status]}>{statusLabels[campaign.status]}</Badge>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#6B6B7B] hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={16} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-40 bg-[#1A1A25] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10"
                >
                  {[
                    { icon: Edit, label: 'Editar' },
                    { icon: Copy, label: 'Duplicar' },
                    { icon: campaign.status === 'active' ? Pause : Play, label: campaign.status === 'active' ? 'Pausar' : 'Ativar' },
                    { icon: Trash2, label: 'Excluir', danger: true },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors ${action.danger ? 'text-red-400' : 'text-[#A0A0B0]'}`}
                    >
                      <action.icon size={14} />
                      {action.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Investido', value: formatCurrency(campaign.spent), icon: DollarSign },
          { label: 'Conversões', value: formatCompactNumber(campaign.metrics.conversions), icon: Target },
          { label: 'CTR', value: `${campaign.metrics.ctr.toFixed(2)}%`, icon: MousePointer },
          { label: 'ROAS', value: `${campaign.metrics.roas.toFixed(2)}x`, icon: TrendingUp, highlight: campaign.metrics.roas >= 3 },
        ].map((metric) => (
          <div key={metric.label} className="p-3 rounded-lg bg-white/5 text-center">
            <p className="text-xs text-[#6B6B7B] mb-1">{metric.label}</p>
            <p className={`text-sm font-semibold ${metric.highlight ? 'text-[#3B82F6]' : 'text-white'}`}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Budget Progress */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[#6B6B7B]">Budget</span>
          <span className="text-white">{formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
            transition={{ duration: 1, delay: index * 0.05 }}
            className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#FACC15]"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 text-xs text-[#6B6B7B]">
        <Calendar size={12} />
        <span>{new Date(campaign.startDate).toLocaleDateString('pt-BR')}</span>
        {campaign.endDate && (
          <>
            <span>-</span>
            <span>{new Date(campaign.endDate).toLocaleDateString('pt-BR')}</span>
          </>
        )}
      </div>
    </motion.div>
  )
}

function CampaignTable({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="rounded-2xl bg-[#12121A]/80 border border-white/5 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left text-xs font-medium text-[#6B6B7B] uppercase tracking-wider p-4">Campanha</th>
            <th className="text-left text-xs font-medium text-[#6B6B7B] uppercase tracking-wider p-4">Status</th>
            <th className="text-right text-xs font-medium text-[#6B6B7B] uppercase tracking-wider p-4">Investido</th>
            <th className="text-right text-xs font-medium text-[#6B6B7B] uppercase tracking-wider p-4">Impressões</th>
            <th className="text-right text-xs font-medium text-[#6B6B7B] uppercase tracking-wider p-4">Cliques</th>
            <th className="text-right text-xs font-medium text-[#6B6B7B] uppercase tracking-wider p-4">CTR</th>
            <th className="text-right text-xs font-medium text-[#6B6B7B] uppercase tracking-wider p-4">Conversões</th>
            <th className="text-right text-xs font-medium text-[#6B6B7B] uppercase tracking-wider p-4">ROAS</th>
            <th className="text-center text-xs font-medium text-[#6B6B7B] uppercase tracking-wider p-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign, index) => (
            <motion.tr
              key={campaign.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <PlatformIcon platform={campaign.platform} size={20} />
                  <div>
                    <p className="text-sm font-medium text-white">{campaign.name}</p>
                    <p className="text-xs text-[#6B6B7B] capitalize">{campaign.objective}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <Badge variant={statusColors[campaign.status]}>{statusLabels[campaign.status]}</Badge>
              </td>
              <td className="p-4 text-right text-sm text-white">{formatCurrency(campaign.spent)}</td>
              <td className="p-4 text-right text-sm text-white">{formatCompactNumber(campaign.metrics.impressions)}</td>
              <td className="p-4 text-right text-sm text-white">{formatCompactNumber(campaign.metrics.clicks)}</td>
              <td className="p-4 text-right text-sm text-white">{campaign.metrics.ctr.toFixed(2)}%</td>
              <td className="p-4 text-right text-sm text-white">{formatCompactNumber(campaign.metrics.conversions)}</td>
              <td className="p-4 text-right">
                <span className={`text-sm font-medium ${campaign.metrics.roas >= 3 ? 'text-[#3B82F6]' : campaign.metrics.roas >= 2 ? 'text-[#FACC15]' : 'text-red-400'}`}>
                  {campaign.metrics.roas.toFixed(2)}x
                </span>
              </td>
              <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-[#6B6B7B] hover:text-white transition-all">
                    <Edit size={14} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-[#6B6B7B] hover:text-white transition-all">
                    {campaign.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-[#6B6B7B] hover:text-red-400 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
