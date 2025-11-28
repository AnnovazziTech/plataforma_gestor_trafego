'use client'

import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, PlatformIcon, StatCard } from '@/components/ui'
import { reports } from '@/data/mock-data'
import { useApp } from '@/contexts'
import {
  FileText,
  Plus,
  Download,
  Calendar,
  Clock,
  Users,
  Mail,
  Edit,
  Trash2,
  Play,
  Pause,
  MoreVertical,
  BarChart3,
  PieChart,
  Target,
  TrendingUp,
  Eye,
  Share2,
  Copy,
  Check,
  X,
  CalendarClock,
  Send,
  MessageCircle,
} from 'lucide-react'
import { Report, Platform } from '@/types'

const reportTypeLabels: Record<string, string> = {
  performance: 'Performance',
  audience: 'Audiência',
  creative: 'Criativos',
  custom: 'Personalizado',
}

const reportTypeIcons: Record<string, ReactNode> = {
  performance: <BarChart3 size={18} />,
  audience: <Users size={18} />,
  creative: <PieChart size={18} />,
  custom: <Target size={18} />,
}

const frequencyLabels: Record<string, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  custom: 'Personalizado',
}

const metricsOptions = [
  { id: 'impressions', label: 'Impressões' },
  { id: 'clicks', label: 'Cliques' },
  { id: 'ctr', label: 'CTR' },
  { id: 'cpc', label: 'CPC' },
  { id: 'conversions', label: 'Conversões' },
  { id: 'investment', label: 'Investimento' },
  { id: 'roas', label: 'ROAS' },
  { id: 'cpa', label: 'CPA' },
  { id: 'reach', label: 'Alcance' },
  { id: 'frequency', label: 'Frequência' },
]

export default function ReportsPage() {
  const { connectedAccounts, showToast } = useApp()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduledReports, setScheduledReports] = useState<any[]>([])
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null)

  return (
    <div className="min-h-screen">
      <Header
        title="Relatórios"
        subtitle="Crie e gerencie relatórios automatizados"
        showCreateButton={false}
      />

      <main className="p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Relatórios Ativos"
            value={reports.filter(r => r.status === 'active').length}
            icon={FileText}
            color="blue"
            delay={0}
          />
          <StatCard
            label="Gerados Este Mês"
            value={24}
            icon={Download}
            color="yellow"
            delay={0.1}
          />
          <StatCard
            label="Destinatários"
            value={8}
            icon={Mail}
            color="blue"
            delay={0.2}
          />
          <StatCard
            label="Programados"
            value={scheduledReports.length}
            icon={CalendarClock}
            color="yellow"
            delay={0.3}
          />
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Meus Relatórios</h2>
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="gap-2" onClick={() => setShowScheduleModal(true)}>
              <CalendarClock size={18} />
              Programar
            </Button>
            <Button variant="primary" className="gap-2" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              Novo Relatório
            </Button>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report, index) => (
            <ReportCard key={report.id} report={report} index={index} />
          ))}

          {/* Create New Report Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reports.length * 0.1 }}
            onClick={() => setShowCreateModal(true)}
            className="p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#3B82F6]/30 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group min-h-[280px]"
          >
            <div className="p-4 rounded-full bg-white/5 group-hover:bg-[#3B82F6]/10 transition-colors">
              <Plus size={24} className="text-[#6B6B7B] group-hover:text-[#3B82F6] transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white mb-1">Criar Novo Relatório</p>
              <p className="text-xs text-[#6B6B7B]">Configure relatórios automáticos</p>
            </div>
          </motion.div>
        </div>

        {/* Report Templates */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-white mb-6">Templates Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Performance Semanal', description: 'Métricas de performance completas', icon: TrendingUp, color: 'blue' },
              { name: 'Análise de Audiência', description: 'Demografia e comportamento', icon: Users, color: 'blue' },
              { name: 'ROI por Plataforma', description: 'Comparativo de retorno', icon: BarChart3, color: 'yellow' },
              { name: 'Criativos Top', description: 'Melhores anúncios e copies', icon: Eye, color: 'yellow' },
            ].map((template, index) => (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#3B82F6]/30 cursor-pointer transition-all group"
              >
                <div className={`p-3 rounded-xl mb-4 w-fit ${
                  template.color === 'blue' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-[#FACC15]/10 text-[#FACC15]'
                }`}>
                  <template.icon size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-[#3B82F6] transition-colors">
                  {template.name}
                </h3>
                <p className="text-xs text-[#6B6B7B]">{template.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Criar Relatório */}
      <CreateReportModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        connectedAccounts={connectedAccounts}
      />

      {/* Modal Programar Relatório */}
      <ScheduleReportModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false)
          setEditingSchedule(null)
        }}
        connectedAccounts={connectedAccounts}
        scheduledReports={scheduledReports}
        onSave={(schedule) => {
          if (editingSchedule) {
            setScheduledReports(prev => prev.map(s => s.id === editingSchedule.id ? { ...schedule, id: editingSchedule.id } : s))
          } else {
            setScheduledReports(prev => [...prev, { ...schedule, id: Date.now().toString() }])
          }
          setEditingSchedule(null)
          showToast('Relatório programado com sucesso!', 'success')
        }}
        onEdit={(schedule) => setEditingSchedule(schedule)}
        onDelete={(id) => {
          setScheduledReports(prev => prev.filter(s => s.id !== id))
          showToast('Programação removida!', 'info')
        }}
        editingSchedule={editingSchedule}
      />
    </div>
  )
}

function CreateReportModal({ isOpen, onClose, connectedAccounts }: { isOpen: boolean; onClose: () => void; connectedAccounts: any[] }) {
  const { showToast } = useApp()
  const [formData, setFormData] = useState({
    account: '',
    platform: '',
    startDate: '',
    endDate: '',
    name: '',
    metrics: [] as string[],
  })

  const handleMetricToggle = (metricId: string) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }))
  }

  const handleExport = (type: 'email' | 'whatsapp' | 'download') => {
    if (!formData.name || !formData.account || !formData.platform || !formData.startDate || !formData.endDate) {
      showToast('Preencha todos os campos obrigatórios', 'error')
      return
    }
    if (formData.metrics.length === 0) {
      showToast('Selecione pelo menos uma métrica', 'error')
      return
    }

    const messages = {
      email: 'Relatório enviado por e-mail!',
      whatsapp: 'Relatório enviado por WhatsApp!',
      download: 'Relatório baixado com sucesso!'
    }
    showToast(messages[type], 'success')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-gradient-to-br from-[#12121A] to-[#0D0D14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#3B82F6]/10">
                  <FileText className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Criar Novo Relatório</h2>
                  <p className="text-sm text-[#6B6B7B]">Configure os detalhes do relatório</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-[#6B6B7B] hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Conta de anúncios */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Conta de Anúncios *</label>
                <select
                  value={formData.account}
                  onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50"
                >
                  <option value="">Selecione uma conta</option>
                  {connectedAccounts.filter(a => a.connected).map((account) => (
                    <option key={account.id} value={account.id} className="bg-[#12121A]">
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plataforma */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Plataforma Ads *</label>
                <div className="grid grid-cols-4 gap-3">
                  {['meta', 'google', 'linkedin', 'tiktok'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setFormData(prev => ({ ...prev, platform }))}
                      className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                        formData.platform === platform
                          ? 'bg-[#3B82F6]/10 border-[#3B82F6]/50'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <PlatformIcon platform={platform as Platform} size={24} />
                      <span className="text-xs text-white capitalize">{platform === 'meta' ? 'Meta Ads' : `${platform} Ads`}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Data Início *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Data Fim *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50"
                  />
                </div>
              </div>

              {/* Nome do Relatório */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nome do Relatório *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Relatório Mensal - Cliente X"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]/50"
                />
              </div>

              {/* Métricas */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Métricas do Relatório</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {metricsOptions.map((metric) => (
                    <button
                      key={metric.id}
                      onClick={() => handleMetricToggle(metric.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        formData.metrics.includes(metric.id)
                          ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30'
                          : 'bg-white/5 text-[#A0A0B0] border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {metric.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-white/10 bg-white/[0.02]">
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <div className="flex items-center gap-2">
                <Button variant="secondary" className="gap-2" onClick={() => handleExport('email')}>
                  <Mail size={16} />
                  Enviar E-mail
                </Button>
                <Button variant="secondary" className="gap-2" onClick={() => handleExport('whatsapp')}>
                  <MessageCircle size={16} />
                  WhatsApp
                </Button>
                <Button variant="primary" className="gap-2" onClick={() => handleExport('download')}>
                  <Download size={16} />
                  Baixar PDF
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ScheduleReportModal({
  isOpen,
  onClose,
  connectedAccounts,
  scheduledReports,
  onSave,
  onEdit,
  onDelete,
  editingSchedule
}: {
  isOpen: boolean
  onClose: () => void
  connectedAccounts: any[]
  scheduledReports: any[]
  onSave: (schedule: any) => void
  onEdit: (schedule: any) => void
  onDelete: (id: string) => void
  editingSchedule: any | null
}) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    account: '',
    platform: '',
    startDate: '',
    endDate: '',
    name: '',
    metrics: [] as string[],
    days: [] as number[],
    months: [] as number[],
    sendMethod: 'email' as 'email' | 'whatsapp',
    recipient: '',
  })

  const handleMetricToggle = (metricId: string) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }))
  }

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }))
  }

  const handleMonthToggle = (month: number) => {
    setFormData(prev => ({
      ...prev,
      months: prev.months.includes(month)
        ? prev.months.filter(m => m !== month)
        : [...prev.months, month]
    }))
  }

  const handleSave = () => {
    onSave(formData)
    setShowForm(false)
    setFormData({
      account: '',
      platform: '',
      startDate: '',
      endDate: '',
      name: '',
      metrics: [],
      days: [],
      months: [],
      sendMethod: 'email',
      recipient: '',
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-gradient-to-br from-[#12121A] to-[#0D0D14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#FACC15]/10">
                  <CalendarClock className="w-5 h-5 text-[#FACC15]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Programar Relatórios</h2>
                  <p className="text-sm text-[#6B6B7B]">Configure envios automáticos para seus clientes</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-[#6B6B7B] hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!showForm && !editingSchedule ? (
                <>
                  {/* Lista de relatórios programados */}
                  {scheduledReports.length > 0 ? (
                    <div className="space-y-3 mb-6">
                      <h3 className="text-sm font-medium text-white mb-3">Relatórios Programados</h3>
                      {scheduledReports.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">{schedule.name}</p>
                            <p className="text-xs text-[#6B6B7B]">
                              Dias: {schedule.days.join(', ')} | Via {schedule.sendMethod === 'email' ? 'E-mail' : 'WhatsApp'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onEdit(schedule)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#6B6B7B] hover:text-white transition-all"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => onDelete(schedule.id)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-[#6B6B7B] hover:text-red-400 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                        <CalendarClock className="w-8 h-8 text-[#6B6B7B]" />
                      </div>
                      <p className="text-sm text-[#6B6B7B] mb-2">Nenhum relatório programado</p>
                      <p className="text-xs text-[#4B4B5B]">Crie sua primeira programação de envio automático</p>
                    </div>
                  )}

                  <Button variant="primary" className="w-full gap-2" onClick={() => setShowForm(true)}>
                    <Plus size={18} />
                    Criar Programação
                  </Button>
                </>
              ) : (
                <div className="space-y-5">
                  {/* Formulário de programação */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Nome da Programação *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Relatório Semanal - Cliente X"
                      className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Conta de Anúncios</label>
                      <select
                        value={formData.account}
                        onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
                        className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50"
                      >
                        <option value="">Selecione</option>
                        {connectedAccounts.filter(a => a.connected).map((account) => (
                          <option key={account.id} value={account.id} className="bg-[#12121A]">
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Plataforma</label>
                      <select
                        value={formData.platform}
                        onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                        className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50"
                      >
                        <option value="">Selecione</option>
                        <option value="meta" className="bg-[#12121A]">Meta Ads</option>
                        <option value="google" className="bg-[#12121A]">Google Ads</option>
                        <option value="linkedin" className="bg-[#12121A]">LinkedIn Ads</option>
                        <option value="tiktok" className="bg-[#12121A]">TikTok Ads</option>
                      </select>
                    </div>
                  </div>

                  {/* Dias do mês */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Dias do Mês para Envio</label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 5, 10, 15, 20, 25, 30].map((day) => (
                        <button
                          key={day}
                          onClick={() => handleDayToggle(day)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                            formData.days.includes(day)
                              ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30'
                              : 'bg-white/5 text-[#A0A0B0] border border-white/10'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meses */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Meses para Envio</label>
                    <div className="grid grid-cols-6 gap-2">
                      {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((month, idx) => (
                        <button
                          key={month}
                          onClick={() => handleMonthToggle(idx + 1)}
                          className={`py-2 rounded-lg text-xs font-medium transition-all ${
                            formData.months.includes(idx + 1)
                              ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30'
                              : 'bg-white/5 text-[#A0A0B0] border border-white/10'
                          }`}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Métricas */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Métricas</label>
                    <div className="grid grid-cols-5 gap-2">
                      {metricsOptions.slice(0, 5).map((metric) => (
                        <button
                          key={metric.id}
                          onClick={() => handleMetricToggle(metric.id)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            formData.metrics.includes(metric.id)
                              ? 'bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/30'
                              : 'bg-white/5 text-[#A0A0B0] border border-white/10'
                          }`}
                        >
                          {metric.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Método de envio */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Enviar Via</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, sendMethod: 'email' }))}
                        className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                          formData.sendMethod === 'email'
                            ? 'bg-[#3B82F6]/10 border-[#3B82F6]/50'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <Mail size={20} className={formData.sendMethod === 'email' ? 'text-[#3B82F6]' : 'text-[#6B6B7B]'} />
                        <span className="text-sm text-white">E-mail</span>
                      </button>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, sendMethod: 'whatsapp' }))}
                        className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                          formData.sendMethod === 'whatsapp'
                            ? 'bg-[#25D366]/10 border-[#25D366]/50'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <MessageCircle size={20} className={formData.sendMethod === 'whatsapp' ? 'text-[#25D366]' : 'text-[#6B6B7B]'} />
                        <span className="text-sm text-white">WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  {/* Destinatário */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      {formData.sendMethod === 'email' ? 'E-mail do Destinatário' : 'WhatsApp do Destinatário'}
                    </label>
                    <input
                      type={formData.sendMethod === 'email' ? 'email' : 'tel'}
                      value={formData.recipient}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                      placeholder={formData.sendMethod === 'email' ? 'cliente@email.com' : '+55 11 99999-9999'}
                      className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {(showForm || editingSchedule) && (
              <div className="flex items-center justify-between p-6 border-t border-white/10 bg-white/[0.02]">
                <Button variant="ghost" onClick={() => {
                  setShowForm(false)
                  onClose()
                }}>
                  Cancelar
                </Button>
                <Button variant="primary" className="gap-2" onClick={handleSave}>
                  <CalendarClock size={16} />
                  Programar
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ReportCard({ report, index }: { report: Report; index: number }) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group p-5 rounded-2xl bg-[#12121A]/80 border border-white/5 hover:border-[#3B82F6]/30 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            report.type === 'performance' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' :
            report.type === 'audience' ? 'bg-[#60A5FA]/10 text-[#60A5FA]' :
            report.type === 'creative' ? 'bg-[#FACC15]/10 text-[#FACC15]' :
            'bg-[#FDE047]/10 text-[#FDE047]'
          }`}>
            {reportTypeIcons[report.type]}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-[#3B82F6] transition-colors">
              {report.name}
            </h3>
            <p className="text-xs text-[#6B6B7B]">{reportTypeLabels[report.type]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={report.status === 'active' ? 'success' : 'warning'}>
            {report.status === 'active' ? 'Ativo' : 'Pausado'}
          </Badge>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
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
                  className="absolute right-0 top-full mt-1 w-40 bg-[#1A1A25] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10"
                >
                  {[
                    { icon: Edit, label: 'Editar' },
                    { icon: Download, label: 'Baixar' },
                    { icon: Share2, label: 'Compartilhar' },
                    { icon: report.status === 'active' ? Pause : Play, label: report.status === 'active' ? 'Pausar' : 'Ativar' },
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

      {/* Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-xs text-[#6B6B7B]">
          <Clock size={12} />
          <span>Frequência: {frequencyLabels[report.frequency]}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6B6B7B]">
          <Calendar size={12} />
          <span>
            {new Date(report.dateRange.start).toLocaleDateString('pt-BR')} - {new Date(report.dateRange.end).toLocaleDateString('pt-BR')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6B6B7B]">
          <Mail size={12} />
          <span>{report.recipients.length} destinatário(s)</span>
        </div>
      </div>

      {/* Platforms */}
      <div className="flex items-center gap-2 mb-4">
        {report.platforms.map((platform) => (
          <div key={platform} className="p-1.5 rounded-lg bg-white/5">
            <PlatformIcon platform={platform} size={14} />
          </div>
        ))}
      </div>

      {/* Last Generated */}
      {report.lastGenerated && (
        <div className="pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B6B7B]">Última geração</span>
            <span className="text-xs text-white">
              {new Date(report.lastGenerated).toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        <Button variant="secondary" size="sm" className="flex-1 gap-1.5">
          <Download size={14} />
          Baixar
        </Button>
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#6B6B7B] hover:text-white transition-all"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
    </motion.div>
  )
}
