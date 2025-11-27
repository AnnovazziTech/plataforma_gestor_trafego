'use client'

import { useState, ReactNode } from 'react'
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
import {
  timeSeriesData,
  platformMetrics,
  audienceByAge,
  audienceByGender,
  audienceByDevice,
  audienceByLocation,
  hourlyPerformance,
} from '@/data/mock-data'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import {
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  TrendingUp,
  Target,
  Eye,
  MousePointer,
} from 'lucide-react'

const COLORS = ['#3B82F6', '#60A5FA', '#FACC15', '#FDE047', '#1D4ED8', '#EAB308']

export default function AnalyticsPage() {
  const [selectedMetric, setSelectedMetric] = useState<'impressions' | 'clicks' | 'conversions'>('impressions')

  const deviceIcons: Record<string, ReactNode> = {
    Mobile: <Smartphone size={16} />,
    Desktop: <Monitor size={16} />,
    Tablet: <Tablet size={16} />,
  }

  const radarData = platformMetrics.map(p => ({
    platform: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    impressions: p.impressions / 100000,
    clicks: p.clicks / 1000,
    conversions: p.conversions / 100,
    roas: p.roas,
    campaigns: p.campaigns * 2,
  }))

  return (
    <div className="min-h-screen">
      <Header
        title="Analytics"
        subtitle="Análise detalhada do desempenho das suas campanhas"
      />

      <main className="p-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Usuários Alcançados"
            value={8234567}
            previousValue={7234567}
            format="compact"
            icon={<Users size={20} />}
            color="blue"
            delay={0}
          />
          <MetricCard
            title="Engajamento"
            value={4.73}
            format="percent"
            icon={<Target size={20} />}
            color="yellow"
            delay={0.1}
          />
          <MetricCard
            title="CPM"
            value={12.34}
            format="currency"
            icon={<Eye size={20} />}
            color="blue"
            delay={0.2}
          />
          <MetricCard
            title="CPC"
            value={0.33}
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
                  <Radar name="ROAS" dataKey="roas" stroke="#FACC15" fill="#FACC15" fillOpacity={0.3} />
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
