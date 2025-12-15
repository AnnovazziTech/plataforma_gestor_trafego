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

const mockClients: Client[] = [
  { id: '1', name: 'Empresa ABC', email: 'contato@abc.com', phone: '(11) 99999-1234', contractStart: '2024-01-01', contractEnd: '2024-12-31', contractValue: 5000, notes: 'Cliente premium', status: 'active' },
  { id: '2', name: 'Loja XYZ', email: 'loja@xyz.com', phone: '(11) 98888-5678', contractStart: '2024-03-15', contractEnd: '2024-09-15', contractValue: 3500, notes: 'Foco em e-commerce', status: 'active' },
  { id: '3', name: 'Tech Solutions', email: 'tech@solutions.com', phone: '(11) 97777-9012', contractStart: '2024-06-01', contractEnd: '2025-06-01', contractValue: 8000, notes: 'Contrato anual', status: 'pending' },
]

const mockExpenses: Expense[] = [
  { id: '1', description: 'Ferramentas de Marketing', amount: 299, category: 'Software', date: '2024-01-15' },
  { id: '2', description: 'Assinatura Semrush', amount: 499, category: 'Software', date: '2024-01-10' },
  { id: '3', description: 'Curso de Tráfego', amount: 1997, category: 'Educação', date: '2024-01-05' },
]

const revenueData = [
  { month: 'Jan', receita: 15000, despesas: 3500 },
  { month: 'Fev', receita: 18000, despesas: 4200 },
  { month: 'Mar', receita: 22000, despesas: 3800 },
  { month: 'Abr', receita: 19500, despesas: 4500 },
  { month: 'Mai', receita: 25000, despesas: 4100 },
  { month: 'Jun', receita: 28000, despesas: 5200 },
]

const productivityData = [
  { day: 'Seg', hours: 8.5 },
  { day: 'Ter', hours: 7.2 },
  { day: 'Qua', hours: 9.1 },
  { day: 'Qui', hours: 6.8 },
  { day: 'Sex', hours: 8.0 },
  { day: 'Sáb', hours: 4.5 },
  { day: 'Dom', hours: 2.0 },
]

type TabType = 'clients' | 'finances' | 'agenda' | 'productivity' | 'budget'

export default function AdminPage() {
  const { showToast, connectedAccounts } = useApp()
  const [activeTab, setActiveTab] = useState<TabType>('clients')
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Revisar campanhas do cliente ABC', completed: false, date: new Date().toISOString().split('T')[0] },
    { id: '2', title: 'Enviar relatório semanal', completed: true, date: new Date().toISOString().split('T')[0] },
    { id: '3', title: 'Reunião com novo cliente', completed: false, date: new Date().toISOString().split('T')[0] },
  ])
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', title: 'Reunião com Cliente ABC', date: '2024-02-15', time: '10:00', reminder: true },
    { id: '2', title: 'Call de Alinhamento', date: '2024-02-16', time: '14:30', reminder: true },
  ])
  const [showClientModal, setShowClientModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
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

  // Simular tempo online
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

  const handleAddClient = () => {
    if (!newClient.name.trim()) {
      showToast('Por favor, informe o nome do cliente', 'error')
      return
    }
    if (!newClient.email.trim()) {
      showToast('Por favor, informe o email do cliente', 'error')
      return
    }

    const client: Client = {
      id: Date.now().toString(),
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      contractStart: newClient.contractStart || new Date().toISOString().split('T')[0],
      contractEnd: newClient.contractEnd || '',
      contractValue: parseFloat(newClient.contractValue) || 0,
      notes: newClient.notes,
      status: 'pending',
    }

    setClients(prev => [...prev, client])
    setShowClientModal(false)
    setNewClient({ name: '', email: '', phone: '', contractStart: '', contractEnd: '', contractValue: '', notes: '' })
    showToast('Cliente adicionado com sucesso!', 'success')
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
                <Button variant="primary" onClick={() => setShowClientModal(true)}>
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
                          <button style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setClients(prev => prev.filter(c => c.id !== client.id))
                              showToast('Cliente removido', 'info')
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
                <div style={{ height: '256px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="receita" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="despesas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#6B6B7B" fontSize={12} />
                      <YAxis stroke="#6B6B7B" fontSize={12} tickFormatter={(v) => `R$${v/1000}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="receita" stroke="#3B82F6" fill="url(#receita)" strokeWidth={2} />
                      <Area type="monotone" dataKey="despesas" stroke="#FACC15" fill="url(#despesas)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
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
                        onClick={() => setExpenses(prev => prev.filter(e => e.id !== expense.id))}
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
                <div style={{ height: '256px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" stroke="#6B6B7B" fontSize={12} />
                      <YAxis stroke="#6B6B7B" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`${value}h`, 'Horas']}
                      />
                      <Bar dataKey="hours" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>46h</p>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Esta semana</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#3B82F6', margin: 0 }}>8.2h</p>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Média diária</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#10B981', margin: 0 }}>+12%</p>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Controle de Orçamento dos Clientes</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {connectedAccounts.filter(a => a.connected).map((account, idx) => {
                  const dailyBudget = 150 + idx * 50
                  const totalSpent = dailyBudget * 15
                  const totalBudget = dailyBudget * 30
                  const progress = (totalSpent / totalBudget) * 100

                  return (
                    <div
                      key={account.id}
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(18, 18, 26, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                            <Target size={18} style={{ color: '#3B82F6' }} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', margin: 0 }}>{account.name}</h3>
                            <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Conectado em {account.connectedAt}</p>
                          </div>
                        </div>
                        <Badge variant="success">Ativo</Badge>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '4px' }}>Orçamento Diário</p>
                          <p style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>R$ {dailyBudget}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '4px' }}>Gasto Total</p>
                          <p style={{ fontSize: '18px', fontWeight: 600, color: '#FACC15', margin: 0 }}>R$ {totalSpent.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '4px' }}>Orçamento Disponível</p>
                          <p style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>R$ {totalBudget.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, marginBottom: '4px' }}>Finalizará em:</p>
                          <p style={{ fontSize: '18px', fontWeight: 600, color: '#3B82F6', margin: 0 }}>15 dias</p>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                          <span style={{ color: '#6B6B7B' }}>Progresso do Orçamento</span>
                          <span style={{ color: '#FFFFFF' }}>{progress.toFixed(0)}%</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1 }}
                            style={{
                              height: '100%',
                              borderRadius: '9999px',
                              backgroundColor: progress > 80 ? '#EF4444' : progress > 50 ? '#FACC15' : '#3B82F6',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}

                {connectedAccounts.filter(a => a.connected).length === 0 && (
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
                      <Target size={32} style={{ color: '#6B6B7B' }} />
                    </div>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '8px' }}>Nenhuma conta conectada</p>
                    <p style={{ fontSize: '12px', color: '#4B4B5B' }}>Conecte suas contas de anúncios para ver o controle de orçamento</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal Novo Cliente */}
      <AnimatePresence>
        {showClientModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowClientModal(false)}
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
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Novo Cliente</h2>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Adicione um novo cliente</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowClientModal(false)}
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
                  <Button type="button" variant="ghost" onClick={() => setShowClientModal(false)} style={{ flex: 1 }}>
                    Cancelar
                  </Button>
                  <Button type="button" variant="primary" onClick={handleAddClient} style={{ flex: 1 }}>
                    Adicionar Cliente
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
