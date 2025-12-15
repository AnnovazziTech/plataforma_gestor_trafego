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
  Send,
  Search,
  Filter,
  MoreVertical,
  User,
  MessageSquare,
  ChevronRight,
  GitBranch,
  UserPlus,
  UserCheck,
  UserX,
  RefreshCw,
  Archive,
  Star,
  Paperclip,
  Smile,
  Image,
  Mic,
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

// Types
type TabType = 'vendas' | 'crm' | 'funil'
type LeadStatus = 'novo' | 'em_andamento' | 'concluido' | 'descartado' | 'remarketing'

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

interface Contact {
  id: string
  name: string
  phone: string
  avatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  status: 'online' | 'offline'
  source: string
}

interface Message {
  id: string
  content: string
  timestamp: string
  sender: 'user' | 'contact'
  type: 'text' | 'image' | 'audio'
}

interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  source: string
  value?: number
  status: LeadStatus
  createdAt: string
  lastInteraction: string
  notes?: string
  history: { status: LeadStatus; date: string }[]
}

// Mock Data
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

const mockContacts: Contact[] = [
  { id: '1', name: 'João Silva', phone: '(11) 99999-1234', lastMessage: 'Olá, gostaria de saber mais sobre o produto', lastMessageTime: '10:30', unreadCount: 2, status: 'online', source: 'Meta Ads' },
  { id: '2', name: 'Maria Santos', phone: '(11) 98888-5678', lastMessage: 'Obrigada pelo atendimento!', lastMessageTime: '09:15', unreadCount: 0, status: 'offline', source: 'Google Ads' },
  { id: '3', name: 'Pedro Costa', phone: '(11) 97777-9012', lastMessage: 'Qual o prazo de entrega?', lastMessageTime: 'Ontem', unreadCount: 1, status: 'online', source: 'TikTok Ads' },
  { id: '4', name: 'Ana Oliveira', phone: '(11) 96666-3456', lastMessage: 'Vou pensar e te retorno', lastMessageTime: 'Ontem', unreadCount: 0, status: 'offline', source: 'Organico' },
  { id: '5', name: 'Carlos Mendes', phone: '(11) 95555-7890', lastMessage: 'Fechado! Pode enviar o link', lastMessageTime: '2 dias', unreadCount: 0, status: 'offline', source: 'Meta Ads' },
]

const mockMessages: Message[] = [
  { id: '1', content: 'Olá! Vi seu anúncio e gostaria de saber mais sobre o produto', timestamp: '10:25', sender: 'contact', type: 'text' },
  { id: '2', content: 'Olá João! Claro, fico feliz em ajudar. Qual produto você viu?', timestamp: '10:26', sender: 'user', type: 'text' },
  { id: '3', content: 'O curso de marketing digital', timestamp: '10:27', sender: 'contact', type: 'text' },
  { id: '4', content: 'Excelente escolha! O curso tem 40 horas de conteúdo, certificado e acesso vitalício. O valor é R$ 299 à vista ou 12x de R$ 29,90', timestamp: '10:28', sender: 'user', type: 'text' },
  { id: '5', content: 'Qual a forma de pagamento?', timestamp: '10:30', sender: 'contact', type: 'text' },
]

const mockLeads: Lead[] = [
  { id: '1', name: 'Lucas Ferreira', phone: '(11) 99999-0001', email: 'lucas@email.com', source: 'Meta Ads', value: 500, status: 'novo', createdAt: '2024-02-15 08:00', lastInteraction: '2024-02-15 08:00', history: [{ status: 'novo', date: '2024-02-15 08:00' }] },
  { id: '2', name: 'Juliana Lima', phone: '(11) 99999-0002', source: 'Google Ads', value: 1200, status: 'novo', createdAt: '2024-02-15 09:30', lastInteraction: '2024-02-15 09:30', history: [{ status: 'novo', date: '2024-02-15 09:30' }] },
  { id: '3', name: 'Roberto Alves', phone: '(11) 99999-0003', email: 'roberto@email.com', source: 'TikTok Ads', value: 350, status: 'em_andamento', createdAt: '2024-02-14 14:00', lastInteraction: '2024-02-15 10:00', history: [{ status: 'novo', date: '2024-02-14 14:00' }, { status: 'em_andamento', date: '2024-02-15 10:00' }] },
  { id: '4', name: 'Fernanda Costa', phone: '(11) 99999-0004', source: 'Meta Ads', value: 800, status: 'em_andamento', createdAt: '2024-02-13 16:00', lastInteraction: '2024-02-15 11:30', history: [{ status: 'novo', date: '2024-02-13 16:00' }, { status: 'em_andamento', date: '2024-02-14 09:00' }] },
  { id: '5', name: 'Marcelo Santos', phone: '(11) 99999-0005', email: 'marcelo@email.com', source: 'Google Ads', value: 2500, status: 'concluido', createdAt: '2024-02-10 10:00', lastInteraction: '2024-02-14 15:00', history: [{ status: 'novo', date: '2024-02-10 10:00' }, { status: 'em_andamento', date: '2024-02-11 14:00' }, { status: 'concluido', date: '2024-02-14 15:00' }] },
  { id: '6', name: 'Patricia Souza', phone: '(11) 99999-0006', source: 'Organico', value: 450, status: 'concluido', createdAt: '2024-02-08 11:00', lastInteraction: '2024-02-12 16:00', history: [{ status: 'novo', date: '2024-02-08 11:00' }, { status: 'em_andamento', date: '2024-02-09 10:00' }, { status: 'concluido', date: '2024-02-12 16:00' }] },
  { id: '7', name: 'André Oliveira', phone: '(11) 99999-0007', source: 'Meta Ads', status: 'descartado', createdAt: '2024-02-05 09:00', lastInteraction: '2024-02-07 14:00', notes: 'Sem interesse no momento', history: [{ status: 'novo', date: '2024-02-05 09:00' }, { status: 'em_andamento', date: '2024-02-06 11:00' }, { status: 'descartado', date: '2024-02-07 14:00' }] },
  { id: '8', name: 'Camila Ribeiro', phone: '(11) 99999-0008', email: 'camila@email.com', source: 'Google Ads', value: 600, status: 'remarketing', createdAt: '2024-02-01 13:00', lastInteraction: '2024-02-15 09:00', notes: 'Voltou a demonstrar interesse', history: [{ status: 'novo', date: '2024-02-01 13:00' }, { status: 'em_andamento', date: '2024-02-02 10:00' }, { status: 'descartado', date: '2024-02-05 16:00' }, { status: 'remarketing', date: '2024-02-15 09:00' }] },
]

const statusConfig: Record<LeadStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  novo: { label: 'Novo Lead', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)', icon: UserPlus },
  em_andamento: { label: 'Em Andamento', color: '#FACC15', bgColor: 'rgba(250, 204, 21, 0.1)', icon: Clock },
  concluido: { label: 'Concluído', color: '#34D399', bgColor: 'rgba(52, 211, 153, 0.1)', icon: UserCheck },
  descartado: { label: 'Descartado', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', icon: UserX },
  remarketing: { label: 'Remarketing', color: '#A855F7', bgColor: 'rgba(168, 85, 247, 0.1)', icon: RefreshCw },
}

type PlatformType = 'all' | 'whatsapp' | 'instagram' | 'messenger'

const platformIcons: Record<PlatformType, { icon: string; label: string; color: string }> = {
  all: { icon: '🌐', label: 'Todas as Contas', color: '#3B82F6' },
  whatsapp: { icon: '💬', label: 'WhatsApp', color: '#25D366' },
  instagram: { icon: '📷', label: 'Instagram', color: '#E4405F' },
  messenger: { icon: '💭', label: 'Messenger', color: '#0084FF' },
}

export default function MensagensPage() {
  const { showToast } = useApp()
  const [activeTab, setActiveTab] = useState<TabType>('vendas')
  const [activePlatform, setActivePlatform] = useState<PlatformType>('all')
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>(mockAccounts)
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [sales] = useState<WhatsAppSale[]>(mockSales)
  const [showConnectModal, setShowConnectModal] = useState(false)

  // CRM State
  const [contacts] = useState<Contact[]>(mockContacts)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [searchContact, setSearchContact] = useState('')

  // Funil State
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)

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

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      sender: 'user',
      type: 'text'
    }
    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (newStatus: LeadStatus) => {
    if (!draggedLead) return

    setLeads(prev => prev.map(lead => {
      if (lead.id === draggedLead.id) {
        const newHistory = [...lead.history, { status: newStatus, date: new Date().toISOString() }]
        return { ...lead, status: newStatus, lastInteraction: new Date().toISOString(), history: newHistory }
      }
      return lead
    }))

    showToast(`Lead movido para ${statusConfig[newStatus].label}`, 'success')
    setDraggedLead(null)
  }

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.phone.includes(searchContact)
  )

  const tabs = [
    { id: 'vendas' as TabType, label: 'Vendas', icon: DollarSign },
    { id: 'crm' as TabType, label: 'CRM', icon: MessageSquare },
    { id: 'funil' as TabType, label: 'Funil', icon: GitBranch },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        title="Mensagens"
        subtitle="Rastreamento de vendas e métricas via WhatsApp, Instagram ou Messenger"
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
                Conecte o WhatsApp do seu cliente para rastrear vendas, gerenciar conversas e acompanhar o funil de leads.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {[
                  { icon: Target, label: 'Rastreamento', desc: 'Saiba a origem de cada venda' },
                  { icon: MessageSquare, label: 'CRM', desc: 'Gerencie todas as conversas' },
                  { icon: GitBranch, label: 'Funil', desc: 'Acompanhe seus leads' },
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
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              {/* Main Tabs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', width: 'fit-content' }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === tab.id ? 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(37, 211, 102, 0.2))' : 'transparent',
                      color: activeTab === tab.id ? '#FFFFFF' : '#6B6B7B',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Platform Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                {(Object.keys(platformIcons) as PlatformType[]).map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setActivePlatform(platform)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: activePlatform === platform ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      color: activePlatform === platform ? platformIcons[platform].color : '#6B6B7B',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{platformIcons[platform].icon}</span>
                    {platformIcons[platform].label}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* Tab: Vendas */}
              {activeTab === 'vendas' && (
                <motion.div
                  key="vendas"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
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
                </motion.div>
              )}

              {/* Tab: CRM */}
              {activeTab === 'crm' && (
                <motion.div
                  key="crm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* Seletor de WhatsApp do Cliente */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        style={{
                          height: '44px',
                          paddingLeft: '16px',
                          paddingRight: '40px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(37, 211, 102, 0.1)',
                          border: '1px solid rgba(37, 211, 102, 0.3)',
                          fontSize: '14px',
                          color: '#FFFFFF',
                          appearance: 'none',
                          cursor: 'pointer',
                          outline: 'none',
                          minWidth: '280px',
                        }}
                      >
                        <option value="all" style={{ backgroundColor: '#12121A' }}>Selecione o WhatsApp do Cliente</option>
                        {connectedAccounts.map((account) => (
                          <option key={account.id} value={account.id} style={{ backgroundColor: '#12121A' }}>
                            {account.name} - {account.phone}
                          </option>
                        ))}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#25D366', pointerEvents: 'none' }} />
                    </div>
                    <span style={{ fontSize: '14px', color: '#6B6B7B' }}>
                      <MessageCircle size={16} style={{ color: '#25D366', marginRight: '6px', verticalAlign: 'middle' }} />
                      {contacts.length} conversas
                    </span>
                  </div>

                  {/* CRM Interface */}
                  <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', height: 'calc(100vh - 280px)' }}>
                    {/* Lista de Contatos */}
                    <div
                      style={{
                        borderRadius: '20px',
                        backgroundColor: 'rgba(18, 18, 26, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Busca */}
                      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ position: 'relative' }}>
                          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6B6B7B' }} />
                          <input
                            type="text"
                            value={searchContact}
                            onChange={(e) => setSearchContact(e.target.value)}
                            placeholder="Buscar conversa..."
                            style={{
                              width: '100%',
                              height: '40px',
                              paddingLeft: '40px',
                              paddingRight: '12px',
                              borderRadius: '10px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              fontSize: '14px',
                              color: '#FFFFFF',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>

                      {/* Lista */}
                      <div style={{ flex: 1, overflowY: 'auto' }}>
                        {filteredContacts.map((contact) => (
                          <div
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            style={{
                              padding: '16px',
                              cursor: 'pointer',
                              backgroundColor: selectedContact?.id === contact.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                              transition: 'background-color 0.2s',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ position: 'relative' }}>
                                <div
                                  style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <User size={24} style={{ color: '#3B82F6' }} />
                                </div>
                                {contact.status === 'online' && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      bottom: '2px',
                                      right: '2px',
                                      width: '12px',
                                      height: '12px',
                                      borderRadius: '50%',
                                      backgroundColor: '#34D399',
                                      border: '2px solid #12121A',
                                    }}
                                  />
                                )}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>{contact.name}</span>
                                  <span style={{ fontSize: '11px', color: '#6B6B7B' }}>{contact.lastMessageTime}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ fontSize: '12px', color: '#A0A0B0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                                    {contact.lastMessage}
                                  </span>
                                  {contact.unreadCount > 0 && (
                                    <span
                                      style={{
                                        minWidth: '20px',
                                        height: '20px',
                                        padding: '0 6px',
                                        borderRadius: '10px',
                                        backgroundColor: '#25D366',
                                        color: '#FFFFFF',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      {contact.unreadCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Área de Chat */}
                    <div
                      style={{
                        borderRadius: '20px',
                        backgroundColor: 'rgba(18, 18, 26, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                      }}
                    >
                      {selectedContact ? (
                        <>
                          {/* Header do Chat */}
                          <div
                            style={{
                              padding: '16px 20px',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <User size={20} style={{ color: '#3B82F6' }} />
                              </div>
                              <div>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', margin: 0 }}>{selectedContact.name}</p>
                                <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>{selectedContact.phone} • {selectedContact.source}</p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Badge variant="info">{selectedContact.source}</Badge>
                              <button style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                                <MoreVertical size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Mensagens */}
                          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {messages.map((message) => (
                              <div
                                key={message.id}
                                style={{
                                  display: 'flex',
                                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                }}
                              >
                                <div
                                  style={{
                                    maxWidth: '70%',
                                    padding: '12px 16px',
                                    borderRadius: message.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    backgroundColor: message.sender === 'user' ? '#25D366' : 'rgba(255, 255, 255, 0.1)',
                                    color: '#FFFFFF',
                                  }}
                                >
                                  <p style={{ fontSize: '14px', margin: 0, lineHeight: '1.5' }}>{message.content}</p>
                                  <p style={{ fontSize: '10px', color: message.sender === 'user' ? 'rgba(255, 255, 255, 0.7)' : '#6B6B7B', margin: '4px 0 0', textAlign: 'right' }}>
                                    {message.timestamp}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Input de Mensagem */}
                          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <button style={{ padding: '10px', borderRadius: '10px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                                <Paperclip size={20} />
                              </button>
                              <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Digite uma mensagem..."
                                style={{
                                  flex: 1,
                                  height: '44px',
                                  padding: '0 16px',
                                  borderRadius: '22px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  fontSize: '14px',
                                  color: '#FFFFFF',
                                  outline: 'none',
                                }}
                              />
                              <button style={{ padding: '10px', borderRadius: '10px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                                <Smile size={20} />
                              </button>
                              <button
                                onClick={handleSendMessage}
                                style={{
                                  padding: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: '#25D366',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  cursor: 'pointer',
                                }}
                              >
                                <Send size={18} />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                          <div
                            style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(37, 211, 102, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '20px',
                            }}
                          >
                            <MessageSquare size={36} style={{ color: '#25D366' }} />
                          </div>
                          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>Selecione uma conversa</h3>
                          <p style={{ fontSize: '14px', color: '#6B6B7B', textAlign: 'center', maxWidth: '300px' }}>
                            Escolha um contato na lista ao lado para iniciar ou continuar uma conversa
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab: Funil */}
              {activeTab === 'funil' && (
                <motion.div
                  key="funil"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* Stats do Funil */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {(Object.keys(statusConfig) as LeadStatus[]).map((status, idx) => {
                      const config = statusConfig[status]
                      const count = leads.filter(l => l.status === status).length
                      const totalValue = leads.filter(l => l.status === status).reduce((acc, l) => acc + (l.value || 0), 0)
                      return (
                        <motion.div
                          key={status}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          style={{
                            padding: '20px',
                            borderRadius: '16px',
                            backgroundColor: config.bgColor,
                            border: `1px solid ${config.color}33`,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <config.icon size={20} style={{ color: config.color }} />
                            <span style={{ fontSize: '14px', fontWeight: 500, color: config.color }}>{config.label}</span>
                          </div>
                          <p style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{count}</p>
                          <p style={{ fontSize: '12px', color: '#6B6B7B', margin: '4px 0 0' }}>
                            R$ {totalValue.toLocaleString('pt-BR')}
                          </p>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Kanban */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', minHeight: '500px' }}>
                    {(Object.keys(statusConfig) as LeadStatus[]).map((status) => {
                      const config = statusConfig[status]
                      const columnLeads = leads.filter(l => l.status === status)
                      return (
                        <div
                          key={status}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(status)}
                          style={{
                            padding: '16px',
                            borderRadius: '16px',
                            backgroundColor: 'rgba(18, 18, 26, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          {/* Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: config.color,
                                }}
                              />
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>{config.label}</span>
                            </div>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: 500,
                                backgroundColor: config.bgColor,
                                color: config.color,
                              }}
                            >
                              {columnLeads.length}
                            </span>
                          </div>

                          {/* Cards */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                            {columnLeads.map((lead) => (
                              <motion.div
                                key={lead.id}
                                draggable
                                onDragStart={() => handleDragStart(lead)}
                                whileHover={{ scale: 1.02 }}
                                style={{
                                  padding: '14px',
                                  borderRadius: '12px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  cursor: 'grab',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>{lead.name}</span>
                                  <button style={{ padding: '4px', borderRadius: '4px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                                    <MoreVertical size={14} />
                                  </button>
                                </div>
                                <p style={{ fontSize: '11px', color: '#6B6B7B', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Phone size={10} />
                                  {lead.phone}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span
                                    style={{
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '10px',
                                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                      color: '#3B82F6',
                                    }}
                                  >
                                    {lead.source}
                                  </span>
                                  {lead.value && (
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#34D399' }}>
                                      R$ {lead.value}
                                    </span>
                                  )}
                                </div>
                                {lead.notes && (
                                  <p style={{ fontSize: '10px', color: '#A0A0B0', marginTop: '8px', fontStyle: 'italic' }}>
                                    {lead.notes}
                                  </p>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
