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
    <div className="flex flex-col min-h-screen">
      <Header
        title="Dashboard"
        subtitle="Visao geral da performance de todas as suas campanhas"
      />

      <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <MetricCard
            title="Total Investido"
            value={dashboardMetrics.totalSpent}
            previousValue={dashboardMetrics.previousPeriod.totalSpent}
            format="currency"
            icon={<DollarSign size={16} />}
            color="cyan"
            delay={0}
          />
          <MetricCard
            title="Impressoes"
            value={dashboardMetrics.totalImpressions}
            previousValue={dashboardMetrics.previousPeriod.totalImpressions}
            format="compact"
            icon={<Eye size={16} />}
            color="purple"
            delay={0.1}
          />
          <MetricCard
            title="Cliques"
            value={dashboardMetrics.totalClicks}
            previousValue={dashboardMetrics.previousPeriod.totalClicks}
            format="compact"
            icon={<MousePointer size={16} />}
            color="pink"
            delay={0.2}
          />
          <MetricCard
            title="Conversoes"
            value={dashboardMetrics.totalConversions}
            previousValue={dashboardMetrics.previousPeriod.totalConversions}
            format="number"
            icon={<ShoppingCart size={16} />}
            color="green"
            delay={0.3}
          />
          <MetricCard
            title="Receita"
            value={dashboardMetrics.totalRevenue}
            previousValue={dashboardMetrics.previousPeriod.totalRevenue}
            format="currency"
            icon={<TrendingUp size={16} />}
            color="orange"
            delay={0.4}
          />
          <MetricCard
            title="ROAS Medio"
            value={dashboardMetrics.avgRoas}
            format="number"
            icon={<Target size={16} />}
            color="blue"
            delay={0.5}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <div className="lg:col-span-1">
            <PlatformDistribution />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ConversionFunnel />
          <CampaignPerformance />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopCampaigns />
          <RecentActivity />
        </div>
      </main>
    </div>
  )
}
