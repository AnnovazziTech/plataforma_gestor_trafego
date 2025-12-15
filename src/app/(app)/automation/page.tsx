'use client'

import { useState, ReactNode, useMemo } from 'react'
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
} from 'lucide-react'
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

export default function AutomationPage() {
  const { automations } = useApp()
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Use automations from context with fallback to empty array
  const automationsData = useMemo(() => automations || [], [automations])

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
          {automationsData.map((automation, index) => (
            <AutomationCard key={automation.id} automation={automation as Automation} index={index} />
          ))}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Então:</span>
                    <span style={{ fontSize: '12px', color: '#3B82F6' }}>{template.action}</span>
                  </div>
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
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <type.icon size={20} style={{ color: '#3B82F6' }} />
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
                      <option value="cpa">CPA</option>
                      <option value="roas">ROAS</option>
                      <option value="ctr">CTR</option>
                      <option value="cpc">CPC</option>
                      <option value="impressions">Impressões</option>
                      <option value="conversions">Conversões</option>
                    </select>
                    <select
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
                      <option value="gt">Maior que</option>
                      <option value="lt">Menor que</option>
                      <option value="eq">Igual a</option>
                      <option value="gte">Maior ou igual</option>
                      <option value="lte">Menor ou igual</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Valor"
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
                    <option value="hour">Última hora</option>
                    <option value="day">Último dia</option>
                    <option value="week">Última semana</option>
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
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <action.icon size={16} style={{ color: '#10B981' }} />
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
                    <option value="campaign">Campanha</option>
                    <option value="adset">Conjunto de Anúncios</option>
                    <option value="ad">Anúncio</option>
                  </select>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>
                    Cancelar
                  </Button>
                  <Button type="button" variant="primary" onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>
                    Criar Automação
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

function AutomationCard({ automation, index }: { automation: Automation; index: number }) {
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
                    {[
                      { icon: Edit, label: 'Editar' },
                      { icon: automation.status === 'active' ? Pause : Play, label: automation.status === 'active' ? 'Pausar' : 'Ativar' },
                      { icon: Trash2, label: 'Excluir', danger: true },
                    ].map((action) => (
                      <button
                        key={action.label}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          fontSize: '14px',
                          background: 'none',
                          border: 'none',
                          color: action.danger ? '#EF4444' : '#A0A0B0',
                          cursor: 'pointer',
                        }}
                      >
                        <action.icon size={14} />
                        {action.label}
                      </button>
                    ))}
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
                  {automation.conditions.map((condition, i) => (
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
                        {condition.metric} {operatorLabels[condition.operator]} {condition.value}
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
                  {automation.actions.map((action, i) => (
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
                        {actionIcons[action.type]}
                      </div>
                      <span style={{ fontSize: '14px', color: '#FFFFFF' }}>
                        {actionLabels[action.type]}
                        {action.value && ` em ${action.value}%`}
                      </span>
                      <ArrowRight size={14} style={{ color: '#6B6B7B' }} />
                      <span style={{ fontSize: '12px', color: '#6B6B7B' }}>
                        {action.target === 'campaign' ? 'Campanha' : action.target === 'adset' ? 'Conjunto' : 'Anúncio'}
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
