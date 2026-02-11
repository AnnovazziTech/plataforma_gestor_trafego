'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Button, Badge, StatCard } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  Users,
  TrendingUp,
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  Circle,
  Timer,
  X,
  Bell,
  Target,
  Wallet,
  PiggyBank,
  Receipt,
  Play,
  Pause,
  Square,
  UserPlus,
  Send,
  Eye,
  Download,
  Copy,
  MessageCircle,
  DollarSign,
  Percent,
  Building2,
} from 'lucide-react'
import { Quote, QuoteService, QuoteStatus, ServiceTemplate } from '@/types'
import { generateQuotePDF } from '@/lib/pdf/generate-quote'
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

interface Client {
  id: string
  name: string
  email: string
  phone: string
  contractStart: string
  contractEnd: string
  contractValue: number
  notes: string
  status: 'active' | 'inactive' | 'pending'
}

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
}

interface Task {
  id: string
  title: string
  completed: boolean
  date: string
}

interface Appointment {
  id: string
  title: string
  date: string
  time: string
  reminder: boolean
}

// Templates de serviços disponíveis para orçamentos
const serviceTemplates: ServiceTemplate[] = [
  { id: '1', name: 'Gestão de Tráfego - Meta Ads', description: 'Gerenciamento completo de campanhas no Facebook e Instagram', defaultPrice: 1500, category: 'Gestão' },
  { id: '2', name: 'Gestão de Tráfego - Google Ads', description: 'Gerenciamento completo de campanhas no Google', defaultPrice: 1500, category: 'Gestão' },
  { id: '3', name: 'Criação de Criativos', description: 'Design de peças publicitárias para campanhas', defaultPrice: 500, category: 'Criativo' },
  { id: '4', name: 'Consultoria de Marketing', description: 'Análise estratégica e planejamento de marketing digital', defaultPrice: 800, category: 'Consultoria' },
  { id: '5', name: 'Relatório de Performance', description: 'Relatório detalhado mensal de resultados', defaultPrice: 300, category: 'Relatório' },
  { id: '6', name: 'Setup de Pixel/Conversões', description: 'Configuração completa de rastreamento', defaultPrice: 400, category: 'Técnico' },
]

type TabType = 'clients' | 'finances' | 'agenda' | 'productivity' | 'budget'

export default function AdminPage() {
  const { showToast, connectedAccounts } = useApp()
  const [activeTab, setActiveTab] = useState<TabType>('clients')
  const [clients, setClients] = useState<Client[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showClientModal, setShowClientModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [quoteServices, setQuoteServices] = useState<QuoteService[]>([])
  const [quoteDiscount, setQuoteDiscount] = useState({ value: 0, type: 'percent' as 'percent' | 'fixed' })
  const [quoteNotes, setQuoteNotes] = useState('')
  const [quotePaymentTerms, setQuotePaymentTerms] = useState('')
  const [quoteValidDays, setQuoteValidDays] = useState(15)
  const [onlineTime, setOnlineTime] = useState(0)

  // New client form state
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    contractStart: '',
    contractEnd: '',
    contractValue: '',
    notes: '',
  })

  // New appointment form state
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    date: '',
    time: '',
    reminder: true,
  })

  // New expense form state
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'marketing',
    date: new Date().toISOString().split('T')[0],
  })

  // Carregar dados da API
  useEffect(() => {
    fetchClients()
    fetchExpenses()
    fetchQuotes()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
    }
  }

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
    }
  }

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes')
      if (response.ok) {
        const data = await response.json()
        setQuotes(data.map((q: any) => ({
          id: q.id,
          number: `ORC-${new Date(q.createdAt).getFullYear()}-${q.id.slice(-3)}`,
          client: {
            name: q.clientName,
            email: q.clientEmail,
            phone: '',
            company: q.clientName,
          },
          services: q.services || [],
          subtotal: q.totalValue,
          discount: 0,
          discountType: 'percent' as const,
          total: q.totalValue,
          validUntil: q.validUntil || new Date().toISOString(),
          notes: q.notes,
          status: q.status?.toLowerCase() || 'draft',
          createdAt: q.createdAt,
          updatedAt: q.updatedAt || q.createdAt,
        })))
      }
    } catch (error) {
    }
  }

  // Contador de tempo online na sessao atual
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const totalRevenue = clients.reduce((acc, c) => acc + c.contractValue, 0)
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0)
  const profit = totalRevenue - totalExpenses

  const tabs = [
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'finances', label: 'Financeiro', icon: Wallet },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'productivity', label: 'Produtividade', icon: Timer },
    { id: 'budget', label: 'Orçamentos', icon: Target },
  ]

  // Quote helper functions
  const getQuoteStatusLabel = (status: QuoteStatus) => {
    const labels: Record<QuoteStatus, string> = {
      draft: 'Rascunho',
      sent: 'Enviado',
      viewed: 'Visualizado',
      accepted: 'Aceito',
      rejected: 'Rejeitado',
      expired: 'Expirado',
    }
    return labels[status]
  }

  const getQuoteStatusVariant = (status: QuoteStatus): 'default' | 'warning' | 'success' | 'error' => {
    const variants: Record<QuoteStatus, 'default' | 'warning' | 'success' | 'error'> = {
      draft: 'default',
      sent: 'warning',
      viewed: 'warning',
      accepted: 'success',
      rejected: 'error',
      expired: 'default',
    }
    return variants[status]
  }

  const generateQuoteNumber = () => {
    const year = new Date().getFullYear()
    const count = quotes.filter(q => q.number.includes(year.toString())).length + 1
    return `ORC-${year}-${count.toString().padStart(3, '0')}`
  }

  const calculateQuoteTotal = () => {
    const subtotal = quoteServices.reduce((acc, s) => acc + s.total, 0)
    let discount = 0
    if (quoteDiscount.type === 'percent') {
      discount = subtotal * (quoteDiscount.value / 100)
    } else {
      discount = quoteDiscount.value
    }
    return { subtotal, discount, total: subtotal - discount }
  }

  const addServiceToQuote = (template: ServiceTemplate) => {
    const newService: QuoteService = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      quantity: 1,
      unitPrice: template.defaultPrice,
      total: template.defaultPrice,
    }
    setQuoteServices(prev => [...prev, newService])
  }

  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    setQuoteServices(prev => prev.map(s =>
      s.id === serviceId
        ? { ...s, quantity, total: s.unitPrice * quantity }
        : s
    ))
  }

  const updateServicePrice = (serviceId: string, unitPrice: number) => {
    setQuoteServices(prev => prev.map(s =>
      s.id === serviceId
        ? { ...s, unitPrice, total: unitPrice * s.quantity }
        : s
    ))
  }

  const removeServiceFromQuote = (serviceId: string) => {
    setQuoteServices(prev => prev.filter(s => s.id !== serviceId))
  }

  const resetQuoteForm = () => {
    setSelectedClient('')
    setQuoteServices([])
    setQuoteDiscount({ value: 0, type: 'percent' })
    setQuoteNotes('')
    setQuotePaymentTerms('')
    setQuoteValidDays(15)
    setEditingQuote(null)
  }

  const handleCreateQuote = async () => {
    if (!selectedClient) {
      showToast('Selecione um cliente', 'error')
      return
    }
    if (quoteServices.length === 0) {
      showToast('Adicione pelo menos um serviço', 'error')
      return
    }

    const client = clients.find(c => c.id === selectedClient)
    if (!client) return

    const { subtotal, discount, total } = calculateQuoteTotal()
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + quoteValidDays)

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: client.name,
          clientEmail: client.email,
          services: quoteServices,
          totalValue: total,
          validUntil: validUntil.toISOString(),
          notes: quoteNotes || null,
        }),
      })

      if (response.ok) {
        setShowQuoteModal(false)
        resetQuoteForm()
        showToast('Orçamento criado com sucesso!', 'success')
        fetchQuotes()
      } else {
        showToast('Erro ao criar orçamento', 'error')
      }
    } catch (error) {
      showToast('Erro ao criar orçamento', 'error')
    }
  }

  const handleSendQuote = (quote: Quote, method: 'email' | 'whatsapp') => {
    // Update quote status to sent
    setQuotes(prev => prev.map(q =>
      q.id === quote.id
        ? { ...q, status: 'sent' as QuoteStatus, sentAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : q
    ))

    if (method === 'email') {
      // Open email client
      const subject = encodeURIComponent(`Orçamento ${quote.number} - ${quote.client.name}`)
      const body = encodeURIComponent(`Olá ${quote.client.name},\n\nSegue em anexo o orçamento solicitado.\n\nValor Total: R$ ${quote.total.toLocaleString('pt-BR')}\nValidade: ${new Date(quote.validUntil).toLocaleDateString('pt-BR')}\n\nAtenciosamente.`)
      window.open(`mailto:${quote.client.email}?subject=${subject}&body=${body}`)
      showToast('Email preparado para envio!', 'success')
    } else {
      // Open WhatsApp
      const phone = quote.client.phone?.replace(/\D/g, '')
      const message = encodeURIComponent(`Olá ${quote.client.name}! Segue o orçamento ${quote.number} no valor de R$ ${quote.total.toLocaleString('pt-BR')}. Válido até ${new Date(quote.validUntil).toLocaleDateString('pt-BR')}.`)
      window.open(`https://wa.me/55${phone}?text=${message}`)
      showToast('WhatsApp aberto!', 'success')
    }
  }

  const handleDeleteQuote = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setQuotes(prev => prev.filter(q => q.id !== quoteId))
        showToast('Orçamento removido', 'info')
      } else {
        showToast('Erro ao remover orçamento', 'error')
      }
    } catch (error) {
      showToast('Erro ao remover orçamento', 'error')
    }
  }

  const handleAddAppointment = () => {
    if (!newAppointment.title.trim()) {
      showToast('Por favor, informe o título do compromisso', 'error')
      return
    }
    if (!newAppointment.date) {
      showToast('Por favor, selecione a data', 'error')
      return
    }
    if (!newAppointment.time) {
      showToast('Por favor, informe o horário', 'error')
      return
    }

    const appointment: Appointment = {
      id: Date.now().toString(),
      title: newAppointment.title,
      date: newAppointment.date,
      time: newAppointment.time,
      reminder: newAppointment.reminder,
    }

    setAppointments(prev => [...prev, appointment])
    setShowAppointmentModal(false)
    setNewAppointment({ title: '', date: '', time: '', reminder: true })
    showToast('Compromisso agendado com sucesso!', 'success')
  }

  const handleAddExpense = async () => {
    if (!newExpense.description.trim()) {
      showToast('Por favor, informe a descrição da despesa', 'error')
      return
    }
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      showToast('Por favor, informe um valor válido', 'error')
      return
    }

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          date: newExpense.date,
        }),
      })

      if (response.ok) {
        setShowExpenseModal(false)
        setNewExpense({ description: '', amount: '', category: 'marketing', date: new Date().toISOString().split('T')[0] })
        showToast('Despesa adicionada com sucesso!', 'success')
        fetchExpenses()
      } else {
        showToast('Erro ao adicionar despesa', 'error')
      }
    } catch (error) {
      showToast('Erro ao adicionar despesa', 'error')
    }
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setNewClient({
      name: client.name,
      email: client.email,
      phone: client.phone,
      contractStart: client.contractStart,
      contractEnd: client.contractEnd || '',
      contractValue: client.contractValue.toString(),
      notes: client.notes || '',
    })
    setShowClientModal(true)
  }

  const handleAddClient = async () => {
    if (!newClient.name.trim()) {
      showToast('Por favor, informe o nome do cliente', 'error')
      return
    }
    if (!newClient.email.trim()) {
      showToast('Por favor, informe o email do cliente', 'error')
      return
    }

    try {
      if (editingClient) {
        // Atualizar cliente existente via API
        const response = await fetch(`/api/clients/${editingClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newClient.name,
            email: newClient.email,
            phone: newClient.phone,
            contractStart: newClient.contractStart || editingClient.contractStart,
            contractEnd: newClient.contractEnd || null,
            contractValue: parseFloat(newClient.contractValue) || 0,
            notes: newClient.notes,
          }),
        })

        if (response.ok) {
          setShowClientModal(false)
          setEditingClient(null)
          setNewClient({ name: '', email: '', phone: '', contractStart: '', contractEnd: '', contractValue: '', notes: '' })
          showToast('Cliente atualizado com sucesso!', 'success')
          fetchClients()
        } else {
          showToast('Erro ao atualizar cliente', 'error')
        }
      } else {
        // Criar novo cliente via API
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newClient.name,
            email: newClient.email,
            phone: newClient.phone,
            contractStart: newClient.contractStart || new Date().toISOString().split('T')[0],
            contractEnd: newClient.contractEnd || null,
            contractValue: parseFloat(newClient.contractValue) || 0,
            notes: newClient.notes,
          }),
        })

        if (response.ok) {
          setShowClientModal(false)
          setNewClient({ name: '', email: '', phone: '', contractStart: '', contractEnd: '', contractValue: '', notes: '' })
          showToast('Cliente adicionado com sucesso!', 'success')
          fetchClients()
        } else {
          showToast('Erro ao adicionar cliente', 'error')
        }
      }
    } catch (error) {
      showToast('Erro ao salvar cliente', 'error')
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        title="Administração"
        subtitle="Gerencie seus clientes, finanças e produtividade"
        showCreateButton={false}
      />

      <main style={{ padding: '24px 32px', paddingBottom: '80px' }}>
        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <StatCard
            label="Clientes Ativos"
            value={clients.filter(c => c.status === 'active').length}
            icon={Users}
            color="blue"
            delay={0}
          />
          <StatCard
            label="Receita Mensal"
            value={`R$ ${totalRevenue.toLocaleString('pt-BR')}`}
            icon={TrendingUp}
            color="yellow"
            delay={0.1}
          />
          <StatCard
            label="Despesas"
            value={`R$ ${totalExpenses.toLocaleString('pt-BR')}`}
            icon={Receipt}
            color="blue"
            delay={0.2}
          />
          <StatCard
            label="Lucro"
            value={`R$ ${profit.toLocaleString('pt-BR')}`}
            icon={PiggyBank}
            color="yellow"
            delay={0.3}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                border: activeTab === tab.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: activeTab === tab.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: activeTab === tab.id ? '#3B82F6' : '#A0A0B0',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'clients' && (
            <motion.div
              key="clients"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Meus Clientes</h2>
                <Button variant="primary" onClick={() => { setEditingClient(null); setNewClient({ name: '', email: '', phone: '', contractStart: '', contractEnd: '', contractValue: '', notes: '' }); setShowClientModal(true); }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} />
                    Novo Cliente
                  </span>
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {clients.map((client, index) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(18, 18, 26, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: 'linear-gradient(to bottom right, #3B82F6, #8B5CF6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: '18px',
                          fontWeight: 700,
                        }}>
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: 0, marginBottom: '4px' }}>{client.name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B6B7B' }}>
                              <Mail size={12} />
                              {client.email}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B6B7B' }}>
                              <Phone size={12} />
                              {client.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Badge variant={client.status === 'active' ? 'success' : client.status === 'pending' ? 'warning' : 'default'}>
                          {client.status === 'active' ? 'Ativo' : client.status === 'pending' ? 'Pendente' : 'Inativo'}
                        </Badge>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => handleEditClient(client)}
                            style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
                                if (response.ok) {
                                  setClients(prev => prev.filter(c => c.id !== client.id))
                                  showToast('Cliente removido', 'info')
                                } else {
                                  showToast('Erro ao remover cliente', 'error')
                                }
                              } catch (error) {
                                showToast('Erro ao remover cliente', 'error')
                              }
                            }}
                            style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div>
                        <p style={{ fontSize: '12px', color: '#6B6B7B', marginBottom: '4px', margin: 0 }}>Início do Contrato</p>
                        <p style={{ fontSize: '14px', color: '#FFFFFF', margin: 0 }}>{new Date(client.contractStart).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#6B6B7B', marginBottom: '4px', margin: 0 }}>Fim do Contrato</p>
                        <p style={{ fontSize: '14px', color: '#FFFFFF', margin: 0 }}>{client.contractEnd ? new Date(client.contractEnd).toLocaleDateString('pt-BR') : '-'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#6B6B7B', marginBottom: '4px', margin: 0 }}>Valor Mensal</p>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#3B82F6', margin: 0 }}>R$ {client.contractValue.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    {client.notes && (
                      <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileText size={12} />
                          {client.notes}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'finances' && (
            <motion.div
              key="finances"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Gráfico Receita x Despesas */}
              <div style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'rgba(18, 18, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                marginBottom: '24px',
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0, marginBottom: '16px' }}>Receita x Despesas</h3>
                <div style={{ height: '256px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={32} style={{ color: '#3B3B4B', marginBottom: '12px' }} />
                  <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Nenhum dado financeiro registrado</p>
                  <p style={{ fontSize: '12px', color: '#4B4B5B', margin: 0, marginTop: '4px' }}>Adicione clientes e despesas para ver o gráfico</p>
                </div>
              </div>

              {/* Despesas */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Minhas Despesas</h2>
                <Button variant="primary" onClick={() => setShowExpenseModal(true)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} />
                    Nova Despesa
                  </span>
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(18, 18, 26, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(250, 204, 21, 0.1)' }}>
                        <Receipt size={16} style={{ color: '#FACC15' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', margin: 0 }}>{expense.description}</p>
                        <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>{expense.category} • {new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#EF4444' }}>- R$ {expense.amount.toLocaleString('pt-BR')}</span>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/expenses/${expense.id}`, { method: 'DELETE' })
                            if (response.ok) {
                              setExpenses(prev => prev.filter(e => e.id !== expense.id))
                              showToast('Despesa removida', 'info')
                            } else {
                              showToast('Erro ao remover despesa', 'error')
                            }
                          } catch (error) {
                            showToast('Erro ao remover despesa', 'error')
                          }
                        }}
                        style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'agenda' && (
            <motion.div
              key="agenda"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}
            >
              {/* Tarefas do Dia */}
              <div style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'rgba(18, 18, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Tarefas do Dia</h3>
                  <button
                    onClick={() => {
                      const title = prompt('Digite a tarefa:')
                      if (title) {
                        setTasks(prev => [...prev, { id: Date.now().toString(), title, completed: false, date: new Date().toISOString().split('T')[0] }])
                        showToast('Tarefa adicionada!', 'success')
                      }
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: 'none',
                      color: '#3B82F6',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                      }}
                    >
                      {task.completed ? (
                        <CheckCircle size={18} style={{ color: '#10B981' }} />
                      ) : (
                        <Circle size={18} style={{ color: '#6B6B7B' }} />
                      )}
                      <span style={{
                        fontSize: '14px',
                        flex: 1,
                        color: task.completed ? '#6B6B7B' : '#FFFFFF',
                        textDecoration: task.completed ? 'line-through' : 'none',
                      }}>
                        {task.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setTasks(prev => prev.filter(t => t.id !== task.id))
                        }}
                        style={{ padding: '4px', borderRadius: '4px', backgroundColor: 'transparent', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compromissos */}
              <div style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'rgba(18, 18, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Compromissos</h3>
                  <Button variant="secondary" size="sm" onClick={() => setShowAppointmentModal(true)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Plus size={14} />
                      Agendar
                    </span>
                  </Button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', margin: 0, marginBottom: '8px' }}>{apt.title}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#6B6B7B' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} />
                              {new Date(apt.date).toLocaleDateString('pt-BR')}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} />
                              {apt.time}
                            </span>
                          </div>
                        </div>
                        {apt.reminder && (
                          <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(250, 204, 21, 0.1)' }}>
                            <Bell size={14} style={{ color: '#FACC15' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'productivity' && (
            <motion.div
              key="productivity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Timer Online */}
              <div style={{
                padding: '24px',
                borderRadius: '16px',
                background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                marginBottom: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#A0A0B0', margin: 0, marginBottom: '4px' }}>Tempo online hoje</p>
                    <p style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace', margin: 0 }}>{formatTime(onlineTime)}</p>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Timer size={32} style={{ color: '#3B82F6' }} />
                  </div>
                </div>
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>
                    Continue assim! Você está {onlineTime > 28800 ? 'acima' : 'abaixo'} da sua meta diária de 8 horas.
                  </p>
                  {/* Botões do Cronômetro */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => showToast('Trabalho iniciado!', 'success')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#10B981',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      <Play size={14} />
                      Iniciar
                    </button>
                    <button
                      onClick={() => showToast('Trabalho pausado', 'info')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(250, 204, 21, 0.2)',
                        border: '1px solid rgba(250, 204, 21, 0.3)',
                        color: '#FACC15',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      <Pause size={14} />
                      Pausar
                    </button>
                    <button
                      onClick={() => showToast('Trabalho finalizado!', 'success')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#EF4444',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      <Square size={14} />
                      Finalizar
                    </button>
                  </div>
                </div>
              </div>

              {/* Gráfico de Produtividade */}
              <div style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'rgba(18, 18, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0, marginBottom: '16px' }}>Horas Trabalhadas por Dia</h3>
                <div style={{ height: '256px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Timer size={32} style={{ color: '#3B3B4B', marginBottom: '12px' }} />
                  <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Nenhum registro de tempo</p>
                  <p style={{ fontSize: '12px', color: '#4B4B5B', margin: 0, marginTop: '4px' }}>Use o timer acima para registrar suas horas</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>0h</p>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Esta semana</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#3B82F6', margin: 0 }}>0h</p>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Média diária</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#6B6B7B', margin: 0 }}>--</p>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>vs semana anterior</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(18, 18, 26, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '8px' }}>Total de Orçamentos</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{quotes.length}</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(18, 18, 26, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '8px' }}>Aceitos</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#10B981', margin: 0 }}>{quotes.filter(q => q.status === 'accepted').length}</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(18, 18, 26, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '8px' }}>Pendentes</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#FACC15', margin: 0 }}>{quotes.filter(q => ['sent', 'viewed', 'draft'].includes(q.status)).length}</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(18, 18, 26, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '8px' }}>Valor Total Aceito</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#3B82F6', margin: 0 }}>R$ {quotes.filter(q => q.status === 'accepted').reduce((acc, q) => acc + q.total, 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Meus Orçamentos</h2>
                <Button variant="primary" onClick={() => { resetQuoteForm(); setShowQuoteModal(true); }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} />
                    Novo Orçamento
                  </span>
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {quotes.map((quote, index) => (
                  <motion.div
                    key={quote.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(18, 18, 26, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: 'linear-gradient(to bottom right, #FACC15, #EAB308)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <FileText size={20} style={{ color: '#12121A' }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{quote.number}</h3>
                            <Badge variant={getQuoteStatusVariant(quote.status)}>{getQuoteStatusLabel(quote.status)}</Badge>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B6B7B' }}>
                              <Building2 size={12} />
                              {quote.client.name}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B6B7B' }}>
                              <Mail size={12} />
                              {quote.client.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '20px', fontWeight: 700, color: '#3B82F6', margin: 0 }}>R$ {quote.total.toLocaleString('pt-BR')}</p>
                        <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Válido até {new Date(quote.validUntil).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    {/* Services summary */}
                    <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', marginBottom: '16px' }}>
                      <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '8px' }}>Serviços incluídos:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {quote.services.map((service, idx) => (
                          <span key={idx} style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', fontSize: '11px', color: '#3B82F6' }}>
                            {service.name} {service.quantity > 1 ? `x${service.quantity}` : ''}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6B6B7B' }}>
                          Criado em {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        {quote.sentAt && (
                          <span style={{ fontSize: '12px', color: '#6B6B7B' }}>
                            | Enviado em {new Date(quote.sentAt).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => { generateQuotePDF(quote); showToast('PDF gerado com sucesso!', 'success'); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3B82F6', fontSize: '12px', cursor: 'pointer' }}
                        >
                          <Download size={14} />
                          PDF
                        </button>
                        <button
                          onClick={() => handleSendQuote(quote, 'email')}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: 'none', color: '#10B981', fontSize: '12px', cursor: 'pointer' }}
                        >
                          <Mail size={14} />
                          Email
                        </button>
                        <button
                          onClick={() => handleSendQuote(quote, 'whatsapp')}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(37, 211, 102, 0.1)', border: 'none', color: '#25D366', fontSize: '12px', cursor: 'pointer' }}
                        >
                          <MessageCircle size={14} />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(quote.id)}
                          style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {quotes.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      margin: '0 auto 16px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FileText size={32} style={{ color: '#6B6B7B' }} />
                    </div>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '8px' }}>Nenhum orçamento criado</p>
                    <p style={{ fontSize: '12px', color: '#4B4B5B' }}>Crie seu primeiro orçamento clicando no botão acima</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal Novo/Editar Cliente */}
      <AnimatePresence>
        {showClientModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowClientModal(false); setEditingClient(null); setNewClient({ name: '', email: '', phone: '', contractStart: '', contractEnd: '', contractValue: '', notes: '' }); }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '512px',
                maxHeight: 'calc(100vh - 40px)',
                overflow: 'auto',
                backgroundColor: '#12121A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(to bottom right, #3B82F6, #1D4ED8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Users style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                      {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                    </h2>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>
                      {editingClient ? 'Atualize os dados do cliente' : 'Adicione um novo cliente'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowClientModal(false); setEditingClient(null); setNewClient({ name: '', email: '', phone: '', contractStart: '', contractEnd: '', contractValue: '', notes: '' }); }}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#6B6B7B',
                    cursor: 'pointer',
                  }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Empresa ABC"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@empresa.com"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Início do Contrato
                    </label>
                    <input
                      type="date"
                      value={newClient.contractStart}
                      onChange={(e) => setNewClient(prev => ({ ...prev, contractStart: e.target.value }))}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Fim do Contrato
                    </label>
                    <input
                      type="date"
                      value={newClient.contractEnd}
                      onChange={(e) => setNewClient(prev => ({ ...prev, contractEnd: e.target.value }))}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Valor Mensal (R$)
                  </label>
                  <input
                    type="number"
                    value={newClient.contractValue}
                    onChange={(e) => setNewClient(prev => ({ ...prev, contractValue: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Observações
                  </label>
                  <textarea
                    value={newClient.notes}
                    onChange={(e) => setNewClient(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Anotações sobre o cliente..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <Button type="button" variant="ghost" onClick={() => { setShowClientModal(false); setEditingClient(null); setNewClient({ name: '', email: '', phone: '', contractStart: '', contractEnd: '', contractValue: '', notes: '' }); }} style={{ flex: 1 }}>
                    Cancelar
                  </Button>
                  <Button type="button" variant="primary" onClick={handleAddClient} style={{ flex: 1 }}>
                    {editingClient ? 'Salvar Alterações' : 'Adicionar Cliente'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Nova Despesa */}
      <AnimatePresence>
        {showExpenseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExpenseModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '480px',
                maxHeight: 'calc(100vh - 40px)',
                overflow: 'auto',
                backgroundColor: '#12121A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(to bottom right, #F59E0B, #D97706)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Wallet style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Nova Despesa</h2>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Registre uma nova despesa</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExpenseModal(false)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#6B6B7B',
                    cursor: 'pointer',
                  }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Descrição *
                  </label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ex: Anúncios Meta Ads"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Valor (R$) *
                    </label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Data
                    </label>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Categoria
                  </label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="marketing">Marketing</option>
                    <option value="software">Software/Ferramentas</option>
                    <option value="equipe">Equipe</option>
                    <option value="escritorio">Escritório</option>
                    <option value="impostos">Impostos</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <Button type="button" variant="ghost" onClick={() => setShowExpenseModal(false)} style={{ flex: 1 }}>
                    Cancelar
                  </Button>
                  <Button type="button" variant="primary" onClick={handleAddExpense} style={{ flex: 1 }}>
                    Adicionar Despesa
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Novo Compromisso */}
      <AnimatePresence>
        {showAppointmentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAppointmentModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '448px',
                maxHeight: 'calc(100vh - 40px)',
                overflow: 'auto',
                backgroundColor: '#12121A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(to bottom right, #FACC15, #EAB308)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Calendar style={{ width: '20px', height: '20px', color: '#12121A' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Novo Compromisso</h2>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Agende um novo compromisso</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#6B6B7B',
                    cursor: 'pointer',
                  }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Título do Compromisso *
                  </label>
                  <input
                    type="text"
                    value={newAppointment.title}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Reunião com Cliente ABC"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Data *
                    </label>
                    <input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Horário *
                    </label>
                    <input
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <input
                    type="checkbox"
                    id="reminder"
                    checked={newAppointment.reminder}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, reminder: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="reminder" style={{ fontSize: '14px', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={16} style={{ color: '#FACC15' }} />
                    Ativar lembrete
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <Button type="button" variant="ghost" onClick={() => setShowAppointmentModal(false)} style={{ flex: 1 }}>
                    Cancelar
                  </Button>
                  <Button type="button" variant="primary" onClick={handleAddAppointment} style={{ flex: 1 }}>
                    Agendar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Novo Orçamento */}
      <AnimatePresence>
        {showQuoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuoteModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '800px',
                maxHeight: 'calc(100vh - 40px)',
                overflow: 'auto',
                backgroundColor: '#12121A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(to bottom right, #FACC15, #EAB308)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FileText style={{ width: '20px', height: '20px', color: '#12121A' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Novo Orçamento</h2>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Crie um orçamento para seu cliente</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#6B6B7B',
                    cursor: 'pointer',
                  }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Client Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Selecionar Cliente *
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name} - {client.email}</option>
                    ))}
                  </select>
                </div>

                {/* Services Section */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Adicionar Serviços
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {serviceTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => addServiceToQuote(template)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#3B82F6',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={14} />
                        {template.name}
                      </button>
                    ))}
                  </div>

                  {/* Selected Services */}
                  {quoteServices.length > 0 && (
                    <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#6B6B7B', fontWeight: 500 }}>Serviço</th>
                            <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#6B6B7B', fontWeight: 500, width: '80px' }}>Qtd</th>
                            <th style={{ textAlign: 'right', padding: '12px', fontSize: '12px', color: '#6B6B7B', fontWeight: 500, width: '120px' }}>Preço Unit.</th>
                            <th style={{ textAlign: 'right', padding: '12px', fontSize: '12px', color: '#6B6B7B', fontWeight: 500, width: '120px' }}>Total</th>
                            <th style={{ padding: '12px', width: '40px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {quoteServices.map(service => (
                            <tr key={service.id} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <td style={{ padding: '12px' }}>
                                <p style={{ fontSize: '14px', color: '#FFFFFF', margin: 0 }}>{service.name}</p>
                                <p style={{ fontSize: '11px', color: '#6B6B7B', margin: 0 }}>{service.description}</p>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <input
                                  type="number"
                                  min="1"
                                  value={service.quantity}
                                  onChange={(e) => updateServiceQuantity(service.id, parseInt(e.target.value) || 1)}
                                  style={{
                                    width: '60px',
                                    height: '32px',
                                    padding: '0 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    textAlign: 'center',
                                    outline: 'none',
                                  }}
                                />
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={service.unitPrice}
                                  onChange={(e) => updateServicePrice(service.id, parseFloat(e.target.value) || 0)}
                                  style={{
                                    width: '100px',
                                    height: '32px',
                                    padding: '0 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    textAlign: 'right',
                                    outline: 'none',
                                  }}
                                />
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#3B82F6' }}>R$ {service.total.toLocaleString('pt-BR')}</span>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <button
                                  onClick={() => removeServiceFromQuote(service.id)}
                                  style={{
                                    padding: '6px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    border: 'none',
                                    color: '#EF4444',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Discount */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Desconto
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={quoteDiscount.value}
                      onChange={(e) => setQuoteDiscount(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Tipo de Desconto
                    </label>
                    <select
                      value={quoteDiscount.type}
                      onChange={(e) => setQuoteDiscount(prev => ({ ...prev, type: e.target.value as 'percent' | 'fixed' }))}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="percent">Porcentagem (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Validade (dias)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quoteValidDays}
                      onChange={(e) => setQuoteValidDays(parseInt(e.target.value) || 15)}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Notes and Payment Terms */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Observações
                    </label>
                    <textarea
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      placeholder="Observações adicionais..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                      Condições de Pagamento
                    </label>
                    <textarea
                      value={quotePaymentTerms}
                      onChange={(e) => setQuotePaymentTerms(e.target.value)}
                      placeholder="Ex: Pagamento à vista ou parcelado em 3x"
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Total Summary */}
                {quoteServices.length > 0 && (
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#A0A0B0' }}>Subtotal:</span>
                      <span style={{ fontSize: '14px', color: '#FFFFFF' }}>R$ {calculateQuoteTotal().subtotal.toLocaleString('pt-BR')}</span>
                    </div>
                    {quoteDiscount.value > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#A0A0B0' }}>Desconto ({quoteDiscount.type === 'percent' ? `${quoteDiscount.value}%` : `R$ ${quoteDiscount.value}`}):</span>
                        <span style={{ fontSize: '14px', color: '#EF4444' }}>- R$ {calculateQuoteTotal().discount.toLocaleString('pt-BR')}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <span style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>Total:</span>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#3B82F6' }}>R$ {calculateQuoteTotal().total.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <Button type="button" variant="ghost" onClick={() => setShowQuoteModal(false)} style={{ flex: 1 }}>
                    Cancelar
                  </Button>
                  <Button type="button" variant="primary" onClick={handleCreateQuote} style={{ flex: 1 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} />
                      Criar Orçamento
                    </span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
