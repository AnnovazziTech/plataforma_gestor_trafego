'use client'

import { useState, useEffect } from 'react'
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
// Status compatíveis com a API
type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST' | 'REMARKETING'

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

// Dados serão carregados do banco de dados via API

const statusConfig: Record<LeadStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  NEW: { label: 'Novo Lead', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)', icon: UserPlus },
  CONTACTED: { label: 'Contatado', color: '#FACC15', bgColor: 'rgba(250, 204, 21, 0.1)', icon: Clock },
  QUALIFIED: { label: 'Qualificado', color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.1)', icon: UserCheck },
  PROPOSAL: { label: 'Proposta', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.1)', icon: Target },
  NEGOTIATION: { label: 'Negociação', color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.1)', icon: MessageSquare },
  WON: { label: 'Ganho', color: '#34D399', bgColor: 'rgba(52, 211, 153, 0.1)', icon: UserCheck },
  LOST: { label: 'Perdido', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', icon: UserX },
  REMARKETING: { label: 'Remarketing', color: '#A855F7', bgColor: 'rgba(168, 85, 247, 0.1)', icon: RefreshCw },
}

type PlatformType = 'all' | 'whatsapp' | 'instagram' | 'messenger'

const platformIcons: Record<PlatformType, { icon: string; label: string; color: string }> = {
  all: { icon: '🌐', label: 'Todas as Contas', color: '#3B82F6' },
  whatsapp: { icon: '💬', label: 'WhatsApp', color: '#25D366' },
  instagram: { icon: '📷', label: 'Instagram', color: '#E4405F' },
  messenger: { icon: '💭', label: 'Messenger', color: '#0084FF' },
}

export default function MensagensPage() {
  const {
    showToast,
    connectedAccounts: contextAccounts,
    leads: contextLeads,
    leadsLoading,
    fetchLeads,
    updateLead,
    conversations,
    conversationsLoading,
    fetchConversations,
    sendMessage: contextSendMessage,
    setIsConnectAccountsModalOpen,
  } = useApp()

  const [activeTab, setActiveTab] = useState<TabType>('vendas')
  const [activePlatform, setActivePlatform] = useState<PlatformType>('all')
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [showConnectModal, setShowConnectModal] = useState(false)

  // CRM State
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchContact, setSearchContact] = useState('')

  // Funil State
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [leadNote, setLeadNote] = useState('')

  // Fetch data on mount
  useEffect(() => {
    fetchLeads()
    fetchConversations()
  }, [fetchLeads, fetchConversations])

  // Transform context accounts to local format (filter messaging platforms)
  const accounts: WhatsAppAccount[] = contextAccounts
    .filter(a => ['whatsapp', 'facebook_ads'].includes(a.platform))
    .map(a => ({
      id: a.id,
      name: a.name,
      phone: a.email || '',
      connected: a.connected || a.status === 'active',
      lastSync: a.connectedAt,
    }))

  // Transform context leads to local format
  const leads: Lead[] = contextLeads.map(l => ({
    id: l.id,
    name: l.name,
    phone: l.phone || '',
    email: l.email,
    source: l.source,
    value: l.value,
    status: (l.status || 'NEW') as LeadStatus,
    createdAt: l.createdAt,
    lastInteraction: l.createdAt,
    notes: l.notes,
    history: [{ status: (l.status || 'NEW') as LeadStatus, date: l.createdAt }],
  }))

  // Transform conversations to contacts format
  const contacts: Contact[] = conversations.map(c => ({
    id: c.id,
    name: c.contactName,
    phone: c.contactPhone || '',
    lastMessage: c.lastMessage || '',
    lastMessageTime: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
    unreadCount: c.unreadCount,
    status: 'offline' as const,
    source: c.tags?.[0] || 'Orgânico',
  }))

  // Função para mapear source para plataforma
  const getPlatformFromSource = (source: string): PlatformType => {
    const sourceUpper = source?.toUpperCase() || ''
    if (sourceUpper.includes('WHATSAPP')) return 'whatsapp'
    if (sourceUpper.includes('META') || sourceUpper.includes('FACEBOOK') || sourceUpper.includes('INSTAGRAM')) return 'instagram'
    if (sourceUpper.includes('MESSENGER')) return 'messenger'
    // Para outras fontes (GOOGLE, TIKTOK, ORGANIC, etc), consideramos como WhatsApp (canal principal)
    return 'whatsapp'
  }

  // Filtrar dados por plataforma selecionada
  const filteredLeads = activePlatform === 'all'
    ? leads
    : leads.filter(l => getPlatformFromSource(l.source) === activePlatform)

  const filteredContacts = activePlatform === 'all'
    ? contacts
    : contacts.filter(c => getPlatformFromSource(c.source) === activePlatform)

  // Sales data from won leads (filtrados por plataforma)
  const sales: WhatsAppSale[] = filteredLeads
    .filter(l => l.status === 'WON' && l.value)
    .map(l => ({
      id: l.id,
      clientName: l.name,
      phone: l.phone,
      value: l.value || 0,
      product: 'Produto',
      source: l.source,
      date: l.createdAt,
      status: 'completed' as const,
    }))

  const whatsappAccounts = accounts.filter(a => a.connected)
  // Show data if there are leads OR connected accounts
  const hasConnectedAccounts = whatsappAccounts.length > 0 || contextAccounts.length > 0 || contextLeads.length > 0

  const totalSales = sales.reduce((acc, s) => acc + s.value, 0)
  const totalConversions = sales.length
  // Em andamento = CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION
  const pendingSales = filteredLeads.filter(l => ['CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(l.status)).length
  const avgTicket = totalConversions > 0 ? totalSales / totalConversions : 0

  const handleConnect = (accountId?: string) => {
    setIsConnectAccountsModalOpen(true)
    setShowConnectModal(false)
  }

  const handleDisconnect = (accountId: string) => {
    showToast('Para desconectar, vá em Configurações > Integrações', 'info')
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      sender: 'user',
      type: 'text'
    }
    setMessages(prev => [...prev, message])

    // Send via API
    try {
      await contextSendMessage(selectedContact.id, newMessage)
    } catch (error) {
      console.error('Error sending message:', error)
    }

    setNewMessage('')
  }

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (newStatus: LeadStatus) => {
    if (!draggedLead) return

    // Update via API
    try {
      await updateLead(draggedLead.id, { status: newStatus.toUpperCase() })
      showToast(`Lead movido para ${statusConfig[newStatus].label}`, 'success')
    } catch (error) {
      showToast('Erro ao mover lead', 'error')
    }

    setDraggedLead(null)
  }

  const handleOpenLeadModal = (lead: Lead) => {
    setSelectedLead(lead)
    setLeadNote(lead.notes || '')
    setShowLeadModal(true)
  }

  const handleSaveLeadNote = async () => {
    if (!selectedLead) return
    try {
      await updateLead(selectedLead.id, { notes: leadNote })
      showToast('Nota salva com sucesso', 'success')
      setShowLeadModal(false)
    } catch (error) {
      showToast('Erro ao salvar nota', 'error')
    }
  }

  const handleQuickAction = async (lead: Lead, action: 'whatsapp' | 'call' | 'email') => {
    const phone = lead.phone?.replace(/\D/g, '')
    switch (action) {
      case 'whatsapp':
        window.open(`https://wa.me/55${phone}`, '_blank')
        break
      case 'call':
        window.open(`tel:${lead.phone}`, '_blank')
        break
      case 'email':
        if (lead.email) {
          window.open(`mailto:${lead.email}`, '_blank')
        } else {
          showToast('Lead sem email cadastrado', 'warning')
        }
        break
    }
  }

  // Aplicar filtro de busca sobre contacts já filtrados por plataforma
  const searchedContacts = filteredContacts.filter(c =>
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
          /* Tela de Conexão */
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
                Você precisará do acesso ao WhatsApp Business do cliente
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
                          {accounts.map((account) => (
                            <option key={account.id} value={account.id} style={{ backgroundColor: '#12121A' }}>
                              {account.name} - {account.phone}
                            </option>
                          ))}
                        </select>
                        <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6B6B7B', pointerEvents: 'none' }} />
                      </div>
                      <span style={{ fontSize: '14px', color: '#6B6B7B' }}>
                        {accounts.length} conta(s) conectada(s)
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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
                    {/* Gráfico de Vendas */}
                    <div
                      style={{
                        padding: '24px',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(18, 18, 26, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>Vendas por WhatsApp (Últimos 7 dias)</h3>
                      <div style={{ height: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={32} style={{ color: '#3B3B4B', marginBottom: '12px' }} />
                        <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Nenhuma venda registrada</p>
                        <p style={{ fontSize: '12px', color: '#4B4B5B', margin: 0, marginTop: '4px' }}>Conecte o WhatsApp para rastrear vendas</p>
                      </div>
                    </div>

                    {/* Conversões por Fonte */}
                    <div
                      style={{
                        padding: '24px',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(18, 18, 26, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>Conversões por Fonte de Tráfego</h3>
                      <div style={{ height: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Target size={32} style={{ color: '#3B3B4B', marginBottom: '12px' }} />
                        <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Nenhuma conversão registrada</p>
                        <p style={{ fontSize: '12px', color: '#4B4B5B', margin: 0, marginTop: '4px' }}>Dados serão exibidos quando houver vendas</p>
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
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>ROI por Fonte de Tráfego</h3>
                    <ROIGrid
                      data={[]}
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
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Últimas Vendas via WhatsApp</h3>
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
                              {sale.status === 'completed' ? 'Concluída' : sale.status === 'pending' ? 'Pendente' : 'Cancelada'}
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
                        {accounts.map((account) => (
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
                        {searchedContacts.map((contact) => (
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
                  {/* Loading State */}
                  {leadsLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        border: '3px solid rgba(59, 130, 246, 0.2)',
                        borderTopColor: '#3B82F6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '16px',
                      }} />
                      <p style={{ fontSize: '14px', color: '#6B6B7B' }}>Carregando leads...</p>
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                  ) : filteredLeads.length === 0 ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '80px 24px',
                      borderRadius: '20px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed rgba(255, 255, 255, 0.1)',
                    }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                      }}>
                        <Users size={32} style={{ color: '#3B82F6' }} />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>Nenhum lead encontrado</h3>
                      <p style={{ fontSize: '14px', color: '#6B6B7B', textAlign: 'center', maxWidth: '400px' }}>
                        {activePlatform !== 'all'
                          ? `Nenhum lead encontrado para ${platformIcons[activePlatform].label}. Tente selecionar outra plataforma.`
                          : 'Conecte suas campanhas para começar a receber leads automaticamente.'}
                      </p>
                    </div>
                  ) : (
                    <>
                  {/* Stats do Funil */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px', overflowX: 'auto' }}>
                    {(Object.keys(statusConfig) as LeadStatus[]).map((status, idx) => {
                      const config = statusConfig[status]
                      const count = filteredLeads.filter(l => l.status === status).length
                      const totalValue = filteredLeads.filter(l => l.status === status).reduce((acc, l) => acc + (l.value || 0), 0)
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
                  <div style={{ display: 'flex', gap: '16px', minHeight: '500px', overflowX: 'auto', paddingBottom: '16px' }}>
                    {(Object.keys(statusConfig) as LeadStatus[]).map((status) => {
                      const config = statusConfig[status]
                      const columnLeads = filteredLeads.filter(l => l.status === status)
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
                            minWidth: '220px',
                            flex: '1',
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
                                  <span
                                    style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF', cursor: 'pointer' }}
                                    onClick={() => handleOpenLeadModal(lead)}
                                  >
                                    {lead.name}
                                  </span>
                                  <button
                                    onClick={() => handleOpenLeadModal(lead)}
                                    style={{ padding: '4px', borderRadius: '4px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                                  >
                                    <MoreVertical size={14} />
                                  </button>
                                </div>
                                <p style={{ fontSize: '11px', color: '#6B6B7B', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Phone size={10} />
                                  {lead.phone}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
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
                                {/* Quick Actions */}
                                <div style={{ display: 'flex', gap: '6px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleQuickAction(lead, 'whatsapp'); }}
                                    title="WhatsApp"
                                    style={{
                                      flex: 1,
                                      padding: '6px',
                                      borderRadius: '6px',
                                      backgroundColor: 'rgba(37, 211, 102, 0.1)',
                                      border: 'none',
                                      color: '#25D366',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <MessageCircle size={12} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleQuickAction(lead, 'call'); }}
                                    title="Ligar"
                                    style={{
                                      flex: 1,
                                      padding: '6px',
                                      borderRadius: '6px',
                                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                      border: 'none',
                                      color: '#3B82F6',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <Phone size={12} />
                                  </button>
                                  {lead.email && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleQuickAction(lead, 'email'); }}
                                      title="Email"
                                      style={{
                                        flex: 1,
                                        padding: '6px',
                                        borderRadius: '6px',
                                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                        border: 'none',
                                        color: '#A855F7',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      <Send size={12} />
                                    </button>
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
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>

      {/* Modal de Conexão */}
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

      {/* Modal de Detalhes do Lead */}
      <AnimatePresence>
        {showLeadModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLeadModal(false)}
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
                background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: statusConfig[selectedLead.status].bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {(() => {
                      const IconComponent = statusConfig[selectedLead.status].icon
                      return <IconComponent size={24} style={{ color: statusConfig[selectedLead.status].color }} />
                    })()}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{selectedLead.name}</h2>
                    <Badge variant="info" style={{ backgroundColor: statusConfig[selectedLead.status].bgColor, color: statusConfig[selectedLead.status].color }}>
                      {statusConfig[selectedLead.status].label}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => setShowLeadModal(false)}
                  style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: '24px' }}>
                {/* Contact Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: '0 0 4px' }}>Telefone</p>
                    <p style={{ fontSize: '14px', color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} />
                      {selectedLead.phone || 'Não informado'}
                    </p>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: '0 0 4px' }}>Email</p>
                    <p style={{ fontSize: '14px', color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Send size={14} />
                      {selectedLead.email || 'Não informado'}
                    </p>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: '0 0 4px' }}>Fonte</p>
                    <p style={{ fontSize: '14px', color: '#3B82F6', margin: 0 }}>{selectedLead.source}</p>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: '0 0 4px' }}>Valor Potencial</p>
                    <p style={{ fontSize: '14px', color: '#34D399', margin: 0, fontWeight: 600 }}>
                      {selectedLead.value ? `R$ ${selectedLead.value.toLocaleString('pt-BR')}` : 'Não informado'}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <button
                    onClick={() => handleQuickAction(selectedLead, 'whatsapp')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(37, 211, 102, 0.1)',
                      border: '1px solid rgba(37, 211, 102, 0.3)',
                      color: '#25D366',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleQuickAction(selectedLead, 'call')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#3B82F6',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    <Phone size={18} />
                    Ligar
                  </button>
                  {selectedLead.email && (
                    <button
                      onClick={() => handleQuickAction(selectedLead, 'email')}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        color: '#A855F7',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                    >
                      <Send size={18} />
                      Email
                    </button>
                  )}
                </div>

                {/* Notes */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>
                    Notas
                  </label>
                  <textarea
                    value={leadNote}
                    onChange={(e) => setLeadNote(e.target.value)}
                    placeholder="Adicione observações sobre este lead..."
                    style={{
                      width: '100%',
                      height: '100px',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '14px',
                      color: '#FFFFFF',
                      resize: 'none',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* History */}
                {selectedLead.history && selectedLead.history.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px' }}>Histórico</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedLead.history.map((entry, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          }}
                        >
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: statusConfig[entry.status].color,
                            }}
                          />
                          <span style={{ fontSize: '13px', color: '#FFFFFF' }}>{statusConfig[entry.status].label}</span>
                          <span style={{ fontSize: '12px', color: '#6B6B7B', marginLeft: 'auto' }}>
                            {new Date(entry.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setShowLeadModal(false)}>
                  Fechar
                </Button>
                <Button variant="primary" onClick={handleSaveLeadNote}>
                  Salvar Nota
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
