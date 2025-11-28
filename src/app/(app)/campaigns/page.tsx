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
    setTimeout(() => {
      const analyses = [
        `A campanha "${campaignName}" apresenta um CTR acima da media do mercado. Recomenda-se aumentar o orcamento em 20% para escalar os resultados. O publico-alvo esta bem segmentado, mas considere testar novos criativos para evitar fadiga de anuncio.`,
        `Esta campanha tem um ROAS excelente de 3.5x. Os horarios de maior conversao sao entre 19h-22h. Sugestao: concentrar 60% do orcamento neste periodo para maximizar ROI.`,
        `A campanha "${campaignName}" esta com CPC elevado comparado ao benchmark. Recomendacoes: 1) Revisar segmentacao de publico, 2) Testar novos titulos de anuncio, 3) Considerar formato de video curto.`,
        `Performance solida com tendencia de crescimento. O custo por conversao diminuiu 15% na ultima semana. Mantenha a estrategia atual e monitore a frequencia para evitar saturacao.`
      ]
      setAiAnalysis({
        campaignId,
        analysis: analyses[Math.floor(Math.random() * analyses.length)]
      })
      setIsAnalyzing(null)
    }, 2000)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        title="Campanhas"
        subtitle="Gerencie todas as suas campanhas de trafego pago"
      />

      <main style={{ padding: '24px 32px' }}>
        {/* Filters Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
          {/* Filtros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Filtro por Conta */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                style={{
                  height: '44px',
                  paddingLeft: '16px',
                  paddingRight: '40px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '14px',
                  color: '#FFFFFF',
                  appearance: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '180px',
                }}
              >
                <option value="all" style={{ backgroundColor: '#12121A' }}>Todas as Contas</option>
                {connectedAccounts.filter(a => a.connected).map((account) => (
                  <option key={account.id} value={account.id} style={{ backgroundColor: '#12121A' }}>
                    {account.name}
                  </option>
                ))}
              </select>
              <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6B6B7B', pointerEvents: 'none' }} />
            </div>

            {/* Filtro por Plataforma */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as Platform | 'all')}
                style={{
                  height: '44px',
                  paddingLeft: '16px',
                  paddingRight: '40px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '14px',
                  color: '#FFFFFF',
                  appearance: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '180px',
                }}
              >
                <option value="all" style={{ backgroundColor: '#12121A' }}>Todas Plataformas</option>
                {platforms.map((platform) => (
                  <option key={platform} value={platform} style={{ backgroundColor: '#12121A' }}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6B6B7B', pointerEvents: 'none' }} />
            </div>

            {/* Filtro por Status */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as CampaignStatus | 'all')}
                style={{
                  height: '44px',
                  paddingLeft: '16px',
                  paddingRight: '40px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '14px',
                  color: '#FFFFFF',
                  appearance: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '160px',
                }}
              >
                <option value="all" style={{ backgroundColor: '#12121A' }}>Todos Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status} style={{ backgroundColor: '#12121A' }}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
              <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6B6B7B', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Modo de Visualizacao */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: viewMode === 'grid' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: viewMode === 'grid' ? '#3B82F6' : '#6B6B7B',
                }}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: viewMode === 'list' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: viewMode === 'list' ? '#3B82F6' : '#6B6B7B',
                }}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
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
            label="ROAS Medio"
            value={`${(campaigns.reduce((acc, c) => acc + c.metrics.roas, 0) / campaigns.length).toFixed(2)}x`}
            icon={TrendingUp}
            color="yellow"
            delay={0.3}
          />
        </div>

        {/* Campaigns Grid/List */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Lista de Campanhas */}
          <div>
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}
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
                  style={{ maxHeight: '600px', overflowY: 'auto' }}
                >
                  <CampaignTable campaigns={filteredCampaigns} onAiAnalysis={handleAiAnalysis} isAnalyzing={isAnalyzing} />
                </motion.div>
              )}
            </AnimatePresence>

            {filteredCampaigns.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ color: '#6B6B7B', fontSize: '14px' }}>Nenhuma campanha encontrada</p>
              </div>
            )}
          </div>

          {/* Quadro de Analise da IA */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                position: 'sticky',
                top: '96px',
                padding: '20px',
                borderRadius: '16px',
                background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))' }}>
                  <Bot style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '14px', margin: 0 }}>Analise da IA</h3>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Insights inteligentes sobre suas campanhas</p>
                </div>
              </div>

              {aiAnalysis ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={12} />
                        Analise Gerada
                      </span>
                      <button
                        onClick={() => setAiAnalysis(null)}
                        style={{ padding: '4px', borderRadius: '4px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p style={{ fontSize: '14px', color: '#A0A0B0', lineHeight: '1.6', margin: 0 }}>
                      {aiAnalysis.analysis}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#34D399', marginBottom: '4px', margin: 0 }}>Recomendacao</p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Escalar</p>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.2)', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#FACC15', marginBottom: '4px', margin: 0 }}>Prioridade</p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Alta</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', borderRadius: '9999px', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles style={{ width: '32px', height: '32px', color: '#6B6B7B' }} />
                  </div>
                  <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '8px', margin: 0 }}>Nenhuma analise selecionada</p>
                  <p style={{ fontSize: '12px', color: '#4B4B5B', margin: 0 }}>
                    Clique no icone <span style={{ color: '#FACC15' }}>sparkles</span> em uma campanha para solicitar analise da IA
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
      style={{
        position: 'relative',
        padding: '20px',
        borderRadius: '16px',
        backgroundColor: 'rgba(18, 18, 26, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        cursor: 'pointer',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <PlatformIcon platform={campaign.platform} size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => onAiAnalysis(campaign.id, campaign.name)}
                style={{ fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', opacity: isAnalyzing ? 0.5 : 1 }}
                title="Solicitar analise da IA"
              >
                sparkles
              </button>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                {campaign.name}
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: '#6B6B7B', textTransform: 'capitalize', margin: 0 }}>{campaign.objective}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant={statusColors[campaign.status]}>{statusLabels[campaign.status]}</Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Investido', value: formatCurrency(campaign.spent) },
          { label: 'Conversoes', value: formatCompactNumber(campaign.metrics.conversions) },
          { label: 'CTR', value: `${campaign.metrics.ctr.toFixed(2)}%` },
          { label: 'ROAS', value: `${campaign.metrics.roas.toFixed(2)}x`, highlight: campaign.metrics.roas >= 3 },
        ].map((metric) => (
          <div key={metric.label} style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#6B6B7B', marginBottom: '4px', margin: 0 }}>{metric.label}</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: metric.highlight ? '#3B82F6' : '#FFFFFF', margin: 0 }}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Budget Progress */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
          <span style={{ color: '#6B6B7B' }}>Budget</span>
          <span style={{ color: '#FFFFFF' }}>{formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</span>
        </div>
        <div style={{ height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
            transition={{ duration: 1, delay: index * 0.05 }}
            style={{ height: '100%', borderRadius: '9999px', background: 'linear-gradient(to right, #3B82F6, #FACC15)' }}
          />
        </div>
      </div>

      {/* Dates */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '12px', color: '#6B6B7B' }}>
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
    <div style={{ borderRadius: '16px', background: 'linear-gradient(to bottom right, #12121A, #0D0D14)', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)' }}>
      {/* Table Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ height: '32px', width: '4px', borderRadius: '9999px', background: 'linear-gradient(to bottom, #3B82F6, #60A5FA)' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Lista de Campanhas</h3>
            <span style={{ padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', fontSize: '12px', fontWeight: 500 }}>
              {campaigns.length} campanhas
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
              <th style={{ textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#A0A0B0', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px 24px' }}>Campanha</th>
              <th style={{ textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#A0A0B0', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px' }}>Status</th>
              <th style={{ textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#A0A0B0', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px' }}>Investido</th>
              <th style={{ textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#A0A0B0', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px' }}>CTR</th>
              <th style={{ textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#A0A0B0', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px' }}>Conversoes</th>
              <th style={{ textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#A0A0B0', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px' }}>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign, index) => (
              <motion.tr
                key={campaign.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
              >
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <PlatformIcon platform={campaign.platform} size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', margin: 0 }}>{campaign.name}</p>
                      <p style={{ fontSize: '12px', color: '#6B6B7B', textTransform: 'capitalize', margin: 0 }}>{campaign.objective}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <Badge variant={statusColors[campaign.status]}>{statusLabels[campaign.status]}</Badge>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>{formatCurrency(campaign.spent)}</span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{campaign.metrics.ctr.toFixed(2)}%</span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>{formatCompactNumber(campaign.metrics.conversions)}</span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    backgroundColor: campaign.metrics.roas >= 3 ? 'rgba(59, 130, 246, 0.1)' : campaign.metrics.roas >= 2 ? 'rgba(250, 204, 21, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: campaign.metrics.roas >= 3 ? '#3B82F6' : campaign.metrics.roas >= 2 ? '#FACC15' : '#EF4444',
                  }}>
                    {campaign.metrics.roas.toFixed(2)}x
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
