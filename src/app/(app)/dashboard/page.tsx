'use client'

import { Header } from '@/components/layout'
import { MetricCard } from '@/components/ui'
import {
  PerformanceChart,
  PlatformDistribution,
  ConversionFunnel,
  CampaignPerformance,
} from '@/components/charts'
import { TopCampaigns, RecentActivity } from '@/components/dashboard'
import { dashboardMetrics } from '@/data/mock-data'
import {
  DollarSign,
  Eye,
  MousePointer,
  ShoppingCart,
  TrendingUp,
  Target,
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        title="Dashboard"
        subtitle="Visao geral da performance de todas as suas campanhas"
        buttonType="connect"
        createButtonText="Conectar Contas"
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
            value={dashboardMetrics.totalSpent}
            previousValue={dashboardMetrics.previousPeriod.totalSpent}
            format="currency"
            icon={<DollarSign size={20} />}
            color="blue"
            delay={0}
          />
          <MetricCard
            title="Impressoes"
            value={dashboardMetrics.totalImpressions}
            previousValue={dashboardMetrics.previousPeriod.totalImpressions}
            format="compact"
            icon={<Eye size={20} />}
            color="yellow"
            delay={0.1}
          />
          <MetricCard
            title="Cliques"
            value={dashboardMetrics.totalClicks}
            previousValue={dashboardMetrics.previousPeriod.totalClicks}
            format="compact"
            icon={<MousePointer size={20} />}
            color="blue"
            delay={0.2}
          />
          <MetricCard
            title="Conversoes"
            value={dashboardMetrics.totalConversions}
            previousValue={dashboardMetrics.previousPeriod.totalConversions}
            format="number"
            icon={<ShoppingCart size={20} />}
            color="yellow"
            delay={0.3}
          />
          <MetricCard
            title="Receita Total"
            value={dashboardMetrics.totalRevenue}
            previousValue={dashboardMetrics.previousPeriod.totalRevenue}
            format="currency"
            icon={<TrendingUp size={20} />}
            color="blue"
            delay={0.4}
          />
          <MetricCard
            title="ROAS Medio"
            value={dashboardMetrics.avgRoas}
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
            <PerformanceChart />
          </div>
          <div>
            <PlatformDistribution />
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
          <ConversionFunnel />
          <CampaignPerformance />
        </div>

        {/* Bottom Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
          }}
        >
          <TopCampaigns />
          <RecentActivity />
        </div>
      </main>
    </div>
  )
}
