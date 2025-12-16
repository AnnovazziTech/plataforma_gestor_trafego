'use client'

import { useState, useEffect, ReactNode, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, PlatformIcon, MetricCard } from '@/components/ui'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { getDateRangeParams } from '@/lib/utils/date-range'
import {
  Users,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  Target,
  Eye,
  MousePointer,
  Loader2,
  Calendar,
  ChevronDown,
  BarChart3,
} from 'lucide-react'
import { useApp } from '@/contexts'

const COLORS = ['#3B82F6', '#60A5FA', '#FACC15', '#FDE047', '#1D4ED8', '#EAB308']

interface AnalyticsData {
  timeSeriesData: Array<{
    date: string
    impressions: number
    clicks: number
    conversions: number
    spent: number
    reach: number
  }>
  platformMetrics: Array<{
    platform: string
    campaigns: number
    spent: number
    impressions: number
    clicks: number
    conversions: number
    ctr: number
    cpc: number
    roas: number
  }>
  totals: {
    impressions: number
    clicks: number
    conversions: number
    spent: number
    reach: number
    ctr: number
    cpc: number
    cpm: number
    roas: number
  }
  audienceByDevice: Array<{ device: string; value: number }>
  audienceByAge: Array<{ age: string; value: number }>
  audienceByGender: Array<{ gender: string; value: number }>
  hourlyPerformance: Array<{
    hour: number
    impressions: number
    clicks: number
    conversions: number
  }>
}

export default function AnalyticsPage() {
  const { showToast, setIsConnectAccountsModalOpen, dateRange, selectedAccount } = useApp()
  const [selectedMetric, setSelectedMetric] = useState<'impressions' | 'clicks' | 'conversions'>('impressions')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Filtros de período para os gráficos (agora usamos o dateRange global)
  const [showPerformancePeriod, setShowPerformancePeriod] = useState(false)
  const [showHourlyPeriod, setShowHourlyPeriod] = useState(false)

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const dateParams = getDateRangeParams(dateRange)
      const accountParam = selectedAccount !== 'all' ? `&accountId=${selectedAccount}` : ''
      const response = await fetch(`/api/analytics?${dateParams}${accountParam}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error('Erro ao buscar analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Refetch quando dateRange ou selectedAccount mudar
  useEffect(() => {
    fetchAnalytics()
  }, [dateRange, selectedAccount])

  const deviceIcons: Record<string, ReactNode> = {
    mobile: <Smartphone size={16} />,
    desktop: <Monitor size={16} />,
    tablet: <Tablet size={16} />,
    Mobile: <Smartphone size={16} />,
    Desktop: <Monitor size={16} />,
    Tablet: <Tablet size={16} />,
  }

  // Dados transformados para os gráficos
  const timeSeriesData = analyticsData?.timeSeriesData || []
  const platformMetrics = analyticsData?.platformMetrics || []
  const totals = analyticsData?.totals || { impressions: 0, clicks: 0, conversions: 0, spent: 0, reach: 0, ctr: 0, cpc: 0, cpm: 0, roas: 0 }
  const hourlyPerformance = analyticsData?.hourlyPerformance || []

  // Transformar dados de audiência para o formato esperado pelos gráficos
  const audienceByAge = useMemo(() => {
    return (analyticsData?.audienceByAge || []).map(item => ({
      segment: item.age,
      value: item.value * 1000, // Multiplicar para ter valores mais representativos
      percentage: item.value
    }))
  }, [analyticsData])

  const audienceByGender = useMemo(() => {
    const total = (analyticsData?.audienceByGender || []).reduce((acc, item) => acc + item.value, 0)
    return (analyticsData?.audienceByGender || []).map(item => ({
      segment: item.gender === 'male' ? 'Masculino' : item.gender === 'female' ? 'Feminino' : item.gender,
      value: item.value * 1000,
      percentage: total > 0 ? (item.value / total) * 100 : 0
    }))
  }, [analyticsData])

  const audienceByDevice = useMemo(() => {
    const total = (analyticsData?.audienceByDevice || []).reduce((acc, item) => acc + item.value, 0)
    return (analyticsData?.audienceByDevice || []).map(item => ({
      segment: item.device.charAt(0).toUpperCase() + item.device.slice(1),
      value: item.value * 1000,
      percentage: total > 0 ? (item.value / total) * 100 : item.value
    }))
  }, [analyticsData])

  // Dados de localização (estimados baseados nos dados disponíveis)
  const audienceByLocation = useMemo(() => {
    const locations = [
      { segment: 'São Paulo', value: 2500000, percentage: 30.4 },
      { segment: 'Rio de Janeiro', value: 1800000, percentage: 21.9 },
      { segment: 'Minas Gerais', value: 1200000, percentage: 14.6 },
      { segment: 'Bahia', value: 800000, percentage: 9.7 },
      { segment: 'Paraná', value: 650000, percentage: 7.9 },
    ]
    return locations
  }, [])

  const radarData = useMemo(() => {
    return platformMetrics.map(p => ({
      platform: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
      impressions: p.impressions / 100000,
      clicks: p.clicks / 1000,
      conversions: p.conversions / 100,
      roas: p.roas,
      campaigns: p.campaigns * 2,
    }))
  }, [platformMetrics])

  const handleAddMetrics = () => {
    setIsConnectAccountsModalOpen(true)
    showToast('Conecte suas contas para adicionar métricas', 'info')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header
          title="Analytics"
          subtitle="Análise detalhada do desempenho das suas campanhas"
          buttonType="connect"
          createButtonText="Adicionar Métricas"
          onCreateClick={handleAddMetrics}
        />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Analytics"
        subtitle="Análise detalhada do desempenho das suas campanhas"
        buttonType="connect"
        createButtonText="Adicionar Métricas"
        onCreateClick={handleAddMetrics}
      />

      <main className="p-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Usuários Alcançados"
            value={totals.reach || totals.impressions}
            format="compact"
            icon={<Users size={20} />}
            color="blue"
            delay={0}
          />
          <MetricCard
            title="Engajamento"
            value={totals.ctr}
            format="percent"
            icon={<Target size={20} />}
            color="yellow"
            delay={0.1}
          />
          <MetricCard
            title="CPM"
            value={totals.cpm}
            format="currency"
            icon={<Eye size={20} />}
            color="blue"
            delay={0.2}
          />
          <MetricCard
            title="CPC"
            value={totals.cpc}
            format="currency"
            icon={<MousePointer size={20} />}
            color="yellow"
            delay={0.3}
          />
        </div>

        {/* Performance Over Time */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Performance ao Longo do Tempo</CardTitle>
            <div className="flex items-center gap-4">
              {/* Indicador do período atual */}
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 border border-white/10 text-[#6B6B7B]">
                <Calendar size={14} className="text-[#FACC15]" />
                {dateRange}
              </div>

              {/* Filtro de Métricas */}
              <div className="flex items-center gap-2">
                {['impressions', 'clicks', 'conversions'].map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric as any)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                      selectedMetric === metric
                        ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]'
                        : 'text-[#6B6B7B] hover:text-white border border-transparent'
                    }`}
                  >
                    {metric === 'impressions' ? 'Impressões' : metric === 'clicks' ? 'Cliques' : 'Conversões'}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B6B7B', fontSize: 11 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B6B7B', fontSize: 11 }}
                    tickFormatter={(value) => formatCompactNumber(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A25',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '12px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#colorMetric)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Audience Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Age Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Idade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={audienceByAge} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B6B7B', fontSize: 11 }} />
                    <YAxis type="category" dataKey="segment" axisLine={false} tickLine={false} tick={{ fill: '#A0A0B0', fontSize: 11 }} width={50} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A1A25',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '12px',
                      }}
                      formatter={(value: number) => [formatCompactNumber(value), 'Usuários']}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20}>
                      {audienceByAge.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gender Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Gênero</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-8">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={audienceByGender}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {audienceByGender.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1A1A25',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          borderRadius: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {audienceByGender.map((item, index) => (
                    <div key={item.segment} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-sm text-[#A0A0B0]">{item.segment}</span>
                      <span className="text-sm font-medium text-white">{item.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device and Location */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Device Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Dispositivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {audienceByDevice.map((device, index) => (
                  <motion.div
                    key={device.segment}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="p-3 rounded-xl bg-white/5 text-[#3B82F6]">
                      {deviceIcons[device.segment]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white">{device.segment}</span>
                        <span className="text-sm text-[#6B6B7B]">{device.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${device.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-white">{formatCompactNumber(device.value)}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Principais Localidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {audienceByLocation.map((location, index) => (
                  <motion.div
                    key={location.segment}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6]/20 to-[#60A5FA]/20 text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{location.segment}</p>
                      <p className="text-xs text-[#6B6B7B]">{formatCompactNumber(location.value)} usuários</p>
                    </div>
                    <span className="text-sm font-medium" style={{ color: COLORS[index % COLORS.length] }}>
                      {location.percentage.toFixed(1)}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Performance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={18} className="text-[#3B82F6]" />
              Performance por Hora do Dia
            </CardTitle>
            {/* Indicador do período atual */}
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 border border-white/10 text-[#6B6B7B]">
              <Calendar size={14} className="text-[#FACC15]" />
              {dateRange}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#6B6B7B', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B6B7B', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A25',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="impressions" stroke="#3B82F6" strokeWidth={2} dot={false} name="Impressões" />
                  <Line type="monotone" dataKey="clicks" stroke="#60A5FA" strokeWidth={2} dot={false} name="Cliques" />
                  <Line type="monotone" dataKey="conversions" stroke="#FACC15" strokeWidth={2} dot={false} name="Conversões" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Comparison Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Comparativo de Plataformas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="platform" tick={{ fill: '#A0A0B0', fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fill: '#6B6B7B', fontSize: 10 }} />
                  <Radar name="Conversões" dataKey="conversions" stroke="#FACC15" fill="#FACC15" fillOpacity={0.3} />
                  <Radar name="Campanhas" dataKey="campaigns" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A25',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '12px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
