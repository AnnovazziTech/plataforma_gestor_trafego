'use client'

import { useState, ReactNode, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Button, Badge, StatCard } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  Zap,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  Target,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Bell,
  Settings,
  ArrowRight,
  Activity,
  ChevronDown,
  ChevronUp,
  Copy,
  Users,
  RefreshCw,
  UserX,
  MessageSquare,
  Mail,
  UserPlus,
  Filter,
} from 'lucide-react'
import { PlatformIcon } from '@/components/ui'
import { Automation } from '@/types'

const automationTypeLabels: Record<string, string> = {
  rule: 'Regra',
  schedule: 'Agendamento',
  trigger: 'Gatilho',
}

const automationTypeColors: Record<string, { bg: string; color: string }> = {
  rule: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' },
  schedule: { bg: 'rgba(96, 165, 250, 0.1)', color: '#60A5FA' },
  trigger: { bg: 'rgba(250, 204, 21, 0.1)', color: '#FACC15' },
}

const operatorLabels: Record<string, string> = {
  gt: 'maior que',
  lt: 'menor que',
  eq: 'igual a',
  gte: 'maior ou igual a',
  lte: 'menor ou igual a',
}

const actionLabels: Record<string, string> = {
  pause: 'Pausar',
  activate: 'Ativar',
  adjust_budget: 'Ajustar Budget',
  adjust_bid: 'Ajustar Lance',
  notify: 'Notificar',
}

const actionIcons: Record<string, ReactNode> = {
  pause: <Pause size={14} />,
  activate: <Play size={14} />,
  adjust_budget: <DollarSign size={14} />,
  adjust_bid: <TrendingUp size={14} />,
  notify: <Bell size={14} />,
}

// Mapeamento de operadores página -> API
const operatorToApi: Record<string, string> = {
  gt: 'greater_than',
  lt: 'less_than',
  eq: 'equal',
  gte: 'greater_equal',
  lte: 'less_equal',
}

// Mapeamento de operadores API -> página
const operatorFromApi: Record<string, string> = {
  greater_than: 'gt',
  less_than: 'lt',
  equal: 'eq',
  greater_equal: 'gte',
  less_equal: 'lte',
}

// Mapeamento de timeframe página -> API
const timeframeToApi: Record<string, string> = {
  hour: 'last_hour',
  day: 'last_day',
  week: 'last_week',
}

// Mapeamento de target página -> API
const targetToApi: Record<string, string> = {
  campaign: 'campaign',
  adset: 'ad_set',
  ad: 'ad',
}

// Lead automation constants
const leadStatusLabels: Record<string, string> = {
  NEW: 'Novo',
  CONTACTED: 'Contatado',
  QUALIFIED: 'Qualificado',
  PROPOSAL: 'Proposta',
  NEGOTIATION: 'Negociacao',
  WON: 'Ganho',
  LOST: 'Perdido',
  REMARKETING: 'Remarketing',
}

const leadAutomationTypeLabels: Record<string, string> = {
  lead_status_change: 'Mudanca de Status',
  lead_inactivity: 'Inatividade',
  lead_remarketing: 'Remarketing',
}

const leadAutomationTypeColors: Record<string, { bg: string; color: string }> = {
  lead_status_change: { bg: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' },
  lead_inactivity: { bg: 'rgba(251, 146, 60, 0.1)', color: '#FB923C' },
  lead_remarketing: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' },
}

const leadActionLabels: Record<string, string> = {
  change_status: 'Alterar Status',
  send_message: 'Enviar Mensagem',
  create_task: 'Criar Tarefa',
  notify: 'Notificar',
}

const leadActionIcons: Record<string, ReactNode> = {
  change_status: <RefreshCw size={14} />,
  send_message: <MessageSquare size={14} />,
  create_task: <Target size={14} />,
  notify: <Bell size={14} />,
}

interface LeadAutomation {
  id: string
  name: string
  type: 'lead_status_change' | 'lead_inactivity' | 'lead_remarketing'
  status: 'active' | 'paused'
  trigger: {
    fromStatus?: string
    toStatus?: string
    inactiveDays?: number
    lostDaysAgo?: number
  }
  action: {
    type: 'change_status' | 'send_message' | 'create_task' | 'notify'
    newStatus?: string
    messageTemplate?: string
    messageChannel?: string
    taskTitle?: string
    notificationMessage?: string
  }
  executionCount?: number
  lastExecutedAt?: string
  createdAt?: string
}

export default function AutomationPage() {
  const { automations, automationsLoading, fetchAutomations, addAutomation, updateAutomation, deleteAutomation, toggleAutomationStatus, showToast, connectedAccounts } = useApp()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Tab state
  const [activeTab, setActiveTab] = useState<'campaigns' | 'leads'>('campaigns')

  // Lead automations state
  const [leadAutomations, setLeadAutomations] = useState<LeadAutomation[]>([])
  const [leadAutomationsLoading, setLeadAutomationsLoading] = useState(false)
  const [leadStats, setLeadStats] = useState({ remarketingLeads: 0, recoverableLeads: 0 })
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [editingLeadAutomation, setEditingLeadAutomation] = useState<LeadAutomation | null>(null)
  const [showLeadDeleteConfirm, setShowLeadDeleteConfirm] = useState<string | null>(null)

  // Lead automation form state
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    type: 'lead_remarketing' as 'lead_status_change' | 'lead_inactivity' | 'lead_remarketing',
    triggerFromStatus: 'LOST',
    triggerToStatus: 'REMARKETING',
    triggerInactiveDays: 7,
    triggerLostDaysAgo: 30,
    actionType: 'change_status' as 'change_status' | 'send_message' | 'create_task' | 'notify',
    actionNewStatus: 'REMARKETING',
    actionMessageTemplate: '',
    actionMessageChannel: 'whatsapp' as 'whatsapp' | 'email' | 'sms',
    actionTaskTitle: '',
    actionNotificationMessage: '',
  })

  // Buscar automações ao montar o componente
  useEffect(() => {
    fetchAutomations()
    fetchLeadAutomations()
  }, [fetchAutomations])

  // Fetch lead automations
  const fetchLeadAutomations = async () => {
    setLeadAutomationsLoading(true)
    try {
      const response = await fetch('/api/automations/leads')
      if (response.ok) {
        const data = await response.json()
        setLeadAutomations(data.automations || [])
        setLeadStats({
          remarketingLeads: data.stats?.remarketingLeads || 0,
          recoverableLeads: data.stats?.recoverableLeads || 0,
        })
      }
    } catch (error) {
      console.error('Erro ao buscar automacoes de leads:', error)
    } finally {
      setLeadAutomationsLoading(false)
    }
  }

  // Create lead automation
  const handleCreateLeadAutomation = async () => {
    if (!leadFormData.name) {
      showToast('Nome obrigatorio', 'error')
      return
    }

    try {
      const payload: any = {
        name: leadFormData.name,
        type: leadFormData.type,
        status: 'active',
        trigger: {},
        action: { type: leadFormData.actionType },
      }

      // Configure trigger based on type
      if (leadFormData.type === 'lead_status_change') {
        payload.trigger.fromStatus = leadFormData.triggerFromStatus
        payload.trigger.toStatus = leadFormData.triggerToStatus
      } else if (leadFormData.type === 'lead_inactivity') {
        payload.trigger.inactiveDays = leadFormData.triggerInactiveDays
      } else if (leadFormData.type === 'lead_remarketing') {
        payload.trigger.lostDaysAgo = leadFormData.triggerLostDaysAgo
      }

      // Configure action based on type
      if (leadFormData.actionType === 'change_status') {
        payload.action.newStatus = leadFormData.actionNewStatus
      } else if (leadFormData.actionType === 'send_message') {
        payload.action.messageTemplate = leadFormData.actionMessageTemplate
        payload.action.messageChannel = leadFormData.actionMessageChannel
      } else if (leadFormData.actionType === 'create_task') {
        payload.action.taskTitle = leadFormData.actionTaskTitle
      } else if (leadFormData.actionType === 'notify') {
        payload.action.notificationMessage = leadFormData.actionNotificationMessage
      }

      const response = await fetch('/api/automations/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        showToast('Automacao de leads criada com sucesso!', 'success')
        setShowLeadModal(false)
        resetLeadForm()
        fetchLeadAutomations()
      } else {
        const error = await response.json()
        showToast(error.error || 'Erro ao criar automacao', 'error')
      }
    } catch (error) {
      showToast('Erro ao criar automacao de leads', 'error')
    }
  }

  // Process lead automations (manual trigger)
  const handleProcessLeadAutomations = async () => {
    try {
      const response = await fetch('/api/automations/leads/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (response.ok) {
        const data = await response.json()
        showToast(`Processadas ${data.processedLeads} leads, ${data.executedActions} acoes executadas`, 'success')
        fetchLeadAutomations()
      } else {
        showToast('Erro ao processar automacoes', 'error')
      }
    } catch (error) {
      showToast('Erro ao processar automacoes de leads', 'error')
    }
  }

  const resetLeadForm = () => {
    setLeadFormData({
      name: '',
      type: 'lead_remarketing',
      triggerFromStatus: 'LOST',
      triggerToStatus: 'REMARKETING',
      triggerInactiveDays: 7,
      triggerLostDaysAgo: 30,
      actionType: 'change_status',
      actionNewStatus: 'REMARKETING',
      actionMessageTemplate: '',
      actionMessageChannel: 'whatsapp',
      actionTaskTitle: '',
      actionNotificationMessage: '',
    })
  }

  // Form state for creating automation
  const [formData, setFormData] = useState({
    name: '',
    type: 'rule' as 'rule' | 'schedule' | 'trigger',
    conditionMetric: 'cpa',
    conditionOperator: 'gt',
    conditionValue: '',
    timeframe: 'day' as 'hour' | 'day' | 'week',
    actionType: 'pause' as 'pause' | 'activate' | 'adjust_budget' | 'adjust_bid' | 'notify',
    actionValue: '',
    target: 'campaign' as 'campaign' | 'adset' | 'ad',
    accountId: 'all' as string,
  })

  // Use automations from context with fallback to empty array
  const automationsData = useMemo(() => automations || [], [automations])

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'rule',
      conditionMetric: 'cpa',
      conditionOperator: 'gt',
      conditionValue: '',
      timeframe: 'day',
      actionType: 'pause',
      actionValue: '',
      target: 'campaign',
      accountId: 'all',
    })
  }

  const handleDuplicateTemplate = (template: { title: string; conditions: string; action: string }) => {
    handleTemplateClick(template)
    showToast('Template duplicado! Personalize e salve.', 'success')
  }

  const handleCreateAutomation = async () => {
    if (!formData.name || !formData.conditionValue) {
      showToast('Preencha todos os campos obrigatórios', 'error')
      return
    }

    try {
      await addAutomation({
        name: formData.name,
        type: formData.type,
        status: 'active',
        condition: {
          metric: formData.conditionMetric,
          operator: operatorToApi[formData.conditionOperator] || 'greater_than',
          value: parseFloat(formData.conditionValue),
        },
        period: timeframeToApi[formData.timeframe] || 'last_day',
        action: formData.actionType,
        actionValue: formData.actionValue ? parseFloat(formData.actionValue) : undefined,
        applyTo: targetToApi[formData.target] || 'campaign',
      })
      setShowCreateModal(false)
      resetForm()
      fetchAutomations() // Recarregar lista
    } catch (error) {
      // Erro já tratado no context
    }
  }

  const handleEditAutomation = (automation: Automation) => {
    setEditingAutomation(automation)
  }

  const handleSaveEdit = async () => {
    if (!editingAutomation) return
    try {
      await updateAutomation(editingAutomation.id, {
        name: editingAutomation.name,
        status: editingAutomation.status,
      })
      setEditingAutomation(null)
      fetchAutomations() // Recarregar lista
    } catch (error) {
      // Erro já tratado no context
    }
  }

  const handleDeleteAutomation = async (id: string) => {
    try {
      await deleteAutomation(id)
      setShowDeleteConfirm(null)
      fetchAutomations() // Recarregar lista
    } catch (error) {
      // Erro já tratado no context
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleAutomationStatus(id)
    } catch (error) {
      // Erro já tratado no context
    }
  }

  const handleTemplateClick = (template: { title: string; conditions: string; action: string }) => {
    // Pre-fill form based on template
    let metric = 'cpa'
    let operator = 'gt'
    let value = '50'
    let actionType = 'pause'

    if (template.title.includes('CPA')) {
      metric = 'cpa'
      operator = 'gt'
      value = '50'
      actionType = 'pause'
    } else if (template.title.includes('ROAS')) {
      metric = 'roas'
      operator = 'gte'
      value = '4'
      actionType = 'adjust_budget'
    } else if (template.title.includes('CTR')) {
      metric = 'ctr'
      operator = 'lt'
      value = '1'
      actionType = 'notify'
    } else if (template.title.includes('Frequência')) {
      metric = 'frequency'
      operator = 'gt'
      value = '5'
      actionType = 'pause'
    }

    setFormData({
      ...formData,
      name: template.title,
      conditionMetric: metric,
      conditionOperator: operator,
      conditionValue: value,
      actionType: actionType as any,
    })
    setShowCreateModal(true)
  }

  const totalTriggers = useMemo(() => automationsData.reduce((acc, a) => acc + (a.triggerCount || 0), 0), [automationsData])
  const activeAutomations = useMemo(() => automationsData.filter(a => a.status === 'active').length, [automationsData])

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        title="Automacao"
        subtitle="Configure regras e gatilhos automaticos para campanhas e leads"
      />

      <main style={{ padding: '24px 32px', paddingBottom: '80px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('campaigns')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              border: activeTab === 'campaigns' ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: activeTab === 'campaigns' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)',
              color: activeTab === 'campaigns' ? '#3B82F6' : '#A0A0B0',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Target size={18} />
            Campanhas
            <span style={{
              padding: '2px 8px',
              borderRadius: '10px',
              backgroundColor: activeTab === 'campaigns' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              fontSize: '12px',
            }}>
              {activeAutomations}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              border: activeTab === 'leads' ? '1px solid #A855F7' : '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: activeTab === 'leads' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255, 255, 255, 0.02)',
              color: activeTab === 'leads' ? '#A855F7' : '#A0A0B0',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <UserPlus size={18} />
            Leads / Remarketing
            <span style={{
              padding: '2px 8px',
              borderRadius: '10px',
              backgroundColor: activeTab === 'leads' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              fontSize: '12px',
            }}>
              {leadAutomations.filter(a => a.status === 'active').length}
            </span>
          </button>
        </div>

        {/* Campaign Automations Tab */}
        {activeTab === 'campaigns' && (
          <>
            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <StatCard
                label="Automacoes Ativas"
                value={activeAutomations}
                icon={Zap}
                color="blue"
                delay={0}
              />
              <StatCard
                label="Gatilhos Executados"
                value={totalTriggers}
                icon={Activity}
                color="yellow"
                delay={0.1}
              />
              <StatCard
                label="Campanhas Otimizadas"
                value={18}
                icon={Target}
                color="blue"
                delay={0.2}
              />
              <StatCard
                label="Economia Estimada"
                value="R$ 12.450"
                icon={DollarSign}
                color="yellow"
                delay={0.3}
              />
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Automacoes de Campanhas</h2>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} />
                  Nova Automacao
                </span>
              </Button>
            </div>
          </>
        )}

        {/* Lead Automations Tab */}
        {activeTab === 'leads' && (
          <>
            {/* Lead Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <StatCard
                label="Automacoes Ativas"
                value={leadAutomations.filter(a => a.status === 'active').length}
                icon={RefreshCw}
                color="blue"
                delay={0}
              />
              <StatCard
                label="Leads em Remarketing"
                value={leadStats.remarketingLeads}
                icon={UserPlus}
                color="yellow"
                delay={0.1}
              />
              <StatCard
                label="Leads Recuperaveis"
                value={leadStats.recoverableLeads}
                icon={UserX}
                color="blue"
                delay={0.2}
              />
              <StatCard
                label="Taxa de Recuperacao"
                value={leadStats.recoverableLeads > 0 ? `${Math.round((leadStats.remarketingLeads / leadStats.recoverableLeads) * 100)}%` : '0%'}
                icon={TrendingUp}
                color="yellow"
                delay={0.3}
              />
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Automacoes de Leads</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="secondary" onClick={handleProcessLeadAutomations}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Play size={18} />
                    Executar Agora
                  </span>
                </Button>
                <Button variant="primary" onClick={() => setShowLeadModal(true)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} />
                    Nova Regra
                  </span>
                </Button>
              </div>
            </div>

            {/* Lead Automations List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
              {leadAutomationsLoading ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    margin: '0 auto 16px',
                    border: '3px solid rgba(168, 85, 247, 0.2)',
                    borderTopColor: '#A855F7',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                  <p style={{ fontSize: '14px', color: '#6B6B7B' }}>Carregando automacoes...</p>
                </div>
              ) : leadAutomations.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    textAlign: 'center',
                    padding: '64px 24px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 16px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <RefreshCw size={32} style={{ color: '#A855F7' }} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                    Nenhuma automacao de leads
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                    Crie regras para mover leads automaticamente para remarketing, enviar mensagens de follow-up e recuperar vendas perdidas.
                  </p>
                  <Button variant="primary" onClick={() => setShowLeadModal(true)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Plus size={18} />
                      Criar Primeira Regra
                    </span>
                  </Button>
                </motion.div>
              ) : (
                leadAutomations.map((automation, index) => (
                  <LeadAutomationCard
                    key={automation.id}
                    automation={automation}
                    index={index}
                  />
                ))
              )}
            </div>

            {/* Lead Remarketing Templates */}
            <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>Templates de Remarketing</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  {
                    title: 'Recuperar Leads Perdidos',
                    description: 'Move leads perdidos ha 30 dias para remarketing automaticamente',
                    icon: RefreshCw,
                    color: 'purple',
                    type: 'lead_remarketing',
                    trigger: { lostDaysAgo: 30 },
                    action: { type: 'change_status', newStatus: 'REMARKETING' },
                  },
                  {
                    title: 'Reativar Inativos',
                    description: 'Notifica sobre leads sem atividade por 7 dias',
                    icon: Clock,
                    color: 'orange',
                    type: 'lead_inactivity',
                    trigger: { inactiveDays: 7 },
                    action: { type: 'notify', notificationMessage: 'Lead inativo ha 7 dias' },
                  },
                  {
                    title: 'Follow-up Automatico',
                    description: 'Envia mensagem quando lead muda para Proposta',
                    icon: MessageSquare,
                    color: 'blue',
                    type: 'lead_status_change',
                    trigger: { toStatus: 'PROPOSAL' },
                    action: { type: 'send_message', messageChannel: 'whatsapp' },
                  },
                ].map((template, index) => (
                  <motion.div
                    key={template.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    onClick={() => {
                      setLeadFormData({
                        ...leadFormData,
                        name: template.title,
                        type: template.type as any,
                        triggerLostDaysAgo: template.trigger.lostDaysAgo || 30,
                        triggerInactiveDays: template.trigger.inactiveDays || 7,
                        triggerToStatus: template.trigger.toStatus || 'REMARKETING',
                        actionType: template.action.type as any,
                        actionNewStatus: template.action.newStatus || 'REMARKETING',
                        actionNotificationMessage: template.action.notificationMessage || '',
                        actionMessageChannel: (template.action.messageChannel as any) || 'whatsapp',
                      })
                      setShowLeadModal(true)
                    }}
                    style={{
                      padding: '24px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      padding: '12px',
                      borderRadius: '12px',
                      marginBottom: '16px',
                      width: 'fit-content',
                      backgroundColor: template.color === 'purple' ? 'rgba(168, 85, 247, 0.1)' :
                        template.color === 'orange' ? 'rgba(251, 146, 60, 0.1)' :
                        'rgba(59, 130, 246, 0.1)',
                      color: template.color === 'purple' ? '#A855F7' :
                        template.color === 'orange' ? '#FB923C' :
                        '#3B82F6',
                    }}>
                      <template.icon size={20} />
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                      {template.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', marginBottom: '16px' }}>{template.description}</p>
                    <button
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        color: '#A855F7',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Copy size={14} />
                      Usar Template
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Campaign Automations Content (only when campaigns tab is active) */}
        {activeTab === 'campaigns' && (
          <>

        {/* Automations List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
          {automationsLoading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 16px',
                border: '3px solid rgba(59, 130, 246, 0.2)',
                borderTopColor: '#3B82F6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <p style={{ fontSize: '14px', color: '#6B6B7B' }}>Carregando automações...</p>
            </div>
          ) : automationsData.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: 'center',
                padding: '64px 24px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px',
                borderRadius: '16px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Zap size={32} style={{ color: '#3B82F6' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                Nenhuma automação criada
              </h3>
              <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                Crie regras automáticas para otimizar suas campanhas. Pause anúncios com CPA alto, escale campanhas com bom ROAS e muito mais.
              </p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} />
                  Criar Primeira Automação
                </span>
              </Button>
            </motion.div>
          ) : (
            automationsData.map((automation, index) => (
              <AutomationCard
                key={automation.id}
                automation={automation as Automation}
                index={index}
                onEdit={handleEditAutomation}
                onDelete={(id) => setShowDeleteConfirm(id)}
                onToggleStatus={handleToggleStatus}
              />
            ))
          )}
        </div>

        {/* Quick Templates */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>Templates Populares</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              {
                title: 'Pausar CPA Alto',
                description: 'Pausa automaticamente campanhas com custo por aquisição acima do limite',
                icon: AlertTriangle,
                color: 'red',
                conditions: 'CPA > R$50 por 3 dias',
                action: 'Pausar campanha',
              },
              {
                title: 'Escalar ROAS Alto',
                description: 'Aumenta o budget de campanhas com alto retorno sobre investimento',
                icon: TrendingUp,
                color: 'blue',
                conditions: 'ROAS >= 4x por 7 dias',
                action: 'Aumentar budget em 20%',
              },
              {
                title: 'Alerta CTR Baixo',
                description: 'Envia notificação quando a taxa de cliques cai abaixo do esperado',
                icon: Bell,
                color: 'yellow',
                conditions: 'CTR < 1% com 10K+ impressões',
                action: 'Enviar notificação',
              },
              {
                title: 'Redistribuir Budget',
                description: 'Move budget de campanhas ruins para as melhores automaticamente',
                icon: DollarSign,
                color: 'blue',
                conditions: 'Performance relativa',
                action: 'Redistribuir budget',
              },
              {
                title: 'Pausar Frequência Alta',
                description: 'Pausa anúncios quando a frequência fica muito alta',
                icon: Activity,
                color: 'yellow',
                conditions: 'Frequência > 5x',
                action: 'Pausar anúncio',
              },
              {
                title: 'Otimizar Lances',
                description: 'Ajusta lances automaticamente baseado em performance',
                icon: Settings,
                color: 'blue',
                conditions: 'Conversões por hora',
                action: 'Ajustar lance CPA',
              },
            ].map((template, index) => (
              <motion.div
                key={template.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                onClick={() => handleTemplateClick(template)}
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  width: 'fit-content',
                  backgroundColor: template.color === 'red' ? 'rgba(239, 68, 68, 0.1)' :
                    template.color === 'blue' ? 'rgba(59, 130, 246, 0.1)' :
                    'rgba(250, 204, 21, 0.1)',
                  color: template.color === 'red' ? '#EF4444' :
                    template.color === 'blue' ? '#3B82F6' :
                    '#FACC15',
                }}>
                  <template.icon size={20} />
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                  {template.title}
                </h3>
                <p style={{ fontSize: '12px', color: '#6B6B7B', marginBottom: '16px' }}>{template.description}</p>
                <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Condição:</span>
                    <span style={{ fontSize: '12px', color: '#A0A0B0' }}>{template.conditions}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Então:</span>
                    <span style={{ fontSize: '12px', color: '#3B82F6' }}>{template.action}</span>
                  </div>
                  {/* Botão Duplicar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDuplicateTemplate(template)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      color: '#A855F7',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)'
                    }}
                  >
                    <Copy size={14} />
                    Duplicar Template
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
          </>
        )}
      </main>

      {/* Lead Automation Modal */}
      <AnimatePresence>
        {showLeadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLeadModal(false)}
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
                maxWidth: '600px',
                maxHeight: 'calc(100vh - 40px)',
                overflow: 'auto',
                backgroundColor: '#12121A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(to bottom right, #A855F7, #7C3AED)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <RefreshCw style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Nova Regra de Remarketing</h2>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Configure automacao para leads</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLeadModal(false)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#6B6B7B',
                    cursor: 'pointer',
                  }}
                >
                  <Plus style={{ width: '20px', height: '20px', transform: 'rotate(45deg)' }} />
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Nome da Regra
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Recuperar Leads Perdidos"
                    value={leadFormData.name}
                    onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
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

                {/* Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Tipo de Gatilho
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'lead_remarketing', label: 'Remarketing', icon: RefreshCw, description: 'Leads perdidos' },
                      { id: 'lead_inactivity', label: 'Inatividade', icon: Clock, description: 'Sem atividade' },
                      { id: 'lead_status_change', label: 'Status', icon: Target, description: 'Mudanca de status' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setLeadFormData({ ...leadFormData, type: type.id as any })}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: leadFormData.type === type.id ? '1px solid #A855F7' : '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: leadFormData.type === type.id ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <type.icon size={20} style={{ color: leadFormData.type === type.id ? '#A855F7' : '#6B6B7B' }} />
                        <span style={{ fontSize: '12px', fontWeight: 500 }}>{type.label}</span>
                        <span style={{ fontSize: '10px', color: '#6B6B7B' }}>{type.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trigger Configuration */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Configuracao do Gatilho
                  </label>

                  {leadFormData.type === 'lead_remarketing' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: '#A0A0B0', fontSize: '14px' }}>Leads perdidos ha</span>
                      <input
                        type="number"
                        value={leadFormData.triggerLostDaysAgo}
                        onChange={(e) => setLeadFormData({ ...leadFormData, triggerLostDaysAgo: parseInt(e.target.value) || 30 })}
                        style={{
                          width: '80px',
                          height: '40px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          outline: 'none',
                          textAlign: 'center',
                        }}
                      />
                      <span style={{ color: '#A0A0B0', fontSize: '14px' }}>dias</span>
                    </div>
                  )}

                  {leadFormData.type === 'lead_inactivity' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: '#A0A0B0', fontSize: '14px' }}>Leads sem atividade por</span>
                      <input
                        type="number"
                        value={leadFormData.triggerInactiveDays}
                        onChange={(e) => setLeadFormData({ ...leadFormData, triggerInactiveDays: parseInt(e.target.value) || 7 })}
                        style={{
                          width: '80px',
                          height: '40px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          outline: 'none',
                          textAlign: 'center',
                        }}
                      />
                      <span style={{ color: '#A0A0B0', fontSize: '14px' }}>dias</span>
                    </div>
                  )}

                  {leadFormData.type === 'lead_status_change' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#A0A0B0', fontSize: '14px' }}>Quando mudar de</span>
                      <select
                        value={leadFormData.triggerFromStatus}
                        onChange={(e) => setLeadFormData({ ...leadFormData, triggerFromStatus: e.target.value })}
                        style={{
                          height: '40px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      >
                        {Object.entries(leadStatusLabels).map(([value, label]) => (
                          <option key={value} value={value} style={{ backgroundColor: '#12121A' }}>{label}</option>
                        ))}
                      </select>
                      <span style={{ color: '#A0A0B0', fontSize: '14px' }}>para</span>
                      <select
                        value={leadFormData.triggerToStatus}
                        onChange={(e) => setLeadFormData({ ...leadFormData, triggerToStatus: e.target.value })}
                        style={{
                          height: '40px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      >
                        {Object.entries(leadStatusLabels).map(([value, label]) => (
                          <option key={value} value={value} style={{ backgroundColor: '#12121A' }}>{label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Action Configuration */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Acao a Executar
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
                    {[
                      { id: 'change_status', label: 'Alterar Status', icon: RefreshCw },
                      { id: 'send_message', label: 'Enviar Mensagem', icon: MessageSquare },
                      { id: 'create_task', label: 'Criar Tarefa', icon: Target },
                      { id: 'notify', label: 'Notificar', icon: Bell },
                    ].map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => setLeadFormData({ ...leadFormData, actionType: action.id as any })}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: leadFormData.actionType === action.id ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: leadFormData.actionType === action.id ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <action.icon size={16} style={{ color: leadFormData.actionType === action.id ? '#10B981' : '#6B6B7B' }} />
                        <span style={{ fontSize: '14px' }}>{action.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Action Details */}
                  {leadFormData.actionType === 'change_status' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: '#A0A0B0', fontSize: '14px' }}>Mudar para:</span>
                      <select
                        value={leadFormData.actionNewStatus}
                        onChange={(e) => setLeadFormData({ ...leadFormData, actionNewStatus: e.target.value })}
                        style={{
                          height: '40px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      >
                        {Object.entries(leadStatusLabels).map(([value, label]) => (
                          <option key={value} value={value} style={{ backgroundColor: '#12121A' }}>{label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {leadFormData.actionType === 'send_message' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: '#A0A0B0', fontSize: '14px' }}>Canal:</span>
                        <select
                          value={leadFormData.actionMessageChannel}
                          onChange={(e) => setLeadFormData({ ...leadFormData, actionMessageChannel: e.target.value as any })}
                          style={{
                            height: '40px',
                            padding: '0 12px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            outline: 'none',
                          }}
                        >
                          <option value="whatsapp" style={{ backgroundColor: '#12121A' }}>WhatsApp</option>
                          <option value="email" style={{ backgroundColor: '#12121A' }}>Email</option>
                          <option value="sms" style={{ backgroundColor: '#12121A' }}>SMS</option>
                        </select>
                      </div>
                      <textarea
                        placeholder="Template da mensagem..."
                        value={leadFormData.actionMessageTemplate}
                        onChange={(e) => setLeadFormData({ ...leadFormData, actionMessageTemplate: e.target.value })}
                        style={{
                          width: '100%',
                          height: '80px',
                          padding: '12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          outline: 'none',
                          resize: 'none',
                        }}
                      />
                    </div>
                  )}

                  {leadFormData.actionType === 'create_task' && (
                    <input
                      type="text"
                      placeholder="Titulo da tarefa..."
                      value={leadFormData.actionTaskTitle}
                      onChange={(e) => setLeadFormData({ ...leadFormData, actionTaskTitle: e.target.value })}
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}

                  {leadFormData.actionType === 'notify' && (
                    <input
                      type="text"
                      placeholder="Mensagem da notificacao..."
                      value={leadFormData.actionNotificationMessage}
                      onChange={(e) => setLeadFormData({ ...leadFormData, actionNotificationMessage: e.target.value })}
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <Button type="button" variant="ghost" onClick={() => { setShowLeadModal(false); resetLeadForm(); }} style={{ flex: 1 }}>
                    Cancelar
                  </Button>
                  <Button type="button" variant="primary" onClick={handleCreateLeadAutomation} style={{ flex: 1 }}>
                    Criar Regra
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Automation Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
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
                maxWidth: '600px',
                maxHeight: 'calc(100vh - 40px)',
                overflow: 'auto',
                backgroundColor: '#12121A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(to bottom right, #3B82F6, #1D4ED8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Zap style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Nova Automação</h2>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Configure regras automáticas</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#6B6B7B',
                    cursor: 'pointer',
                  }}
                >
                  <Plus style={{ width: '20px', height: '20px', transform: 'rotate(45deg)' }} />
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Nome da Automação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Pausar CPA Alto"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

                {/* Account Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Selecionar Conta
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={formData.accountId}
                      onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 16px',
                        paddingLeft: '44px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="all" style={{ backgroundColor: '#12121A' }}>Todas as Contas</option>
                      {connectedAccounts.filter(a => a.connected).map((account) => (
                        <option key={account.id} value={account.id} style={{ backgroundColor: '#12121A' }}>
                          {account.name} ({account.platform})
                        </option>
                      ))}
                    </select>
                    <Users
                      size={18}
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#FACC15',
                        pointerEvents: 'none',
                      }}
                    />
                    <ChevronDown
                      size={16}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6B6B7B',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Tipo de Automação
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'rule', label: 'Regra', icon: Target },
                      { id: 'schedule', label: 'Agendamento', icon: Clock },
                      { id: 'trigger', label: 'Gatilho', icon: Zap },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.id as any })}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: formData.type === type.id ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: formData.type === type.id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <type.icon size={20} style={{ color: formData.type === type.id ? '#3B82F6' : '#6B6B7B' }} />
                        <span style={{ fontSize: '12px' }}>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Condição
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={formData.conditionMetric}
                      onChange={(e) => setFormData({ ...formData, conditionMetric: e.target.value })}
                      style={{
                        flex: 1,
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    >
                      <option value="cpa" style={{ backgroundColor: '#12121A' }}>CPA</option>
                      <option value="roas" style={{ backgroundColor: '#12121A' }}>ROAS</option>
                      <option value="ctr" style={{ backgroundColor: '#12121A' }}>CTR</option>
                      <option value="cpc" style={{ backgroundColor: '#12121A' }}>CPC</option>
                      <option value="impressions" style={{ backgroundColor: '#12121A' }}>Impressões</option>
                      <option value="conversions" style={{ backgroundColor: '#12121A' }}>Conversões</option>
                      <option value="frequency" style={{ backgroundColor: '#12121A' }}>Frequência</option>
                    </select>
                    <select
                      value={formData.conditionOperator}
                      onChange={(e) => setFormData({ ...formData, conditionOperator: e.target.value })}
                      style={{
                        width: '120px',
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    >
                      <option value="gt" style={{ backgroundColor: '#12121A' }}>Maior que</option>
                      <option value="lt" style={{ backgroundColor: '#12121A' }}>Menor que</option>
                      <option value="eq" style={{ backgroundColor: '#12121A' }}>Igual a</option>
                      <option value="gte" style={{ backgroundColor: '#12121A' }}>Maior ou igual</option>
                      <option value="lte" style={{ backgroundColor: '#12121A' }}>Menor ou igual</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Valor"
                      value={formData.conditionValue}
                      onChange={(e) => setFormData({ ...formData, conditionValue: e.target.value })}
                      style={{
                        width: '100px',
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Timeframe */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Período de Análise
                  </label>
                  <select
                    value={formData.timeframe}
                    onChange={(e) => setFormData({ ...formData, timeframe: e.target.value as any })}
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
                    }}
                  >
                    <option value="hour" style={{ backgroundColor: '#12121A' }}>Última hora</option>
                    <option value="day" style={{ backgroundColor: '#12121A' }}>Último dia</option>
                    <option value="week" style={{ backgroundColor: '#12121A' }}>Última semana</option>
                  </select>
                </div>

                {/* Action */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Ação
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'pause', label: 'Pausar', icon: Pause },
                      { id: 'activate', label: 'Ativar', icon: Play },
                      { id: 'adjust_budget', label: 'Ajustar Budget', icon: DollarSign },
                      { id: 'notify', label: 'Notificar', icon: Bell },
                    ].map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, actionType: action.id as any })}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: formData.actionType === action.id ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: formData.actionType === action.id ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <action.icon size={16} style={{ color: formData.actionType === action.id ? '#10B981' : '#6B6B7B' }} />
                        <span style={{ fontSize: '14px' }}>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                    Aplicar em
                  </label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value as any })}
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
                    }}
                  >
                    <option value="campaign" style={{ backgroundColor: '#12121A' }}>Campanha</option>
                    <option value="adset" style={{ backgroundColor: '#12121A' }}>Conjunto de Anúncios</option>
                    <option value="ad" style={{ backgroundColor: '#12121A' }}>Anúncio</option>
                  </select>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <Button type="button" variant="ghost" onClick={() => { setShowCreateModal(false); resetForm(); }} style={{ flex: 1 }}>
                    Cancelar
                  </Button>
                  <Button type="button" variant="primary" onClick={handleCreateAutomation} style={{ flex: 1 }}>
                    Criar Automação
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '400px',
                background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <Trash2 size={24} style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Excluir Automação</h2>
                  <p style={{ fontSize: '14px', color: '#6B6B7B', margin: '4px 0 0' }}>Esta ação não pode ser desfeita</p>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#A0A0B0', marginBottom: '24px', lineHeight: '1.6' }}>
                Tem certeza que deseja excluir esta automação? Ela será removida permanentemente.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                  Cancelar
                </Button>
                <button
                  onClick={() => handleDeleteAutomation(showDeleteConfirm)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backgroundColor: '#EF4444',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Edição */}
      <AnimatePresence>
        {editingAutomation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingAutomation(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
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
                  <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <Edit size={20} style={{ color: '#3B82F6' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Editar Automação</h2>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Atualize os dados da automação</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingAutomation(null)}
                  style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                >
                  <Plus style={{ width: '20px', height: '20px', transform: 'rotate(45deg)' }} />
                </button>
              </div>

              {/* Form */}
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Nome</label>
                  <input
                    type="text"
                    value={editingAutomation.name}
                    onChange={(e) => setEditingAutomation({ ...editingAutomation, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Status</label>
                  <select
                    value={editingAutomation.status}
                    onChange={(e) => setEditingAutomation({ ...editingAutomation, status: e.target.value as 'active' | 'paused' })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  >
                    <option value="active" style={{ backgroundColor: '#12121A' }}>Ativo</option>
                    <option value="paused" style={{ backgroundColor: '#12121A' }}>Pausado</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                <Button variant="secondary" onClick={() => setEditingAutomation(null)}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleSaveEdit}>
                  Salvar Alterações
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AutomationCard({
  automation,
  index,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  automation: Automation
  index: number
  onEdit: (automation: Automation) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const colors = automationTypeColors[automation.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        borderRadius: '16px',
        backgroundColor: 'rgba(18, 18, 26, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.2s',
      }}
    >
      {/* Main Content */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '20px',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: colors.bg,
              color: colors.color,
            }}>
              <Zap size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                  {automation.name}
                </h3>
                <Badge variant={automation.status === 'active' ? 'success' : 'warning'}>
                  {automation.status === 'active' ? 'Ativo' : 'Pausado'}
                </Badge>
                <span style={{
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#6B6B7B',
                }}>
                  {automationTypeLabels[automation.type]}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#6B6B7B' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Activity size={12} />
                  {automation.triggerCount} execuções
                </span>
                {automation.lastTriggered && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    Último: {new Date(automation.lastTriggered).toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              style={{
                padding: '6px',
                borderRadius: '8px',
                background: 'none',
                border: 'none',
                color: '#6B6B7B',
                cursor: 'pointer',
              }}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#6B6B7B',
                  cursor: 'pointer',
                }}
              >
                <MoreVertical size={16} />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '4px',
                      width: '160px',
                      backgroundColor: '#1A1A25',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      overflow: 'hidden',
                      zIndex: 10,
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(false)
                        onEdit(automation)
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        fontSize: '14px',
                        background: 'none',
                        border: 'none',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        borderRadius: '8px',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Edit size={14} style={{ color: '#3B82F6' }} />
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(false)
                        onToggleStatus(automation.id)
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        fontSize: '14px',
                        background: 'none',
                        border: 'none',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        borderRadius: '8px',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {automation.status === 'active' ? (
                        <>
                          <Pause size={14} style={{ color: '#FACC15' }} />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play size={14} style={{ color: '#34D399' }} />
                          Ativar
                        </>
                      )}
                    </button>
                    <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '4px 0' }} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(false)
                        onDelete(automation.id)
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        fontSize: '14px',
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        borderRadius: '8px',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Conditions */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 500, color: '#6B6B7B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  Condições
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Suporta formato antigo (conditions array) e novo (condition objeto) */}
                  {(automation.conditions?.length > 0 ? automation.conditions :
                    (automation as any).condition ? [{
                      metric: (automation as any).condition.metric,
                      operator: operatorFromApi[(automation as any).condition.operator] || (automation as any).condition.operator,
                      value: (automation as any).condition.value,
                      timeframe: ((automation as any).period || 'last_day').replace('last_', '')
                    }] : []
                  ).map((condition: any, i: number) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }}>
                      <Target size={14} style={{ color: '#3B82F6' }} />
                      <span style={{ fontSize: '14px', color: '#FFFFFF' }}>
                        {condition.metric?.toUpperCase()} {operatorLabels[condition.operator] || condition.operator} {condition.value}
                      </span>
                      <span style={{ fontSize: '12px', color: '#6B6B7B' }}>
                        (por {condition.timeframe === 'hour' ? 'hora' : condition.timeframe === 'day' ? 'dia' : 'semana'})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 500, color: '#6B6B7B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  Ações
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Suporta formato antigo (actions array) e novo (action string) */}
                  {(automation.actions?.length > 0 ? automation.actions :
                    (automation as any).action ? [{
                      type: (automation as any).action,
                      value: (automation as any).actionValue,
                      target: ((automation as any).applyTo || 'campaign').replace('ad_set', 'adset')
                    }] : []
                  ).map((action: any, i: number) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                    }}>
                      <div style={{
                        padding: '6px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981',
                      }}>
                        {actionIcons[action.type] || <Zap size={14} />}
                      </div>
                      <span style={{ fontSize: '14px', color: '#FFFFFF' }}>
                        {actionLabels[action.type] || action.type}
                        {action.value && ` em ${action.value}%`}
                      </span>
                      <ArrowRight size={14} style={{ color: '#6B6B7B' }} />
                      <span style={{ fontSize: '12px', color: '#6B6B7B' }}>
                        {action.target === 'campaign' ? 'Campanha' : action.target === 'adset' || action.target === 'ad_set' ? 'Conjunto' : 'Anúncio'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function LeadAutomationCard({
  automation,
  index,
}: {
  automation: LeadAutomation
  index: number
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const colors = leadAutomationTypeColors[automation.type]

  const getTriggerDescription = () => {
    switch (automation.type) {
      case 'lead_remarketing':
        return `Leads perdidos ha ${automation.trigger.lostDaysAgo || 30} dias`
      case 'lead_inactivity':
        return `Leads inativos por ${automation.trigger.inactiveDays || 7} dias`
      case 'lead_status_change':
        return `Mudanca de ${leadStatusLabels[automation.trigger.fromStatus || 'NEW']} para ${leadStatusLabels[automation.trigger.toStatus || 'REMARKETING']}`
      default:
        return 'Gatilho configurado'
    }
  }

  const getActionDescription = () => {
    switch (automation.action.type) {
      case 'change_status':
        return `Alterar para ${leadStatusLabels[automation.action.newStatus || 'REMARKETING']}`
      case 'send_message':
        return `Enviar ${automation.action.messageChannel === 'whatsapp' ? 'WhatsApp' : automation.action.messageChannel === 'email' ? 'Email' : 'SMS'}`
      case 'create_task':
        return automation.action.taskTitle || 'Criar tarefa'
      case 'notify':
        return automation.action.notificationMessage || 'Enviar notificacao'
      default:
        return 'Acao configurada'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        borderRadius: '16px',
        backgroundColor: 'rgba(18, 18, 26, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.2s',
      }}
    >
      {/* Main Content */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '20px',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: colors.bg,
              color: colors.color,
            }}>
              <RefreshCw size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                  {automation.name}
                </h3>
                <Badge variant={automation.status === 'active' ? 'success' : 'warning'}>
                  {automation.status === 'active' ? 'Ativo' : 'Pausado'}
                </Badge>
                <span style={{
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: colors.bg,
                  color: colors.color,
                }}>
                  {leadAutomationTypeLabels[automation.type]}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#6B6B7B' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Activity size={12} />
                  {automation.executionCount || 0} execucoes
                </span>
                {automation.lastExecutedAt && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    Ultimo: {new Date(automation.lastExecutedAt).toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'none',
              border: 'none',
              color: '#6B6B7B',
              cursor: 'pointer',
            }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Trigger */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 500, color: '#6B6B7B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  Gatilho
                </h4>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}>
                  <Target size={14} style={{ color: '#A855F7' }} />
                  <span style={{ fontSize: '14px', color: '#FFFFFF' }}>
                    {getTriggerDescription()}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 500, color: '#6B6B7B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  Acao
                </h4>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}>
                  <div style={{
                    padding: '6px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981',
                  }}>
                    {leadActionIcons[automation.action.type] || <Zap size={14} />}
                  </div>
                  <span style={{ fontSize: '14px', color: '#FFFFFF' }}>
                    {getActionDescription()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
