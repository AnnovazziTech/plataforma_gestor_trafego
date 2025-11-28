'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Card, CardContent, Button, Badge, PlatformIcon, StatCard } from '@/components/ui'
import { campaigns } from '@/data/mock-data'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { Campaign, Platform, CampaignStatus } from '@/types'
import { useApp } from '@/contexts'
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
  Sparkles,
  Bot,
  X,
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
  const { connectedAccounts, selectedAccount, setSelectedAccount } = useApp()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<CampaignStatus | 'all'>('all')
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<{ campaignId: string; analysis: string } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null)

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlatform = selectedPlatform === 'all' || campaign.platform === selectedPlatform
    const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus
    return matchesSearch && matchesPlatform && matchesStatus
  })

  const platforms: Platform[] = ['meta', 'google', 'tiktok', 'linkedin', 'twitter']
  const statuses: CampaignStatus[] = ['active', 'paused', 'ended', 'draft', 'error']

  const handleAiAnalysis = (campaignId: string, campaignName: string) => {
    setIsAnalyzing(campaignId)
    // Simular análise da IA
    setTimeout(() => {
      const analyses = [
        `A campanha "${campaignName}" apresenta um CTR acima da média do mercado. Recomenda-se aumentar o orçamento em 20% para escalar os resultados. O público-alvo está bem segmentado, mas considere testar novos criativos para evitar fadiga de anúncio.`,
        `Esta campanha tem um ROAS excelente de 3.5x. Os horários de maior conversão são entre 19h-22h. Sugestão: concentrar 60% do orçamento neste período para maximizar ROI.`,
        `A campanha "${campaignName}" está com CPC elevado comparado ao benchmark. Recomendações: 1) Revisar segmentação de público, 2) Testar novos títulos de anúncio, 3) Considerar formato de vídeo curto.`,
        `Performance sólida com tendência de crescimento. O custo por conversão diminuiu 15% na última semana. Mantenha a estratégia atual e monitore a frequência para evitar saturação.`
      ]
      setAiAnalysis({
        campaignId,
        analysis: analyses[Math.floor(Math.random() * analyses.length)]
      })
      setIsAnalyzing(null)
    }, 2000)
  }

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
            {/* Filtro por Conta */}
            <div className="relative">
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="h-11 pl-4 pr-10 rounded-xl bg-white/5 border border-white/10 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6]/50 hover:border-[#3B82F6]/30 transition-all"
              >
                <option value="all">Todas as Contas</option>
                {connectedAccounts.filter(a => a.connected).map((account) => (
                  <option key={account.id} value={account.id} className="bg-[#12121A]">
                    {account.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B7B] pointer-events-none" />
            </div>

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
          <StatCard
            label="Total de Campanhas"
            value={campaigns.length}
            icon={Target}
            color="blue"
            delay={0}
          />
          <StatCard
            label="Campanhas Ativas"
            value={campaigns.filter(c => c.status === 'active').length}
            icon={Play}
            color="yellow"
            delay={0.1}
          />
          <StatCard
            label="Total Investido"
            value={formatCurrency(campaigns.reduce((acc, c) => acc + c.spent, 0))}
            icon={DollarSign}
            color="blue"
            delay={0.2}
          />
          <StatCard
            label="ROAS Médio"
            value={`${(campaigns.reduce((acc, c) => acc + c.metrics.roas, 0) / campaigns.length).toFixed(2)}x`}
            icon={TrendingUp}
            color="yellow"
            delay={0.3}
          />
        </div>

        {/* Campaigns Grid/List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Campanhas - Ocupa 2 colunas */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10"
                >
                  {filteredCampaigns.map((campaign, index) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      index={index}
                      onAiAnalysis={handleAiAnalysis}
                      isAnalyzing={isAnalyzing === campaign.id}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-h-[600px] overflow-y-auto"
                >
                  <CampaignTable campaigns={filteredCampaigns} onAiAnalysis={handleAiAnalysis} isAnalyzing={isAnalyzing} />
                </motion.div>
              )}
            </AnimatePresence>

            {filteredCampaigns.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[#6B6B7B]">Nenhuma campanha encontrada</p>
              </div>
            )}
          </div>

          {/* Quadro de Análise da IA */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 p-5 rounded-2xl bg-gradient-to-br from-[#12121A] to-[#0D0D14] border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20">
                  <Bot className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Análise da IA</h3>
                  <p className="text-xs text-[#6B6B7B]">Insights inteligentes sobre suas campanhas</p>
                </div>
              </div>

              {aiAnalysis ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-white/5 border border-[#3B82F6]/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-[#3B82F6] flex items-center gap-1.5">
                        <Sparkles size={12} />
                        Análise Gerada
                      </span>
                      <button
                        onClick={() => setAiAnalysis(null)}
                        className="p-1 rounded hover:bg-white/10 text-[#6B6B7B] hover:text-white transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-sm text-[#A0A0B0] leading-relaxed">
                      {aiAnalysis.analysis}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <p className="text-xs text-emerald-400 mb-1">Recomendação</p>
                      <p className="text-sm font-semibold text-white">Escalar</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/20 text-center">
                      <p className="text-xs text-[#FACC15] mb-1">Prioridade</p>
                      <p className="text-sm font-semibold text-white">Alta</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#6B6B7B]" />
                  </div>
                  <p className="text-sm text-[#6B6B7B] mb-2">Nenhuma análise selecionada</p>
                  <p className="text-xs text-[#4B4B5B]">
                    Clique no ícone <span className="text-[#FACC15]">✨</span> em uma campanha para solicitar análise da IA
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

function CampaignCard({ campaign, index, onAiAnalysis, isAnalyzing }: { campaign: Campaign; index: number; onAiAnalysis: (id: string, name: string) => void; isAnalyzing: boolean }) {
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAiAnalysis(campaign.id, campaign.name)}
                className={`text-lg hover:scale-125 transition-transform ${isAnalyzing ? 'animate-pulse' : ''}`}
                title="Solicitar análise da IA"
              >
                ✨
              </button>
              <h3 className="text-sm font-semibold text-white group-hover:text-[#3B82F6] transition-colors line-clamp-1">
                {campaign.name}
              </h3>
            </div>
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

function CampaignTable({ campaigns, onAiAnalysis, isAnalyzing }: { campaigns: Campaign[]; onAiAnalysis: (id: string, name: string) => void; isAnalyzing: string | null }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#12121A] to-[#0D0D14] border border-white/10 overflow-hidden shadow-xl shadow-black/20">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[#3B82F6] to-[#60A5FA]" />
            <h3 className="text-sm font-semibold text-white">Lista de Campanhas</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-medium">
              {campaigns.length} campanhas
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="text-left text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider px-6 py-4">Campanha</th>
              <th className="text-left text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider px-4 py-4">Status</th>
              <th className="text-right text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider px-4 py-4">Investido</th>
              <th className="text-right text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider px-4 py-4">Impressões</th>
              <th className="text-right text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider px-4 py-4">Cliques</th>
              <th className="text-right text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider px-4 py-4">CTR</th>
              <th className="text-right text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider px-4 py-4">Conversões</th>
              <th className="text-right text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider px-4 py-4">ROAS</th>
              <th className="text-center text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider px-4 py-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {campaigns.map((campaign, index) => (
              <motion.tr
                key={campaign.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group hover:bg-gradient-to-r hover:from-[#3B82F6]/5 hover:to-transparent transition-all duration-300"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                      <PlatformIcon platform={campaign.platform} size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onAiAnalysis(campaign.id, campaign.name)}
                          className={`text-base hover:scale-125 transition-transform ${isAnalyzing === campaign.id ? 'animate-pulse' : ''}`}
                          title="Solicitar análise da IA"
                        >
                          ✨
                        </button>
                        <p className="text-sm font-medium text-white group-hover:text-[#3B82F6] transition-colors">{campaign.name}</p>
                      </div>
                      <p className="text-xs text-[#6B6B7B] capitalize">{campaign.objective}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge variant={statusColors[campaign.status]}>{statusLabels[campaign.status]}</Badge>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-sm font-medium text-white">{formatCurrency(campaign.spent)}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-sm text-[#A0A0B0]">{formatCompactNumber(campaign.metrics.impressions)}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-sm text-[#A0A0B0]">{formatCompactNumber(campaign.metrics.clicks)}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-white">{campaign.metrics.ctr.toFixed(2)}%</span>
                    {campaign.metrics.ctr >= 2 && (
                      <TrendingUp size={12} className="text-emerald-400" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Target size={12} className="text-[#6B6B7B]" />
                    <span className="text-sm font-medium text-white">{formatCompactNumber(campaign.metrics.conversions)}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold ${
                    campaign.metrics.roas >= 3
                      ? 'bg-[#3B82F6]/10 text-[#3B82F6]'
                      : campaign.metrics.roas >= 2
                        ? 'bg-[#FACC15]/10 text-[#FACC15]'
                        : 'bg-red-500/10 text-red-400'
                  }`}>
                    {campaign.metrics.roas >= 3 && <TrendingUp size={12} />}
                    {campaign.metrics.roas < 2 && <TrendingDown size={12} />}
                    {campaign.metrics.roas.toFixed(2)}x
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-[#3B82F6]/20 text-[#6B6B7B] hover:text-[#3B82F6] transition-all" title="Editar">
                      <Edit size={14} />
                    </button>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-[#FACC15]/20 text-[#6B6B7B] hover:text-[#FACC15] transition-all" title={campaign.status === 'active' ? 'Pausar' : 'Ativar'}>
                      {campaign.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-[#6B6B7B] hover:text-red-400 transition-all" title="Excluir">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center justify-between text-xs text-[#6B6B7B]">
          <span>Mostrando {campaigns.length} campanhas</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              ROAS Alto (&gt;3x)
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#FACC15]" />
              ROAS Médio (2-3x)
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              ROAS Baixo (&lt;2x)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
