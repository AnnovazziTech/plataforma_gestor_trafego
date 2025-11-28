'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, StatCard } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
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

export default function AdminPage() {
  const { showToast, connectedAccounts } = useApp()
  const [activeTab, setActiveTab] = useState<'clients' | 'finances' | 'agenda' | 'productivity' | 'budget'>('clients')
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

  return (
    <div className="min-h-screen">
      <Header
        title="Administração"
        subtitle="Gerencie seus clientes, finanças e produtividade"
        showCreateButton={false}
      />

      <main className="p-6 md:p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30'
                  : 'bg-white/5 text-[#A0A0B0] border border-white/10 hover:border-white/20'
              }`}
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Meus Clientes</h2>
                <Button variant="primary" className="gap-2" onClick={() => setShowClientModal(true)}>
                  <Plus size={16} />
                  Novo Cliente
                </Button>
              </div>

              <div className="grid gap-4">
                {clients.map((client) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-5 rounded-2xl bg-[#12121A]/80 border border-white/5 hover:border-[#3B82F6]/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white font-bold">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{client.name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-xs text-[#6B6B7B]">
                            <span className="flex items-center gap-1">
                              <Mail size={12} />
                              {client.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {client.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={client.status === 'active' ? 'success' : client.status === 'pending' ? 'warning' : 'default'}>
                          {client.status === 'active' ? 'Ativo' : client.status === 'pending' ? 'Pendente' : 'Inativo'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <button className="p-2 rounded-lg hover:bg-white/10 text-[#6B6B7B] hover:text-white transition-all">
                            <Edit size={14} />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-red-500/20 text-[#6B6B7B] hover:text-red-400 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
                      <div>
                        <p className="text-xs text-[#6B6B7B] mb-1">Início do Contrato</p>
                        <p className="text-sm text-white">{new Date(client.contractStart).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B6B7B] mb-1">Fim do Contrato</p>
                        <p className="text-sm text-white">{new Date(client.contractEnd).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B6B7B] mb-1">Valor Mensal</p>
                        <p className="text-sm font-semibold text-[#3B82F6]">R$ {client.contractValue.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    {client.notes && (
                      <div className="mt-3 p-3 rounded-lg bg-white/5">
                        <p className="text-xs text-[#6B6B7B]">
                          <FileText size={12} className="inline mr-1" />
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
              <div className="p-5 rounded-2xl bg-[#12121A]/80 border border-white/5 mb-6">
                <h3 className="text-sm font-semibold text-white mb-4">Receita x Despesas</h3>
                <div className="h-64">
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Minhas Despesas</h2>
                <Button variant="primary" className="gap-2" onClick={() => setShowExpenseModal(true)}>
                  <Plus size={16} />
                  Nova Despesa
                </Button>
              </div>

              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#12121A]/80 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#FACC15]/10">
                        <Receipt size={16} className="text-[#FACC15]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{expense.description}</p>
                        <p className="text-xs text-[#6B6B7B]">{expense.category} • {new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-red-400">- R$ {expense.amount.toLocaleString('pt-BR')}</span>
                      <button className="p-2 rounded-lg hover:bg-red-500/20 text-[#6B6B7B] hover:text-red-400 transition-all">
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
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Tarefas do Dia */}
              <div className="p-5 rounded-2xl bg-[#12121A]/80 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Tarefas do Dia</h3>
                  <button
                    onClick={() => {
                      const title = prompt('Digite a tarefa:')
                      if (title) {
                        setTasks(prev => [...prev, { id: Date.now().toString(), title, completed: false, date: new Date().toISOString().split('T')[0] }])
                        showToast('Tarefa adicionada!', 'success')
                      }
                    }}
                    className="p-2 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                      onClick={() => {
                        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
                      }}
                    >
                      {task.completed ? (
                        <CheckCircle size={18} className="text-emerald-400" />
                      ) : (
                        <Circle size={18} className="text-[#6B6B7B]" />
                      )}
                      <span className={`text-sm flex-1 ${task.completed ? 'line-through text-[#6B6B7B]' : 'text-white'}`}>
                        {task.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setTasks(prev => prev.filter(t => t.id !== task.id))
                        }}
                        className="p-1 rounded hover:bg-red-500/20 text-[#6B6B7B] hover:text-red-400 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compromissos */}
              <div className="p-5 rounded-2xl bg-[#12121A]/80 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Compromissos</h3>
                  <Button variant="secondary" size="sm" className="gap-1" onClick={() => setShowAppointmentModal(true)}>
                    <Plus size={14} />
                    Agendar
                  </Button>
                </div>

                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-white">{apt.title}</h4>
                          <div className="flex items-center gap-3 mt-2 text-xs text-[#6B6B7B]">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(apt.date).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {apt.time}
                            </span>
                          </div>
                        </div>
                        {apt.reminder && (
                          <div className="p-1.5 rounded-lg bg-[#FACC15]/10">
                            <Bell size={14} className="text-[#FACC15]" />
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
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 border border-[#3B82F6]/30 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0B0] mb-1">Tempo online hoje</p>
                    <p className="text-4xl font-bold text-white font-mono">{formatTime(onlineTime)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/10">
                    <Timer size={32} className="text-[#3B82F6]" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-[#6B6B7B]">
                    Continue assim! Você está {onlineTime > 28800 ? 'acima' : 'abaixo'} da sua meta diária de 8 horas.
                  </p>
                </div>
              </div>

              {/* Gráfico de Produtividade */}
              <div className="p-5 rounded-2xl bg-[#12121A]/80 border border-white/5">
                <h3 className="text-sm font-semibold text-white mb-4">Horas Trabalhadas por Dia</h3>
                <div className="h-64">
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
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">46h</p>
                    <p className="text-xs text-[#6B6B7B]">Esta semana</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#3B82F6]">8.2h</p>
                    <p className="text-xs text-[#6B6B7B]">Média diária</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-400">+12%</p>
                    <p className="text-xs text-[#6B6B7B]">vs semana anterior</p>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Controle de Orçamento dos Clientes</h2>
              </div>

              <div className="space-y-4">
                {connectedAccounts.filter(a => a.connected).map((account, idx) => {
                  const dailyBudget = 150 + idx * 50
                  const totalSpent = dailyBudget * 15
                  const totalBudget = dailyBudget * 30
                  const progress = (totalSpent / totalBudget) * 100

                  return (
                    <div
                      key={account.id}
                      className="p-5 rounded-2xl bg-[#12121A]/80 border border-white/5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#3B82F6]/10">
                            <Target size={18} className="text-[#3B82F6]" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{account.name}</h3>
                            <p className="text-xs text-[#6B6B7B]">Conectado em {account.connectedAt}</p>
                          </div>
                        </div>
                        <Badge variant="success">Ativo</Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-[#6B6B7B] mb-1">Orçamento Diário</p>
                          <p className="text-lg font-semibold text-white">R$ {dailyBudget}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B6B7B] mb-1">Gasto Total</p>
                          <p className="text-lg font-semibold text-[#FACC15]">R$ {totalSpent.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B6B7B] mb-1">Orçamento Total</p>
                          <p className="text-lg font-semibold text-white">R$ {totalBudget.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B6B7B] mb-1">Dias Restantes</p>
                          <p className="text-lg font-semibold text-[#3B82F6]">15 dias</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-[#6B6B7B]">Progresso do Orçamento</span>
                          <span className="text-white">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1 }}
                            className={`h-full rounded-full ${progress > 80 ? 'bg-red-500' : progress > 50 ? 'bg-[#FACC15]' : 'bg-[#3B82F6]'}`}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}

                {connectedAccounts.filter(a => a.connected).length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <Target className="w-8 h-8 text-[#6B6B7B]" />
                    </div>
                    <p className="text-sm text-[#6B6B7B] mb-2">Nenhuma conta conectada</p>
                    <p className="text-xs text-[#4B4B5B]">Conecte suas contas de anúncios para ver o controle de orçamento</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals would go here - simplified for brevity */}
    </div>
  )
}
