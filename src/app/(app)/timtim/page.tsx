'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Card, Button, Badge, StatCard } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  MessageCircle,
  DollarSign,
  TrendingUp,
  Users,
  ShoppingCart,
  Target,
  BarChart3,
  Phone,
  Link2,
  Check,
  X,
  ExternalLink,
  Calendar,
  Clock,
  ArrowRight,
  Zap,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

const salesData = [
  { date: '01/02', vendas: 12, valor: 2400 },
  { date: '02/02', vendas: 8, valor: 1600 },
  { date: '03/02', vendas: 15, valor: 3000 },
  { date: '04/02', vendas: 22, valor: 4400 },
  { date: '05/02', vendas: 18, valor: 3600 },
  { date: '06/02', vendas: 25, valor: 5000 },
  { date: '07/02', vendas: 30, valor: 6000 },
]

const conversionData = [
  { source: 'Meta Ads', conversions: 45, value: 9000 },
  { source: 'Google Ads', conversions: 32, value: 6400 },
  { source: 'TikTok Ads', conversions: 18, value: 3600 },
  { source: 'Orgânico', conversions: 25, value: 5000 },
]

interface WhatsAppSale {
  id: string
  clientName: string
  phone: string
  value: number
  product: string
  source: string
  date: string
  status: 'completed' | 'pending' | 'cancelled'
}

const mockSales: WhatsAppSale[] = [
  { id: '1', clientName: 'João Silva', phone: '(11) 99999-1234', value: 299, product: 'Curso Online', source: 'Meta Ads', date: '2024-02-15 10:30', status: 'completed' },
  { id: '2', clientName: 'Maria Santos', phone: '(11) 98888-5678', value: 599, product: 'Consultoria', source: 'Google Ads', date: '2024-02-15 11:45', status: 'completed' },
  { id: '3', clientName: 'Pedro Costa', phone: '(11) 97777-9012', value: 149, product: 'E-book', source: 'TikTok Ads', date: '2024-02-15 14:20', status: 'pending' },
  { id: '4', clientName: 'Ana Oliveira', phone: '(11) 96666-3456', value: 899, product: 'Mentoria', source: 'Meta Ads', date: '2024-02-14 16:00', status: 'completed' },
]

export default function TimTimPage() {
  const { showToast, connectedAccounts } = useApp()
  const [isConnected, setIsConnected] = useState(false)
  const [sales, setSales] = useState<WhatsAppSale[]>(mockSales)

  const totalSales = sales.filter(s => s.status === 'completed').reduce((acc, s) => acc + s.value, 0)
  const totalConversions = sales.filter(s => s.status === 'completed').length
  const pendingSales = sales.filter(s => s.status === 'pending').length
  const avgTicket = totalConversions > 0 ? totalSales / totalConversions : 0

  const handleConnect = () => {
    setIsConnected(true)
    showToast('TimTim conectado com sucesso!', 'success')
  }

  return (
    <div className="min-h-screen">
      <Header
        title="TimTim"
        subtitle="Rastreamento de vendas via WhatsApp"
        showCreateButton={false}
      />

      <main className="p-6 md:p-8">
        {!isConnected ? (
          /* Tela de Conexão */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#25D366]/10 to-[#128C7E]/10 border border-[#25D366]/20 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#25D366]/20 flex items-center justify-center">
                <MessageCircle size={40} className="text-[#25D366]" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Conecte o TimTim</h2>
              <p className="text-[#A0A0B0] mb-6 max-w-md mx-auto">
                O TimTim rastreia todas as vendas realizadas via WhatsApp, permitindo medir o ROI exato das suas campanhas de tráfego.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Target, label: 'Rastreamento Preciso', desc: 'Saiba de onde vem cada venda' },
                  { icon: BarChart3, label: 'ROI Real', desc: 'Calcule o retorno exato' },
                  { icon: Zap, label: 'Automático', desc: 'Sem trabalho manual' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <item.icon size={24} className="mx-auto text-[#25D366] mb-2" />
                    <p className="text-sm font-medium text-white mb-1">{item.label}</p>
                    <p className="text-xs text-[#6B6B7B]">{item.desc}</p>
                  </div>
                ))}
              </div>

              <Button variant="primary" size="lg" className="gap-2 bg-[#25D366] hover:bg-[#128C7E]" onClick={handleConnect}>
                <Link2 size={18} />
                Conectar TimTim
              </Button>

              <p className="text-xs text-[#6B6B7B] mt-4">
                Ao conectar, você autoriza o acesso aos dados de vendas via WhatsApp
              </p>
            </div>
          </motion.div>
        ) : (
          /* Dashboard TimTim */
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Vendas WhatsApp"
                value={`R$ ${totalSales.toLocaleString('pt-BR')}`}
                icon={DollarSign}
                color="blue"
                delay={0}
              />
              <StatCard
                label="Conversões"
                value={totalConversions}
                icon={ShoppingCart}
                color="yellow"
                delay={0.1}
              />
              <StatCard
                label="Ticket Médio"
                value={`R$ ${avgTicket.toFixed(0)}`}
                icon={TrendingUp}
                color="blue"
                delay={0.2}
              />
              <StatCard
                label="Pendentes"
                value={pendingSales}
                icon={Clock}
                color="yellow"
                delay={0.3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico de Vendas */}
              <div className="p-5 rounded-2xl bg-[#12121A]/80 border border-white/5">
                <h3 className="text-sm font-semibold text-white mb-4">Vendas por WhatsApp (Últimos 7 dias)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#25D366" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#25D366" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#6B6B7B" fontSize={12} />
                      <YAxis stroke="#6B6B7B" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value: number, name: string) => [
                          name === 'valor' ? `R$ ${value}` : value,
                          name === 'valor' ? 'Valor' : 'Vendas'
                        ]}
                      />
                      <Area type="monotone" dataKey="vendas" stroke="#25D366" fill="url(#colorVendas)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Conversões por Fonte */}
              <div className="p-5 rounded-2xl bg-[#12121A]/80 border border-white/5">
                <h3 className="text-sm font-semibold text-white mb-4">Conversões por Fonte de Tráfego</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conversionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" stroke="#6B6B7B" fontSize={12} />
                      <YAxis dataKey="source" type="category" stroke="#6B6B7B" fontSize={12} width={80} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="conversions" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ROI por Campanha */}
            <div className="p-5 rounded-2xl bg-[#12121A]/80 border border-white/5 mb-6">
              <h3 className="text-sm font-semibold text-white mb-4">ROI por Fonte de Tráfego</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { source: 'Meta Ads', invested: 2500, revenue: 9000, roi: 260 },
                  { source: 'Google Ads', invested: 1800, revenue: 6400, roi: 256 },
                  { source: 'TikTok Ads', invested: 800, revenue: 3600, roi: 350 },
                  { source: 'LinkedIn Ads', invested: 500, revenue: 2000, roi: 300 },
                ].map((item) => (
                  <div key={item.source} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm font-medium text-white mb-3">{item.source}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#6B6B7B]">Investido</span>
                        <span className="text-[#FACC15]">R$ {item.invested.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#6B6B7B]">Receita WPP</span>
                        <span className="text-emerald-400">R$ {item.revenue.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-xs text-[#6B6B7B]">ROI</span>
                        <span className="text-lg font-bold text-[#3B82F6]">{item.roi}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lista de Vendas */}
            <div className="p-5 rounded-2xl bg-[#12121A]/80 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Últimas Vendas via WhatsApp</h3>
                <Button variant="secondary" size="sm" className="gap-1">
                  <ExternalLink size={14} />
                  Ver Todas
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs font-semibold text-[#6B6B7B] uppercase py-3 px-4">Cliente</th>
                      <th className="text-left text-xs font-semibold text-[#6B6B7B] uppercase py-3 px-4">Produto</th>
                      <th className="text-left text-xs font-semibold text-[#6B6B7B] uppercase py-3 px-4">Fonte</th>
                      <th className="text-right text-xs font-semibold text-[#6B6B7B] uppercase py-3 px-4">Valor</th>
                      <th className="text-left text-xs font-semibold text-[#6B6B7B] uppercase py-3 px-4">Data</th>
                      <th className="text-center text-xs font-semibold text-[#6B6B7B] uppercase py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-white/5 transition-all">
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm font-medium text-white">{sale.clientName}</p>
                            <p className="text-xs text-[#6B6B7B] flex items-center gap-1">
                              <Phone size={10} />
                              {sale.phone}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-[#A0A0B0]">{sale.product}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#3B82F6]/10 text-[#3B82F6]">
                            {sale.source}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm font-semibold text-emerald-400">
                            R$ {sale.value.toLocaleString('pt-BR')}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs text-[#6B6B7B]">{sale.date}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant={sale.status === 'completed' ? 'success' : sale.status === 'pending' ? 'warning' : 'error'}>
                            {sale.status === 'completed' ? 'Concluída' : sale.status === 'pending' ? 'Pendente' : 'Cancelada'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
