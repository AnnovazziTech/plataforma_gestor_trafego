'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout'
import { MetricCard } from '@/components/ui'
import {
  PerformanceChart,
  PlatformDistribution,
  ConversionFunnel,
  CampaignPerformance,
} from '@/components/charts'
import { TopCampaigns, RecentActivity } from '@/components/dashboard'
import { useApp } from '@/contexts'
import { Campaign } from '@/types'
import {
  DollarSign,
  Eye,
  MousePointer,
  ShoppingCart,
  TrendingUp,
  Target,
  Loader2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardData {
  metrics: {
    totalSpent: number
    totalBudget: number
    totalImpressions: number
    totalClicks: number
    totalConversions: number
    totalRevenue: number
    avgCtr: number
    avgCpc: number
    avgRoas: number
    activeCampaigns: number
  }
  previousPeriod: {
    totalSpent: number
    totalImpressions: number
    totalClicks: number
    totalConversions: number
    totalRevenue: number
  }
  platformMetrics: Array<{
    platform: string
    spent: number
    impressions: number
    clicks: number
    conversions: number
    roas: number
    campaigns: number
  }>
  timeSeriesData: Array<{
    date: string
    impressions: number
    clicks: number
    conversions: number
    spent: number
    revenue: number
  }>
  conversionFunnel: Array<{
    stage: string
    value: number
    percentage: number
  }>
  campaignPerformance: Array<{
    name: string
    spent: number
    conversions: number
    roas: number
    ctr: number
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const { campaigns, fetchCampaigns, showToast } = useApp()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleTeamsClick = () => {
    showToast('Funcionalidade de Equipes em desenvolvimento', 'info')
    // Future: router.push('/teams') or open modal
  }

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    await Promise.all([fetchDashboard(), fetchCampaigns()])
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header
          title="Dashboard"
          subtitle="Visao geral da performance de todas as suas campanhas"
          buttonType="connect"
          createButtonText="Conectar Contas"
          onRefresh={handleRefresh}
          showTeamsButton={true}
          onTeamsClick={handleTeamsClick}
        />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={48} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#6B6B7B', marginTop: '16px' }}>Carregando dados...</p>
          </div>
        </main>
      </div>
    )
  }

  const metrics = dashboardData?.metrics || {
    totalSpent: 0,
    totalBudget: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0,
    avgCtr: 0,
    avgCpc: 0,
    avgRoas: 0,
    activeCampaigns: 0,
  }

  const previousPeriod = dashboardData?.previousPeriod || {
    totalSpent: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        title="Dashboard"
        subtitle="Visao geral da performance de todas as suas campanhas"
        buttonType="connect"
        createButtonText="Conectar Contas"
        onRefresh={handleRefresh}
        showTeamsButton={true}
        onTeamsClick={handleTeamsClick}
      />

      <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>
        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <MetricCard
            title="Total Investido"
            value={metrics.totalSpent}
            previousValue={previousPeriod.totalSpent}
            format="currency"
            icon={<DollarSign size={20} />}
            color="blue"
            delay={0}
          />
          <MetricCard
            title="Impressoes"
            value={metrics.totalImpressions}
            previousValue={previousPeriod.totalImpressions}
            format="compact"
            icon={<Eye size={20} />}
            color="yellow"
            delay={0.1}
          />
          <MetricCard
            title="Cliques"
            value={metrics.totalClicks}
            previousValue={previousPeriod.totalClicks}
            format="compact"
            icon={<MousePointer size={20} />}
            color="blue"
            delay={0.2}
          />
          <MetricCard
            title="Conversoes"
            value={metrics.totalConversions}
            previousValue={previousPeriod.totalConversions}
            format="number"
            icon={<ShoppingCart size={20} />}
            color="yellow"
            delay={0.3}
          />
          <MetricCard
            title="Receita Total"
            value={metrics.totalRevenue}
            previousValue={previousPeriod.totalRevenue}
            format="currency"
            icon={<TrendingUp size={20} />}
            color="blue"
            delay={0.4}
          />
          <MetricCard
            title="ROAS Medio"
            value={metrics.avgRoas}
            format="number"
            icon={<Target size={20} />}
            color="yellow"
            delay={0.5}
          />
        </div>

        {/* Charts Row 1 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div>
            <PerformanceChart data={dashboardData?.timeSeriesData || []} />
          </div>
          <div>
            <PlatformDistribution data={dashboardData?.platformMetrics || []} />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <ConversionFunnel data={dashboardData?.conversionFunnel || []} />
          <CampaignPerformance data={dashboardData?.campaignPerformance || []} />
        </div>

        {/* Bottom Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
          }}
        >
          <TopCampaigns campaigns={campaigns as Campaign[]} />
          <RecentActivity />
        </div>
      </main>
    </div>
  )
}
