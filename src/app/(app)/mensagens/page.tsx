'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Card, Button, Badge, StatCard, ROIGrid, DataTable, Column } from '@/components/ui'
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
  Plus,
  ChevronDown,
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
  { source: 'Organico', conversions: 25, value: 5000 },
]

interface WhatsAppAccount {
  id: string
  name: string
  phone: string
  connected: boolean
  lastSync?: string
}

interface WhatsAppSale {
  id: string
  clientName: string
  phone: string
  value: number
  product: string
  source: string
  date: string
  status: 'completed' | 'pending' | 'cancelled'
  [key: string]: unknown
}

const mockAccounts: WhatsAppAccount[] = [
  { id: '1', name: 'Loja Principal', phone: '+55 11 99999-1234', connected: true, lastSync: '2024-02-15 10:30' },
  { id: '2', name: 'Suporte', phone: '+55 11 98888-5678', connected: false },
]

const mockSales: WhatsAppSale[] = [
  { id: '1', clientName: 'Joao Silva', phone: '(11) 99999-1234', value: 299, product: 'Curso Online', source: 'Meta Ads', date: '2024-02-15 10:30', status: 'completed' },
  { id: '2', clientName: 'Maria Santos', phone: '(11) 98888-5678', value: 599, product: 'Consultoria', source: 'Google Ads', date: '2024-02-15 11:45', status: 'completed' },
  { id: '3', clientName: 'Pedro Costa', phone: '(11) 97777-9012', value: 149, product: 'E-book', source: 'TikTok Ads', date: '2024-02-15 14:20', status: 'pending' },
  { id: '4', clientName: 'Ana Oliveira', phone: '(11) 96666-3456', value: 899, product: 'Mentoria', source: 'Meta Ads', date: '2024-02-14 16:00', status: 'completed' },
]

export default function MensagensPage() {
  const { showToast } = useApp()
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>(mockAccounts)
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [sales, setSales] = useState<WhatsAppSale[]>(mockSales)
  const [showConnectModal, setShowConnectModal] = useState(false)

  const connectedAccounts = accounts.filter(a => a.connected)
  const hasConnectedAccounts = connectedAccounts.length > 0

  const totalSales = sales.filter(s => s.status === 'completed').reduce((acc, s) => acc + s.value, 0)
  const totalConversions = sales.filter(s => s.status === 'completed').length
  const pendingSales = sales.filter(s => s.status === 'pending').length
  const avgTicket = totalConversions > 0 ? totalSales / totalConversions : 0

  const handleConnect = (accountId: string) => {
    setAccounts(prev => prev.map(a =>
      a.id === accountId ? { ...a, connected: true, lastSync: new Date().toISOString() } : a
    ))
    showToast('WhatsApp conectado com sucesso!', 'success')
    setShowConnectModal(false)
  }

  const handleDisconnect = (accountId: string) => {
    setAccounts(prev => prev.map(a =>
      a.id === accountId ? { ...a, connected: false } : a
    ))
    showToast('WhatsApp desconectado', 'info')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        title="Mensagens"
        subtitle="Rastreamento de vendas e metricas via WhatsApp"
        showCreateButton={false}
      />

      <main style={{ flex: 1, padding: '24px 32px', paddingBottom: '48px' }}>
        {!hasConnectedAccounts ? (
          /* Tela de Conexao */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '640px', margin: '0 auto' }}
          >
            <div
              style={{
                padding: '48px',
                borderRadius: '24px',
                background: 'linear-gradient(to bottom right, rgba(37, 211, 102, 0.1), rgba(18, 140, 126, 0.1))',
                border: '1px solid rgba(37, 211, 102, 0.2)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 24px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(37, 211, 102, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MessageCircle size={40} style={{ color: '#25D366' }} />
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>Conecte seu WhatsApp</h2>
              <p style={{ fontSize: '14px', color: '#A0A0B0', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                Conecte o WhatsApp do seu cliente para rastrear vendas e medir o ROI exato das suas campanhas de trafego.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {[
                  { icon: Target, label: 'Rastreamento', desc: 'Saiba a origem de cada venda' },
                  { icon: BarChart3, label: 'ROI Real', desc: 'Calcule o retorno exato' },
                  { icon: Zap, label: 'Automatico', desc: 'Sem trabalho manual' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <item.icon size={24} style={{ color: '#25D366', marginBottom: '12px' }} />
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>{item.label}</p>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>{item.desc}</p>
                  </div>
                ))}
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowConnectModal(true)}
                style={{ backgroundColor: '#25D366', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Link2 size={18} />
                Conectar WhatsApp do Cliente
              </Button>

              <p style={{ fontSize: '12px', color: '#6B6B7B', marginTop: '16px' }}>
                Voce precisara do acesso ao WhatsApp Business do cliente
              </p>
            </div>
          </motion.div>
        ) : (
          /* Dashboard de Mensagens */
          <>
            {/* Seletor de Conta */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                      minWidth: '220px',
                    }}
                  >
                    <option value="all" style={{ backgroundColor: '#12121A' }}>Todas as Contas</option>
                    {connectedAccounts.map((account) => (
                      <option key={account.id} value={account.id} style={{ backgroundColor: '#12121A' }}>
                        {account.name} - {account.phone}
                      </option>
                    ))}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6B6B7B', pointerEvents: 'none' }} />
                </div>
                <span style={{ fontSize: '14px', color: '#6B6B7B' }}>
                  {connectedAccounts.length} conta(s) conectada(s)
                </span>
              </div>
              <Button variant="secondary" onClick={() => setShowConnectModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} />
                Adicionar Conta
              </Button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <StatCard
                label="Vendas WhatsApp"
                value={`R$ ${totalSales.toLocaleString('pt-BR')}`}
                icon={DollarSign}
                color="blue"
                delay={0}
              />
              <StatCard
                label="Conversoes"
                value={totalConversions}
                icon={ShoppingCart}
                color="yellow"
                delay={0.1}
              />
              <StatCard
                label="Ticket Medio"
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
              {/* Grafico de Vendas */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(18, 18, 26, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>Vendas por WhatsApp (Ultimos 7 dias)</h3>
                <div style={{ height: '240px' }}>
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

              {/* Conversoes por Fonte */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(18, 18, 26, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>Conversoes por Fonte de Trafego</h3>
                <div style={{ height: '240px' }}>
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
            <div
              style={{
                padding: '24px',
                borderRadius: '20px',
                backgroundColor: 'rgba(18, 18, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                marginBottom: '24px',
              }}
            >
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>ROI por Fonte de Trafego</h3>
              <ROIGrid
                data={[
                  { source: 'Meta Ads', invested: 2500, revenue: 9000, roi: 260, conversions: 45 },
                  { source: 'Google Ads', invested: 1800, revenue: 6400, roi: 256, conversions: 32 },
                  { source: 'TikTok Ads', invested: 800, revenue: 3600, roi: 350, conversions: 18 },
                  { source: 'LinkedIn Ads', invested: 500, revenue: 2000, roi: 300, conversions: 12 },
                ]}
                variant="default"
                columns={4}
              />
            </div>

            {/* Lista de Vendas */}
            <div
              style={{
                padding: '24px',
                borderRadius: '20px',
                backgroundColor: 'rgba(18, 18, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Ultimas Vendas via WhatsApp</h3>
                <Button variant="secondary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ExternalLink size={14} />
                  Ver Todas
                </Button>
              </div>

              <DataTable
                data={sales}
                searchable
                searchPlaceholder="Buscar por cliente ou produto..."
                searchKeys={['clientName', 'product']}
                pageSize={5}
                columns={[
                  {
                    key: 'clientName',
                    header: 'Cliente',
                    render: (sale) => (
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', margin: 0 }}>{sale.clientName}</p>
                        <p style={{ fontSize: '12px', color: '#6B6B7B', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                          <Phone size={10} />
                          {sale.phone}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: 'product',
                    header: 'Produto',
                    render: (sale) => (
                      <span style={{ fontSize: '14px', color: '#A0A0B0' }}>{sale.product}</span>
                    ),
                  },
                  {
                    key: 'source',
                    header: 'Fonte',
                    render: (sale) => (
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 500,
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          color: '#3B82F6',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                        }}
                      >
                        {sale.source}
                      </span>
                    ),
                  },
                  {
                    key: 'value',
                    header: 'Valor',
                    align: 'right',
                    sortable: true,
                    render: (sale) => (
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#34D399' }}>
                        R$ {sale.value.toLocaleString('pt-BR')}
                      </span>
                    ),
                  },
                  {
                    key: 'date',
                    header: 'Data',
                    sortable: true,
                    render: (sale) => (
                      <span style={{ fontSize: '12px', color: '#6B6B7B' }}>{sale.date}</span>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    align: 'center',
                    render: (sale) => (
                      <Badge variant={sale.status === 'completed' ? 'success' : sale.status === 'pending' ? 'warning' : 'error'}>
                        {sale.status === 'completed' ? 'Concluida' : sale.status === 'pending' ? 'Pendente' : 'Cancelada'}
                      </Badge>
                    ),
                  },
                ] as Column<WhatsAppSale>[]}
                emptyMessage="Nenhuma venda encontrada"
                emptyIcon={<ShoppingCart size={20} style={{ color: '#6B6B7B' }} />}
              />
            </div>
          </>
        )}
      </main>

      {/* Modal de Conexao */}
      <AnimatePresence>
        {showConnectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConnectModal(false)}
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
                maxWidth: '480px',
                background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(37, 211, 102, 0.1)' }}>
                    <MessageCircle size={20} style={{ color: '#25D366' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Conectar WhatsApp</h2>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Selecione uma conta para conectar</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConnectModal(false)}
                  style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: account.connected ? 'rgba(37, 211, 102, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${account.connected ? 'rgba(37, 211, 102, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', margin: 0 }}>{account.name}</p>
                      <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>{account.phone}</p>
                    </div>
                    {account.connected ? (
                      <Button variant="ghost" size="sm" onClick={() => handleDisconnect(account.id)} style={{ color: '#F87171' }}>
                        Desconectar
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => handleConnect(account.id)} style={{ backgroundColor: '#25D366' }}>
                        Conectar
                      </Button>
                    )}
                  </div>
                ))}

                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '2px dashed rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={16} style={{ color: '#6B6B7B' }} />
                  <span style={{ fontSize: '14px', color: '#6B6B7B' }}>Adicionar nova conta</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
