'use client'

import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { automations } from '@/data/mock-data'
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
  TrendingDown,
  DollarSign,
  Bell,
  Settings,
  ArrowRight,
  CheckCircle,
  Activity,
} from 'lucide-react'
import { Automation } from '@/types'

const automationTypeLabels: Record<string, string> = {
  rule: 'Regra',
  schedule: 'Agendamento',
  trigger: 'Gatilho',
}

const automationTypeColors: Record<string, string> = {
  rule: 'bg-[#00F5FF]/10 text-[#00F5FF]',
  schedule: 'bg-[#BF00FF]/10 text-[#BF00FF]',
  trigger: 'bg-[#FF6B00]/10 text-[#FF6B00]',
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
  const [showCreateModal, setShowCreateModal] = useState(false)

  const totalTriggers = automations.reduce((acc, a) => acc + a.triggerCount, 0)
  const activeAutomations = automations.filter(a => a.status === 'active').length

  return (
    <div className="min-h-screen">
      <Header
        title="Automacao"
        subtitle="Configure regras e gatilhos automaticos para suas campanhas"
      />

      <main className="p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Automacoes Ativas', value: activeAutomations, icon: Zap, color: 'cyan' },
            { label: 'Gatilhos Executados', value: totalTriggers, icon: Activity, color: 'purple' },
            { label: 'Campanhas Otimizadas', value: 18, icon: Target, color: 'green' },
            { label: 'Economia Estimada', value: 'R$ 12.450', icon: DollarSign, color: 'orange' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#6B6B7B] mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${
                  stat.color === 'cyan' ? 'bg-[#00F5FF]/10 text-[#00F5FF]' :
                  stat.color === 'purple' ? 'bg-[#BF00FF]/10 text-[#BF00FF]' :
                  stat.color === 'green' ? 'bg-[#00FF88]/10 text-[#00FF88]' :
                  'bg-[#FF6B00]/10 text-[#FF6B00]'
                }`}>
                  <stat.icon size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Minhas Automacoes</h2>
          <Button variant="primary" className="gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            Nova Automacao
          </Button>
        </div>

        {/* Automations List */}
        <div className="space-y-4 mb-12">
          {automations.map((automation, index) => (
            <AutomationCard key={automation.id} automation={automation} index={index} />
          ))}
        </div>

        {/* Quick Templates */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-6">Templates Populares</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Pausar CPA Alto',
                description: 'Pausa automaticamente campanhas com custo por aquisicao acima do limite',
                icon: AlertTriangle,
                color: 'red',
                conditions: 'CPA > R$50 por 3 dias',
                action: 'Pausar campanha',
              },
              {
                title: 'Escalar ROAS Alto',
                description: 'Aumenta o budget de campanhas com alto retorno sobre investimento',
                icon: TrendingUp,
                color: 'green',
                conditions: 'ROAS >= 4x por 7 dias',
                action: 'Aumentar budget em 20%',
              },
              {
                title: 'Alerta CTR Baixo',
                description: 'Envia notificacao quando a taxa de cliques cai abaixo do esperado',
                icon: Bell,
                color: 'orange',
                conditions: 'CTR < 1% com 10K+ impressoes',
                action: 'Enviar notificacao',
              },
              {
                title: 'Redistribuir Budget',
                description: 'Move budget de campanhas ruins para as melhores automaticamente',
                icon: DollarSign,
                color: 'cyan',
                conditions: 'Performance relativa',
                action: 'Redistribuir budget',
              },
              {
                title: 'Pausar Frequencia Alta',
                description: 'Pausa anuncios quando a frequencia fica muito alta',
                icon: Activity,
                color: 'purple',
                conditions: 'Frequencia > 5x',
                action: 'Pausar anuncio',
              },
              {
                title: 'Otimizar Lances',
                description: 'Ajusta lances automaticamente baseado em performance',
                icon: Settings,
                color: 'blue',
                conditions: 'Conversoes por hora',
                action: 'Ajustar lance CPA',
              },
            ].map((template, index) => (
              <motion.div
                key={template.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#00F5FF]/20 cursor-pointer transition-all group"
              >
                <div className={`p-3 rounded-xl mb-4 w-fit ${
                  template.color === 'red' ? 'bg-red-500/10 text-red-400' :
                  template.color === 'green' ? 'bg-[#00FF88]/10 text-[#00FF88]' :
                  template.color === 'orange' ? 'bg-[#FF6B00]/10 text-[#FF6B00]' :
                  template.color === 'cyan' ? 'bg-[#00F5FF]/10 text-[#00F5FF]' :
                  template.color === 'purple' ? 'bg-[#BF00FF]/10 text-[#BF00FF]' :
                  'bg-[#0066FF]/10 text-[#0066FF]'
                }`}>
                  <template.icon size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-[#00F5FF] transition-colors">
                  {template.title}
                </h3>
                <p className="text-xs text-[#6B6B7B] mb-4">{template.description}</p>
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B6B7B]">Se:</span>
                    <span className="text-xs text-[#A0A0B0]">{template.conditions}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B6B7B]">Entao:</span>
                    <span className="text-xs text-[#00F5FF]">{template.action}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function AutomationCard({ automation, index }: { automation: Automation; index: number }) {
  const [showMenu, setShowMenu] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group rounded-2xl bg-[#12121A]/80 border border-white/5 hover:border-[#00F5FF]/20 transition-all overflow-hidden"
    >
      {/* Main Content */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${automationTypeColors[automation.type]}`}>
              <Zap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-sm font-semibold text-white group-hover:text-[#00F5FF] transition-colors">
                  {automation.name}
                </h3>
                <Badge variant={automation.status === 'active' ? 'success' : 'warning'}>
                  {automation.status === 'active' ? 'Ativo' : 'Pausado'}
                </Badge>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[#6B6B7B]">
                  {automationTypeLabels[automation.type]}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#6B6B7B]">
                <span className="flex items-center gap-1">
                  <Activity size={12} />
                  {automation.triggerCount} execucoes
                </span>
                {automation.lastTriggered && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    Ultimo: {new Date(automation.lastTriggered).toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#6B6B7B] hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={16} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-4 top-14 w-40 bg-[#1A1A25] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10"
                >
                  {[
                    { icon: Edit, label: 'Editar' },
                    { icon: automation.status === 'active' ? Pause : Play, label: automation.status === 'active' ? 'Pausar' : 'Ativar' },
                    { icon: Trash2, label: 'Excluir', danger: true },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors ${action.danger ? 'text-red-400' : 'text-[#A0A0B0]'}`}
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

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5"
          >
            <div className="p-5 space-y-4">
              {/* Conditions */}
              <div>
                <h4 className="text-xs font-medium text-[#6B6B7B] uppercase tracking-wider mb-3">Condicoes</h4>
                <div className="space-y-2">
                  {automation.conditions.map((condition, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
                      <Target size={14} className="text-[#00F5FF]" />
                      <span className="text-sm text-white">
                        {condition.metric} {operatorLabels[condition.operator]} {condition.value}
                      </span>
                      <span className="text-xs text-[#6B6B7B]">
                        (por {condition.timeframe === 'hour' ? 'hora' : condition.timeframe === 'day' ? 'dia' : 'semana'})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-xs font-medium text-[#6B6B7B] uppercase tracking-wider mb-3">Acoes</h4>
                <div className="space-y-2">
                  {automation.actions.map((action, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-[#00FF88]/5 border border-[#00FF88]/20">
                      <div className="p-1.5 rounded bg-[#00FF88]/10 text-[#00FF88]">
                        {actionIcons[action.type]}
                      </div>
                      <span className="text-sm text-white">
                        {actionLabels[action.type]}
                        {action.value && ` em ${action.value}%`}
                      </span>
                      <ArrowRight size={14} className="text-[#6B6B7B]" />
                      <span className="text-xs text-[#6B6B7B]">
                        {action.target === 'campaign' ? 'Campanha' : action.target === 'adset' ? 'Conjunto' : 'Anuncio'}
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
