'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Card, CardContent, Button, Badge, PlatformIcon, StatCard } from '@/components/ui'
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
  BarChart3,
  Settings,
  Check,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts'

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

// Todas as métricas disponíveis do Meta Ads
const allMetrics = [
  { key: 'impressions', label: 'Impressões', category: 'Alcance' },
  { key: 'reach', label: 'Alcance', category: 'Alcance' },
  { key: 'frequency', label: 'Frequência', category: 'Alcance' },
  { key: 'clicks', label: 'Cliques', category: 'Engajamento' },
  { key: 'ctr', label: 'CTR (%)', category: 'Engajamento' },
  { key: 'engagement', label: 'Engajamento', category: 'Engajamento' },
  { key: 'videoViews', label: 'Visualizações de Vídeo', category: 'Vídeo' },
  { key: 'videoCompletionRate', label: 'Taxa de Conclusão (%)', category: 'Vídeo' },
  { key: 'conversions', label: 'Conversões', category: 'Conversão' },
  { key: 'conversionRate', label: 'Taxa de Conversão (%)', category: 'Conversão' },
  { key: 'costPerConversion', label: 'Custo por Conversão', category: 'Conversão' },
  { key: 'spent', label: 'Valor Gasto', category: 'Custo' },
  { key: 'cpc', label: 'CPC', category: 'Custo' },
  { key: 'cpm', label: 'CPM', category: 'Custo' },
  { key: 'roas', label: 'ROAS', category: 'Retorno' },
]

// Mock de dados históricos de 4 semanas para campanhas
const generateWeeklyData = (campaign: Campaign) => {
  const baseMetrics = campaign.metrics
  return [
    {
      week: 'Semana 1',
      impressions: Math.round(baseMetrics.impressions * 0.75),
      clicks: Math.round(baseMetrics.clicks * 0.72),
      conversions: Math.round(baseMetrics.conversions * 0.68),
      spent: baseMetrics.cpc * baseMetrics.clicks * 0.70,
      ctr: baseMetrics.ctr * 0.92,
      cpc: baseMetrics.cpc * 1.08,
      roas: baseMetrics.roas * 0.85,
      reach: Math.round(baseMetrics.reach * 0.73),
    },
    {
      week: 'Semana 2',
      impressions: Math.round(baseMetrics.impressions * 0.85),
      clicks: Math.round(baseMetrics.clicks * 0.82),
      conversions: Math.round(baseMetrics.conversions * 0.80),
      spent: baseMetrics.cpc * baseMetrics.clicks * 0.80,
      ctr: baseMetrics.ctr * 0.96,
      cpc: baseMetrics.cpc * 1.02,
      roas: baseMetrics.roas * 0.92,
      reach: Math.round(baseMetrics.reach * 0.83),
    },
    {
      week: 'Semana 3',
      impressions: Math.round(baseMetrics.impressions * 0.92),
      clicks: Math.round(baseMetrics.clicks * 0.90),
      conversions: Math.round(baseMetrics.conversions * 0.88),
      spent: baseMetrics.cpc * baseMetrics.clicks * 0.88,
      ctr: baseMetrics.ctr * 0.98,
      cpc: baseMetrics.cpc * 1.00,
      roas: baseMetrics.roas * 0.96,
      reach: Math.round(baseMetrics.reach * 0.90),
    },
    {
      week: 'Semana 4 (Atual)',
      impressions: baseMetrics.impressions,
      clicks: baseMetrics.clicks,
      conversions: baseMetrics.conversions,
      spent: baseMetrics.cpc * baseMetrics.clicks,
      ctr: baseMetrics.ctr,
      cpc: baseMetrics.cpc,
      roas: baseMetrics.roas,
      reach: baseMetrics.reach,
    },
  ]
}

export default function CampaignsPage() {
  const {
    connectedAccounts,
    selectedAccount,
    setSelectedAccount,
    showToast,
    campaigns,
    deleteCampaign,
    toggleCampaignStatus,
    updateCampaign,
    addCampaign,
  } = useApp()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<CampaignStatus | 'all'>('all')
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<{ campaignId: string; analysis: string } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null)

  // Estado para métricas visíveis
  const [showMetricsModal, setShowMetricsModal] = useState(false)
  const [visibleMetrics, setVisibleMetrics] = useState<string[]>(['impressions', 'clicks', 'conversions', 'spent', 'ctr', 'roas'])

  // Estado para comparação de campanhas
  const [campaignForComparison, setCampaignForComparison] = useState<Campaign | null>(null)
  const [weeklyData, setWeeklyData] = useState<any[]>([])

  // Estado para modal de edição
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPlatform = selectedPlatform === 'all' || campaign.platform === selectedPlatform
      const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus
      // Filtro por conta conectada
      const matchesAccount = selectedAccount === 'all' ||
        connectedAccounts.find(a => a.id === selectedAccount)?.platform === campaign.platform
      return matchesSearch && matchesPlatform && matchesStatus && matchesAccount
    })
  }, [campaigns, searchTerm, selectedPlatform, selectedStatus, selectedAccount, connectedAccounts])

  const platforms: Platform[] = ['meta', 'google', 'tiktok', 'linkedin', 'twitter']
  const statuses: CampaignStatus[] = ['active', 'paused', 'ended', 'draft', 'error']

  const handleAiAnalysis = (campaignId: string, campaignName: string) => {
    setIsAnalyzing(campaignId)

    // Encontrar a campanha e gerar dados de comparação
    const campaign = campaigns.find(c => c.id === campaignId)
    if (campaign) {
      setCampaignForComparison(campaign as Campaign)
      setWeeklyData(generateWeeklyData(campaign as Campaign))
    }

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

  const toggleMetric = (metricKey: string) => {
    setVisibleMetrics(prev =>
      prev.includes(metricKey)
        ? prev.filter(m => m !== metricKey)
        : [...prev, metricKey]
    )
  }

  const getMetricValue = (campaign: Campaign, metricKey: string): string | number => {
    const metrics = campaign.metrics as any
    switch(metricKey) {
      case 'spent':
        return formatCurrency(campaign.spent)
      case 'impressions':
      case 'reach':
      case 'clicks':
      case 'conversions':
      case 'engagement':
      case 'videoViews':
        return formatCompactNumber(metrics[metricKey] || 0)
      case 'ctr':
      case 'conversionRate':
      case 'videoCompletionRate':
        return `${(metrics[metricKey] || 0).toFixed(2)}%`
      case 'cpc':
      case 'cpm':
      case 'costPerConversion':
        return formatCurrency(metrics[metricKey] || 0)
      case 'roas':
        return `${(metrics[metricKey] || 0).toFixed(2)}x`
      case 'frequency':
        return (metrics[metricKey] || 0).toFixed(2)
      default:
        return metrics[metricKey] || 0
    }
  }

  const calculateChange = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: 0, isPositive: true }
    const change = ((current - previous) / previous) * 100
    return { value: Math.abs(change), isPositive: change >= 0 }
  }

  // Handlers para ações de campanha
  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setOpenMenuId(null)
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    await deleteCampaign(campaignId)
    setShowDeleteConfirm(null)
    setOpenMenuId(null)
  }

  const handleToggleStatus = async (campaignId: string) => {
    await toggleCampaignStatus(campaignId)
    setOpenMenuId(null)
  }

  const handleDuplicateCampaign = async (campaign: Campaign) => {
    const duplicatedData = {
      name: `${campaign.name} (Cópia)`,
      platform: campaign.platform.toUpperCase(),
      objective: campaign.objective.toUpperCase(),
      budget: campaign.budget,
      budgetType: 'DAILY',
    }
    await addCampaign(duplicatedData)
    setOpenMenuId(null)
  }

  const handleSaveEdit = async (updatedCampaign: Campaign) => {
    await updateCampaign(updatedCampaign.id, {
      name: updatedCampaign.name,
      budget: updatedCampaign.budget,
      status: updatedCampaign.status.toUpperCase(),
    })
    setEditingCampaign(null)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        title="Campanhas"
        subtitle="Gerencie todas as suas campanhas de trafego pago"
      />

      <main style={{ padding: '24px 32px', paddingBottom: '80px' }}>
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

          {/* Modo de Visualizacao e Métricas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Botão de Métricas */}
            <button
              onClick={() => setShowMetricsModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '44px',
                padding: '0 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#3B82F6',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <BarChart3 size={18} />
              Métricas
            </button>

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
                      campaign={campaign as Campaign}
                      index={index}
                      onAiAnalysis={handleAiAnalysis}
                      isAnalyzing={isAnalyzing === campaign.id}
                      visibleMetrics={visibleMetrics}
                      getMetricValue={getMetricValue}
                      onEdit={handleEditCampaign}
                      onDelete={(id) => setShowDeleteConfirm(id)}
                      onToggleStatus={handleToggleStatus}
                      onDuplicate={handleDuplicateCampaign}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
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
                  <CampaignTable
                    campaigns={filteredCampaigns as Campaign[]}
                    onAiAnalysis={handleAiAnalysis}
                    isAnalyzing={isAnalyzing}
                    visibleMetrics={visibleMetrics}
                    onEdit={handleEditCampaign}
                    onDelete={(id) => setShowDeleteConfirm(id)}
                    onToggleStatus={handleToggleStatus}
                    onDuplicate={handleDuplicateCampaign}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                  />
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
                <div style={{ padding: '10px', borderRadius: '12px', background: 'linear-gradient(to bottom right, rgba(250, 204, 21, 0.2), rgba(234, 179, 8, 0.2))' }}>
                  <Bot style={{ width: '20px', height: '20px', color: '#FACC15' }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '14px', margin: 0 }}>Devan</h3>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Seu assistente de IA para campanhas</p>
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
                        onClick={() => {
                          setAiAnalysis(null)
                          setCampaignForComparison(null)
                          setWeeklyData([])
                        }}
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
                    Clique no icone <span style={{ color: '#FACC15' }}>✨</span> em uma campanha para solicitar analise da IA
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Comparação de Campanhas - Últimas 4 Semanas */}
        <AnimatePresence>
          {campaignForComparison && weeklyData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ marginTop: '32px' }}
            >
              <div
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                      <BarChart3 size={24} style={{ color: '#3B82F6' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                        Comparação das Últimas 4 Semanas
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6B6B7B', margin: '4px 0 0' }}>
                        {campaignForComparison.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCampaignForComparison(null)
                      setWeeklyData([])
                    }}
                    style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Métricas Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { key: 'impressions', label: 'Impressões', format: (v: number) => formatCompactNumber(v) },
                    { key: 'clicks', label: 'Cliques', format: (v: number) => formatCompactNumber(v) },
                    { key: 'conversions', label: 'Conversões', format: (v: number) => v.toString() },
                    { key: 'roas', label: 'ROAS', format: (v: number) => `${v.toFixed(2)}x` },
                  ].map((metric) => {
                    const currentValue = weeklyData[3][metric.key]
                    const previousValue = weeklyData[2][metric.key]
                    const change = calculateChange(currentValue, previousValue)

                    return (
                      <div
                        key={metric.key}
                        style={{
                          padding: '20px',
                          borderRadius: '16px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <p style={{ fontSize: '12px', color: '#6B6B7B', marginBottom: '8px' }}>{metric.label}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                            {metric.format(currentValue)}
                          </p>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              borderRadius: '8px',
                              backgroundColor: change.isPositive ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: change.isPositive ? '#34D399' : '#EF4444',
                              fontSize: '12px',
                              fontWeight: 500,
                            }}
                          >
                            {change.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {change.value.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Gráficos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                  {/* Gráfico de Performance */}
                  <div
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                      Evolução de Impressões e Cliques
                    </h4>
                    <div style={{ height: '240px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="week" stroke="#6B6B7B" fontSize={11} />
                          <YAxis stroke="#6B6B7B" fontSize={11} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            labelStyle={{ color: '#fff' }}
                            formatter={(value: number, name: string) => [
                              formatCompactNumber(value),
                              name === 'impressions' ? 'Impressões' : 'Cliques'
                            ]}
                          />
                          <Legend />
                          <Bar dataKey="impressions" name="Impressões" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="clicks" name="Cliques" fill="#FACC15" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Gráfico de ROAS e CTR */}
                  <div
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                      Evolução de ROAS e CTR
                    </h4>
                    <div style={{ height: '240px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="week" stroke="#6B6B7B" fontSize={11} />
                          <YAxis yAxisId="left" stroke="#6B6B7B" fontSize={11} />
                          <YAxis yAxisId="right" orientation="right" stroke="#6B6B7B" fontSize={11} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            labelStyle={{ color: '#fff' }}
                            formatter={(value: number, name: string) => [
                              name === 'roas' ? `${value.toFixed(2)}x` : `${value.toFixed(2)}%`,
                              name === 'roas' ? 'ROAS' : 'CTR'
                            ]}
                          />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="roas" name="ROAS" stroke="#34D399" strokeWidth={2} dot={{ fill: '#34D399' }} />
                          <Line yAxisId="right" type="monotone" dataKey="ctr" name="CTR" stroke="#A855F7" strokeWidth={2} dot={{ fill: '#A855F7' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Tabela de Dados Semanais */}
                <div style={{ marginTop: '24px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#A0A0B0' }}>Período</th>
                        <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#A0A0B0' }}>Impressões</th>
                        <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#A0A0B0' }}>Cliques</th>
                        <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#A0A0B0' }}>CTR</th>
                        <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#A0A0B0' }}>Conversões</th>
                        <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#A0A0B0' }}>CPC</th>
                        <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#A0A0B0' }}>ROAS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyData.map((week, idx) => (
                        <tr key={week.week} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: idx === 3 ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                          <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: idx === 3 ? 600 : 400, color: idx === 3 ? '#3B82F6' : '#FFFFFF' }}>{week.week}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#A0A0B0', textAlign: 'right' }}>{formatCompactNumber(week.impressions)}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#A0A0B0', textAlign: 'right' }}>{formatCompactNumber(week.clicks)}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#A0A0B0', textAlign: 'right' }}>{week.ctr.toFixed(2)}%</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#A0A0B0', textAlign: 'right' }}>{week.conversions}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#A0A0B0', textAlign: 'right' }}>{formatCurrency(week.cpc)}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: week.roas >= 3 ? '#34D399' : week.roas >= 2 ? '#FACC15' : '#EF4444', textAlign: 'right' }}>{week.roas.toFixed(2)}x</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal de Seleção de Métricas */}
      <AnimatePresence>
        {showMetricsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMetricsModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '600px',
                maxHeight: '80vh',
                background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <BarChart3 size={20} style={{ color: '#3B82F6' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Selecionar Métricas</h2>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Escolha as métricas que deseja visualizar</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMetricsModal(false)}
                  style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                {['Alcance', 'Engajamento', 'Vídeo', 'Conversão', 'Custo', 'Retorno'].map((category) => (
                  <div key={category} style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>{category}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {allMetrics.filter(m => m.category === category).map((metric) => (
                        <button
                          key={metric.key}
                          onClick={() => toggleMetric(metric.key)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            backgroundColor: visibleMetrics.includes(metric.key) ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${visibleMetrics.includes(metric.key) ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                            color: visibleMetrics.includes(metric.key) ? '#3B82F6' : '#A0A0B0',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <span>{metric.label}</span>
                          {visibleMetrics.includes(metric.key) ? (
                            <Eye size={16} />
                          ) : (
                            <EyeOff size={16} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#6B6B7B' }}>
                  {visibleMetrics.length} métricas selecionadas
                </span>
                <Button variant="primary" onClick={() => setShowMetricsModal(false)}>
                  Aplicar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '400px',
                background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <Trash2 size={24} style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Excluir Campanha</h2>
                  <p style={{ fontSize: '14px', color: '#6B6B7B', margin: '4px 0 0' }}>Esta acao nao pode ser desfeita</p>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#A0A0B0', marginBottom: '24px', lineHeight: '1.6' }}>
                Tem certeza que deseja excluir esta campanha? Todos os dados relacionados serao perdidos permanentemente.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancelar
                </Button>
                <button
                  onClick={() => handleDeleteCampaign(showDeleteConfirm)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backgroundColor: '#EF4444',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Edição de Campanha */}
      <AnimatePresence>
        {editingCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingCampaign(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '500px',
                maxHeight: '80vh',
                background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <Edit size={20} style={{ color: '#3B82F6' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Editar Campanha</h2>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Atualize os dados da campanha</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingCampaign(null)}
                  style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Nome da Campanha</label>
                  <input
                    type="text"
                    value={editingCampaign.name}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Orcamento Diario</label>
                  <input
                    type="number"
                    value={editingCampaign.budget}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, budget: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Status</label>
                  <select
                    value={editingCampaign.status}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, status: e.target.value as CampaignStatus })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status} style={{ backgroundColor: '#12121A' }}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Plataforma</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <PlatformIcon platform={editingCampaign.platform} size={18} />
                      <span style={{ color: '#A0A0B0', fontSize: '14px', textTransform: 'capitalize' }}>{editingCampaign.platform}</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Objetivo</label>
                    <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <span style={{ color: '#A0A0B0', fontSize: '14px', textTransform: 'capitalize' }}>{editingCampaign.objective}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                <Button variant="secondary" onClick={() => setEditingCampaign(null)}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={() => handleSaveEdit(editingCampaign)}>
                  Salvar Alteracoes
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CampaignCard({
  campaign,
  index,
  onAiAnalysis,
  isAnalyzing,
  visibleMetrics,
  getMetricValue,
  onEdit,
  onDelete,
  onToggleStatus,
  onDuplicate,
  openMenuId,
  setOpenMenuId,
}: {
  campaign: Campaign
  index: number
  onAiAnalysis: (id: string, name: string) => void
  isAnalyzing: boolean
  visibleMetrics: string[]
  getMetricValue: (campaign: Campaign, metricKey: string) => string | number
  onEdit: (campaign: Campaign) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
  onDuplicate: (campaign: Campaign) => void
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
}) {
  const isMenuOpen = openMenuId === campaign.id

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
                style={{
                  padding: '4px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(250, 204, 21, 0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: isAnalyzing ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Perguntar ao Devan"
              >
                <Bot size={14} style={{ color: '#FACC15' }} />
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
          {/* Menu Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setOpenMenuId(isMenuOpen ? null : campaign.id)
              }}
              style={{
                padding: '6px',
                borderRadius: '8px',
                backgroundColor: isMenuOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#6B6B7B',
              }}
            >
              <MoreVertical size={16} />
            </button>
            {isMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  padding: '8px',
                  borderRadius: '12px',
                  backgroundColor: '#1A1A25',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                  zIndex: 100,
                  minWidth: '160px',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(campaign)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Edit size={16} style={{ color: '#3B82F6' }} />
                  Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleStatus(campaign.id)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {campaign.status === 'active' ? (
                    <>
                      <Pause size={16} style={{ color: '#FACC15' }} />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play size={16} style={{ color: '#34D399' }} />
                      Ativar
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate(campaign)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Copy size={16} style={{ color: '#A855F7' }} />
                  Duplicar
                </button>
                <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '8px 0' }} />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(campaign.id)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#EF4444',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {visibleMetrics.slice(0, 4).map((metricKey) => {
          const metric = allMetrics.find(m => m.key === metricKey)
          return (
            <div key={metricKey} style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#6B6B7B', marginBottom: '4px', margin: 0 }}>{metric?.label || metricKey}</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: metricKey === 'roas' && campaign.metrics.roas >= 3 ? '#3B82F6' : '#FFFFFF', margin: 0 }}>
                {getMetricValue(campaign, metricKey)}
              </p>
            </div>
          )
        })}
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

function CampaignTable({
  campaigns,
  onAiAnalysis,
  isAnalyzing,
  visibleMetrics,
  onEdit,
  onDelete,
  onToggleStatus,
  onDuplicate,
  openMenuId,
  setOpenMenuId,
}: {
  campaigns: Campaign[]
  onAiAnalysis: (id: string, name: string) => void
  isAnalyzing: string | null
  visibleMetrics: string[]
  onEdit: (campaign: Campaign) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
  onDuplicate: (campaign: Campaign) => void
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
}) {
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
              {visibleMetrics.slice(0, 4).map((metricKey) => {
                const metric = allMetrics.find(m => m.key === metricKey)
                return (
                  <th key={metricKey} style={{ textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#A0A0B0', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px' }}>
                    {metric?.label || metricKey}
                  </th>
                )
              })}
              <th style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#A0A0B0', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px' }}>Devan</th>
              <th style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#A0A0B0', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px' }}>Acoes</th>
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
                {visibleMetrics.slice(0, 4).map((metricKey) => {
                  const metrics = campaign.metrics as any
                  let value: string
                  let highlight = false

                  switch(metricKey) {
                    case 'spent':
                      value = formatCurrency(campaign.spent)
                      break
                    case 'ctr':
                    case 'conversionRate':
                    case 'videoCompletionRate':
                      value = `${(metrics[metricKey] || 0).toFixed(2)}%`
                      break
                    case 'cpc':
                    case 'cpm':
                    case 'costPerConversion':
                      value = formatCurrency(metrics[metricKey] || 0)
                      break
                    case 'roas':
                      value = `${(metrics[metricKey] || 0).toFixed(2)}x`
                      highlight = metrics[metricKey] >= 3
                      break
                    case 'frequency':
                      value = (metrics[metricKey] || 0).toFixed(2)
                      break
                    default:
                      value = formatCompactNumber(metrics[metricKey] || 0)
                  }

                  return (
                    <td key={metricKey} style={{ padding: '16px', textAlign: 'right' }}>
                      <span style={{
                        display: metricKey === 'roas' ? 'inline-flex' : undefined,
                        alignItems: 'center',
                        gap: '4px',
                        padding: metricKey === 'roas' ? '4px 8px' : undefined,
                        borderRadius: metricKey === 'roas' ? '8px' : undefined,
                        fontSize: '14px',
                        fontWeight: metricKey === 'roas' ? 600 : 500,
                        backgroundColor: metricKey === 'roas' ? (highlight ? 'rgba(59, 130, 246, 0.1)' : metrics.roas >= 2 ? 'rgba(250, 204, 21, 0.1)' : 'rgba(239, 68, 68, 0.1)') : undefined,
                        color: metricKey === 'roas' ? (highlight ? '#3B82F6' : metrics.roas >= 2 ? '#FACC15' : '#EF4444') : '#FFFFFF',
                      }}>
                        {value}
                      </span>
                    </td>
                  )
                })}
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <button
                    onClick={() => onAiAnalysis(campaign.id, campaign.name)}
                    disabled={isAnalyzing === campaign.id}
                    title="Perguntar ao Devan"
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(250, 204, 21, 0.1)',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: isAnalyzing === campaign.id ? 0.5 : 1,
                    }}
                  >
                    <Bot size={16} style={{ color: '#FACC15' }} />
                  </button>
                </td>
                {/* Coluna de Ações */}
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)
                      }}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: openMenuId === campaign.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6B6B7B',
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === campaign.id && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '4px',
                          padding: '8px',
                          borderRadius: '12px',
                          backgroundColor: '#1A1A25',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                          zIndex: 100,
                          minWidth: '160px',
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(campaign)
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Edit size={16} style={{ color: '#3B82F6' }} />
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleStatus(campaign.id)
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {campaign.status === 'active' ? (
                            <>
                              <Pause size={16} style={{ color: '#FACC15' }} />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play size={16} style={{ color: '#34D399' }} />
                              Ativar
                            </>
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDuplicate(campaign)
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Copy size={16} style={{ color: '#A855F7' }} />
                          Duplicar
                        </button>
                        <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '8px 0' }} />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(campaign.id)
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#EF4444',
                            fontSize: '14px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Trash2 size={16} />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
