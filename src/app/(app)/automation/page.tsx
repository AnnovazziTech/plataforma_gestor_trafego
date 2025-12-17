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

export default function AutomationPage() {
  const { automations, automationsLoading, fetchAutomations, addAutomation, updateAutomation, deleteAutomation, toggleAutomationStatus, showToast, connectedAccounts } = useApp()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Buscar automações ao montar o componente
  useEffect(() => {
    fetchAutomations()
  }, [fetchAutomations])

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
        title="Automação"
        subtitle="Configure regras e gatilhos automáticos para suas campanhas"
      />

      <main style={{ padding: '24px 32px', paddingBottom: '80px' }}>
        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <StatCard
            label="Automações Ativas"
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
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Minhas Automações</h2>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} />
              Nova Automação
            </span>
          </Button>
        </div>

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
      </main>

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
